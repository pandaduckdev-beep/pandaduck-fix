# Vercel 배포 문제 해결 방법

## 현재 상황
- Vercel이 계속 이전 커밋(fcb78fc)만 Redeploy하고 있음
- 최신 커밋(77651f7, aede92e 등)을 인식하지 못함
- 모든 배포가 npm install 단계에서 실패 (oh-my-opencode-darwin-arm64 오류)

## 해결 방법

### 방법 1: 새 배포 직접 생성 (권장)
1. Vercel Dashboard → 프로젝트 페이지
2. 우측 상단 "..." 메뉴 옆 **큰 버튼** 찾기
3. 또는 URL 직접 접속: https://vercel.com/[your-team]/pandaduck-pix/deployments/create
4. Branch: main 선택
5. "Deploy" 클릭

### 방법 2: Git Integration 재연결
1. Vercel Dashboard → Settings → Git
2. "Disconnect Git Repository" 클릭
3. "Connect Git Repository" 클릭
4. 저장소 재선택: pandaduckdev-beep/pandaduck-pix
5. Branch: main 선택
6. 저장

### 방법 3: Vercel CLI (로컬에서)
```bash
# Vercel 로그인 (브라우저 열림)
npx vercel login

# 프로젝트 링크 (처음 한 번만)
npx vercel link

# Production 배포
npx vercel --prod
```

## 왜 이런 일이 발생했나?
- Vercel의 GitHub Webhook이 새 커밋을 감지하지 못함
- "Redeploy" 버튼은 같은 커밋을 다시 빌드만 함
- 새로운 커밋으로 배포하려면 명시적으로 새 배포를 생성해야 함
