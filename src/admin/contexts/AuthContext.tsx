import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Toaster, toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  user: { id: string; email: string } | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Session timeout: 8 hours
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000

// Rate limiting: max 5 attempts per 15 minutes
const MAX_LOGIN_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000
const RATE_LIMIT_KEY = 'admin_login_attempts'

interface LoginAttempt {
  timestamp: number
  email: string
}

function checkRateLimit(email: string): { allowed: boolean; remainingTime?: number } {
  const attemptsData = localStorage.getItem(RATE_LIMIT_KEY)
  const attempts: LoginAttempt[] = attemptsData ? JSON.parse(attemptsData) : []

  const now = Date.now()
  const recentAttempts = attempts.filter(
    (attempt) => now - attempt.timestamp < RATE_LIMIT_WINDOW
  )

  const userAttempts = recentAttempts.filter((attempt) => attempt.email === email)

  if (userAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    const oldestAttempt = userAttempts[0]
    const remainingTime = RATE_LIMIT_WINDOW - (now - oldestAttempt.timestamp)
    return { allowed: false, remainingTime }
  }

  return { allowed: true }
}

function recordLoginAttempt(email: string) {
  const attemptsData = localStorage.getItem(RATE_LIMIT_KEY)
  const attempts: LoginAttempt[] = attemptsData ? JSON.parse(attemptsData) : []

  const now = Date.now()
  const recentAttempts = attempts.filter(
    (attempt) => now - attempt.timestamp < RATE_LIMIT_WINDOW
  )

  recentAttempts.push({ timestamp: now, email })
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentAttempts))
}

function clearLoginAttempts() {
  localStorage.removeItem(RATE_LIMIT_KEY)
}

async function logLoginAttempt(
  email: string,
  success: boolean,
  userId?: string,
  errorMessage?: string
) {
  try {
    await supabase.from('admin_login_logs').insert({
      email,
      success,
      user_id: userId || null,
      ip_address: null, // Will be handled by Supabase RLS/triggers if needed
      user_agent: navigator.userAgent,
      error_message: errorMessage || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to log login attempt:', error)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())

  // Check initial session
  useEffect(() => {
    checkSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_IN' && currentSession) {
        await handleSessionUpdate(currentSession)
      } else if (event === 'SIGNED_OUT') {
        handleSignOut()
      } else if (event === 'TOKEN_REFRESHED' && currentSession) {
        await handleSessionUpdate(currentSession)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Session timeout monitoring
  useEffect(() => {
    if (!isAuthenticated) return

    const checkTimeout = setInterval(() => {
      const now = Date.now()
      const timeSinceActivity = now - lastActivity

      if (timeSinceActivity > SESSION_TIMEOUT) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.')
        logout()
      }
    }, 60000) // Check every minute

    // Update activity on user interaction
    const updateActivity = () => setLastActivity(Date.now())

    window.addEventListener('mousedown', updateActivity)
    window.addEventListener('keydown', updateActivity)
    window.addEventListener('scroll', updateActivity)
    window.addEventListener('touchstart', updateActivity)

    return () => {
      clearInterval(checkTimeout)
      window.removeEventListener('mousedown', updateActivity)
      window.removeEventListener('keydown', updateActivity)
      window.removeEventListener('scroll', updateActivity)
      window.removeEventListener('touchstart', updateActivity)
    }
  }, [isAuthenticated, lastActivity])

  const checkSession = async () => {
    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (currentSession) {
        await handleSessionUpdate(currentSession)
      }
    } catch (error) {
      console.error('Failed to check session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionUpdate = async (currentSession: Session) => {
    setSession(currentSession)
    setIsAuthenticated(true)
    setUser({
      id: currentSession.user.id,
      email: currentSession.user.email || '',
    })
    setLastActivity(Date.now())
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setUser(null)
    setSession(null)
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check rate limit
      const rateLimitCheck = checkRateLimit(email)
      if (!rateLimitCheck.allowed) {
        const minutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000)
        const errorMsg = `로그인 시도 횟수를 초과했습니다. ${minutes}분 후에 다시 시도해주세요.`

        await logLoginAttempt(email, false, undefined, errorMsg)
        return { success: false, error: errorMsg }
      }

      // Record login attempt
      recordLoginAttempt(email)

      // Attempt login with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        await logLoginAttempt(email, false, undefined, error.message)

        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
        }

        return { success: false, error: '로그인에 실패했습니다. 다시 시도해주세요.' }
      }

      if (data.session) {
        await handleSessionUpdate(data.session)
        await logLoginAttempt(email, true, data.user.id)
        clearLoginAttempts() // Clear rate limit on successful login
        return { success: true }
      }

      return { success: false, error: '로그인에 실패했습니다.' }
    } catch (error) {
      console.error('Login failed:', error)
      const errorMsg = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      await logLoginAttempt(email, false, undefined, errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      handleSignOut()
      clearLoginAttempts()
      toast.success('로그아웃되었습니다.')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('로그아웃에 실패했습니다.')
    }
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, user, session, loading }}
    >
      {children}
      <Toaster position="top-right" />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
