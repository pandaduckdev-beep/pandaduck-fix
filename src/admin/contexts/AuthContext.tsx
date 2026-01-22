import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Toaster } from 'sonner'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  user: { id: string; email: string } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_KEY = 'admin_authenticated'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true'
  })
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, isAuthenticated.toString())
  }, [isAuthenticated])

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt:', { email })
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .single()

      if (error) {
        throw error
      }

      if (data && data.is_active) {
        setUser({ id: data.id, email: data.email })
        setIsAuthenticated(true)
        return true
      }

      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem(AUTH_KEY)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
      <Toaster />
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
