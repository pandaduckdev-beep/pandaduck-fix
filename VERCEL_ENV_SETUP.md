# Vercel 환경 변수 설정 가이드

## 문제
Vercel 배포 시 "Missing Supabase environment variables" 오류 발생

## 해결 방법

### 방법 1: Vercel 대시보드 (추천)

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 클릭
4. 다음 변수들을 추가:

#### VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://ksdzieewawqxoknnptsj.supabase.co
Environments: Production, Preview, Development (모두 체크)
```

#### VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZHppZWV3YXdxeG9rbm5wdHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzAzMzYsImV4cCI6MjA4NDU0NjMzNn0.0l3_ZcS245OZZU4OZwdLc6Y9ojG2qZ9ZDQtBLXIaBqs
Environments: Production, Preview, Development (모두 체크)
```

5. **Save** 클릭
6. **Deployments** 탭으로 이동
7. 최신 배포의 ⋯ 메뉴 클릭 → **Redeploy** 선택

### 방법 2: Vercel CLI

터미널에서 다음 명령어 실행:

```bash
# 프로젝트 연결
vercel link --yes

# Production 환경 변수 추가
echo "https://ksdzieewawqxoknnptsj.supabase.co" | vercel env add VITE_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZHppZWV3YXdxeG9rbm5wdHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzAzMzYsImV4cCI6MjA4NDU0NjMzNn0.0l3_ZcS245OZZU4OZwdLc6Y9ojG2qZ9ZDQtBLXIaBqs" | vercel env add VITE_SUPABASE_ANON_KEY production

# Preview 환경 변수 추가
echo "https://ksdzieewawqxoknnptsj.supabase.co" | vercel env add VITE_SUPABASE_URL preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZHppZWV3YXdxeG9rbm5wdHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzAzMzYsImV4cCI6MjA4NDU0NjMzNn0.0l3_ZcS245OZZU4OZwdLc6Y9ojG2qZ9ZDQtBLXIaBqs" | vercel env add VITE_SUPABASE_ANON_KEY preview

# 재배포
vercel --prod
```

## 확인

환경 변수 설정 후 다음 명령어로 확인:

```bash
vercel env ls
```

## 주의사항

- 환경 변수 추가 후 **반드시 재배포**해야 적용됩니다
- VITE_ 접두사가 있는 환경 변수만 클라이언트 측에서 접근 가능합니다
- Supabase Anon Key는 공개되어도 안전하지만, Service Role Key는 절대 노출하면 안 됩니다
