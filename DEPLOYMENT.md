# 배포 가이드

## Git & GitHub 설정

### 1. Git 사용자 정보 설정 (처음 한 번만)

```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

### 2. 첫 커밋 생성

```bash
git add .
git commit -m "Initial commit: PandaDuck Pix"
```

### 3. GitHub 저장소 생성

1. GitHub (https://github.com) 로그인
2. 우측 상단 "+" → "New repository" 클릭
3. Repository name: `pandaduck-pix` (또는 원하는 이름)
4. Private/Public 선택
5. **"Add a README file" 체크 해제** (이미 로컬에 코드가 있으므로)
6. "Create repository" 클릭

### 4. 원격 저장소 연결 및 푸시

GitHub에서 저장소 생성 후 나오는 명령어 중 "...or push an existing repository" 부분 사용:

```bash
# GitHub 저장소 주소로 변경
git remote add origin https://github.com/your-username/pandaduck-pix.git
git branch -M main
git push -u origin main
```

---

## Vercel 배포

### 방법 1: Vercel 웹사이트에서 배포 (추천)

1. **Vercel 가입**
   - https://vercel.com 접속
   - "Sign Up" → GitHub 계정으로 로그인

2. **프로젝트 Import**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 연결 허용
   - `pandaduck-pix` 저장소 선택
   - "Import" 클릭

3. **프로젝트 설정** (자동 감지됨)
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **환경 변수 설정** (필요한 경우)
   - "Environment Variables" 섹션에서 추가
   - 예: `VITE_API_URL` 등

5. **배포**
   - "Deploy" 클릭
   - 1-2분 후 배포 완료
   - `https://your-project.vercel.app` 형태의 URL 생성

### 방법 2: Vercel CLI로 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 프로젝트 배포
vercel

# Production 배포
vercel --prod
```

---

## 자동 배포 설정

Vercel과 GitHub 연결 시 **자동으로 설정됩니다**:

- ✅ `main` 브랜치에 push → Production 배포
- ✅ Pull Request 생성 → Preview 배포
- ✅ 다른 브랜치에 push → Preview 배포

### 배포 워크플로우

```bash
# 1. 코드 수정
# 2. 변경사항 커밋
git add .
git commit -m "기능 추가: 새로운 서비스 페이지"

# 3. GitHub에 푸시
git push origin main

# 4. Vercel이 자동으로 감지하고 배포 시작 (30초-2분)
# 5. 배포 완료되면 이메일/슬랙 알림 (설정한 경우)
```

---

## 커스텀 도메인 연결

1. Vercel 프로젝트 대시보드 접속
2. "Settings" → "Domains" 클릭
3. 도메인 입력 (예: `pandaduckpix.com`)
4. DNS 레코드 설정 (Vercel이 안내)
   - A 레코드: `76.76.21.21`
   - CNAME 레코드: `cname.vercel-dns.com`

---

## 환경 변수 관리

### Vercel 대시보드에서

1. 프로젝트 → "Settings" → "Environment Variables"
2. 변수 추가:
   - Name: `VITE_API_URL`
   - Value: `https://api.pandaduckpix.com`
   - Environment: Production, Preview, Development 선택

### 로컬 개발용

```bash
# .env 파일 생성 (.env.example 복사)
cp .env.example .env

# .env 파일에 실제 값 입력
VITE_API_URL=http://localhost:5000
```

---

## 배포 상태 확인

- **Vercel 대시보드**: https://vercel.com/dashboard
- **배포 로그**: 각 배포 클릭 → "Building" 로그 확인
- **배포 실패 시**: 로그에서 오류 메시지 확인

---

## 유용한 명령어

```bash
# 로컬 빌드 테스트
npm run build
npm run preview

# Git 상태 확인
git status

# 커밋 히스토리
git log --oneline

# 원격 저장소 확인
git remote -v

# Vercel 프로젝트 정보
vercel ls
```

---

## 배포 체크리스트

- [ ] Git 사용자 정보 설정 완료
- [ ] GitHub 저장소 생성
- [ ] 로컬 코드 푸시 완료
- [ ] Vercel 계정 생성
- [ ] Vercel 프로젝트 연결
- [ ] 첫 배포 성공
- [ ] 배포된 URL 확인 및 테스트
- [ ] 자동 배포 테스트 (코드 수정 → push)
- [ ] 환경 변수 설정 (필요한 경우)
- [ ] 커스텀 도메인 연결 (선택)

---

## 문제 해결

### 빌드 실패 시

1. 로컬에서 빌드 테스트: `npm run build`
2. 오류 메시지 확인
3. `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`

### 배포는 되지만 화면이 안 보일 때

1. Vercel 로그에서 404 오류 확인
2. `vercel.json`의 rewrite 규칙 확인
3. `dist` 폴더가 제대로 생성되었는지 확인

### PWA가 작동하지 않을 때

1. HTTPS 필수 (Vercel은 자동으로 HTTPS 제공)
2. manifest.json 경로 확인
3. Service Worker 등록 확인 (개발자 도구 → Application → Service Workers)

---

## 다음 단계

배포 후:

1. ✅ URL 공유 및 테스트
2. ✅ 모바일에서 "홈 화면에 추가" 테스트
3. ✅ Google Analytics 연결 (선택)
4. ✅ 백엔드 API 연결
5. ✅ 결제 시스템 통합
