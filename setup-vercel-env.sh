#!/bin/bash

# Vercel 환경 변수 설정 스크립트
# 사용법: ./setup-vercel-env.sh

echo "Setting up Vercel environment variables..."

# Production 환경
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Preview 환경
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview

# Development 환경
vercel env add VITE_SUPABASE_URL development
vercel env add VITE_SUPABASE_ANON_KEY development

echo "Environment variables added. Redeploying..."
vercel --prod

echo "Done! Check your deployment at https://vercel.com/dashboard"
