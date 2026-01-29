# PandaDuck Pix - 게임패드 수리 서비스

게이머를 위한 전문 듀얼센스 컨트롤러 수리 및 커스터마이징 서비스 웹사이트

## 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa
- **Mobile App**: Capacitor 6

## 개발 환경 설정

### 필수 요구사항

- Node.js 18 이상
- npm, yarn 또는 pnpm

### 설치

```bash
# 의존성 설치
npm install
# 또는
pnpm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속

### 빌드

```bash
npm run build
```

## 모바일 앱 배포

### 1. PWA (Progressive Web App)

웹 빌드만으로 PWA가 자동으로 활성화됩니다.

```bash
npm run build
```

빌드된 `dist` 폴더를 웹 호스팅 서비스에 배포하면 사용자는 홈 화면에 앱을 추가할 수 있습니다.

### 2. iOS App Store 배포

#### 사전 요구사항
- macOS
- Xcode 14 이상
- Apple Developer 계정

#### 단계

1. **Capacitor 초기화**
```bash
npm run cap:init
```

2. **iOS 플랫폼 추가**
```bash
npm run cap:add:ios
```

3. **웹 빌드 및 동기화**
```bash
npm run build:mobile
```

4. **Xcode에서 열기**
```bash
npm run cap:open:ios
```

5. **아이콘 및 스플래시 스크린 설정**
   - Xcode에서 `App` > `App` > `Assets` 에서 아이콘 이미지 추가
   - 1024x1024 PNG 이미지 필요

6. **서명 및 프로비저닝 프로파일 설정**
   - Xcode > Signing & Capabilities
   - Team 선택
   - Bundle Identifier 확인: `com.pandaduckpix.app`

7. **빌드 및 배포**
   - Xcode에서 Product > Archive
   - Organizer에서 App Store Connect로 업로드

### 3. Google Play Store 배포

#### 사전 요구사항
- Android Studio
- JDK 17 이상
- Google Play Console 계정

#### 단계

1. **Capacitor 초기화** (아직 안 했다면)
```bash
npm run cap:init
```

2. **Android 플랫폼 추가**
```bash
npm run cap:add:android
```

3. **웹 빌드 및 동기화**
```bash
npm run build:mobile
```

4. **Android Studio에서 열기**
```bash
npm run cap:open:android
```

5. **아이콘 및 스플래시 스크린 설정**
   - `android/app/src/main/res` 폴더에 아이콘 이미지 추가
   - Android Asset Studio 사용 권장

6. **서명 키 생성**
```bash
cd android/app
keytool -genkey -v -keystore pandaduckpix-release.keystore -alias pandaduckpix -keyalg RSA -keysize 2048 -validity 10000
```

7. **gradle.properties 설정**
```
PANDADUCKPIX_RELEASE_STORE_FILE=pandaduckpix-release.keystore
PANDADUCKPIX_RELEASE_KEY_ALIAS=pandaduckpix
PANDADUCKPIX_RELEASE_STORE_PASSWORD=your_password
PANDADUCKPIX_RELEASE_KEY_PASSWORD=your_password
```

8. **Release 빌드**
```bash
cd android
./gradlew bundleRelease
```

9. **AAB 파일 업로드**
   - `android/app/build/outputs/bundle/release/app-release.aab` 파일을 Google Play Console에 업로드

## 아이콘 준비

모바일 앱 배포를 위해 다음 아이콘들이 필요합니다:

- **PWA/Web**: `public/icons/` 폴더에 72x72 ~ 512x512 크기의 PNG 파일들
- **iOS**: 1024x1024 PNG 파일
- **Android**: 다양한 크기 (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)

`public/icons/README.md` 파일에 자세한 가이드가 있습니다.

## 프로젝트 구조

```
PandaDuckPix/
├── public/              # 정적 파일
│   ├── icons/          # PWA 아이콘
│   └── manifest.json   # PWA 매니페스트
├── src/
│   ├── app/
│   │   ├── components/ # React 컴포넌트
│   │   └── App.tsx     # 메인 앱
│   ├── styles/         # CSS 파일
│   └── main.tsx        # 엔트리 포인트
├── capacitor.config.ts # Capacitor 설정
├── vite.config.ts      # Vite 설정
└── package.json        # 의존성 및 스크립트
```

## 주요 기능

- ✅ 모바일 최적화 UI
- ✅ 다크 테마
- ✅ PWA 지원 (오프라인 작동)
- ✅ 네이티브 앱 변환 가능 (iOS/Android)
- ✅ 이미지 캐싱
- ✅ 반응형 디자인

## 라이선스

Private
