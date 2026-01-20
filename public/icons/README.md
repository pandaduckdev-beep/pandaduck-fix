# 아이콘 가이드

이 폴더에는 다음 크기의 아이콘들이 필요합니다:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## 아이콘 생성 방법

1. 로고 이미지를 최소 512x512 크기로 준비
2. 온라인 도구 사용 (예: https://realfavicongenerator.net/)
3. 또는 아래 명령어로 자동 생성:

```bash
# ImageMagick 설치 필요
convert logo.png -resize 72x72 icon-72x72.png
convert logo.png -resize 96x96 icon-96x96.png
convert logo.png -resize 128x128 icon-128x128.png
convert logo.png -resize 144x144 icon-144x144.png
convert logo.png -resize 152x152 icon-152x152.png
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 384x384 icon-384x384.png
convert logo.png -resize 512x512 icon-512x512.png
```
