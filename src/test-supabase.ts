// Supabase 연결 테스트 스크립트
// 브라우저 콘솔에서 실행 가능

import { supabase } from './lib/supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...');

  try {
    // 1. 서비스 데이터 조회
    console.log('\n📋 서비스 데이터 조회 중...');
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true);

    if (servicesError) {
      console.error('❌ 서비스 조회 실패:', servicesError);
      return;
    }

    console.log('✅ 서비스 조회 성공:', services?.length, '개');
    console.table(services?.map(s => ({
      ID: s.service_id,
      이름: s.name,
      가격: s.base_price,
      보증: s.warranty
    })));

    // 2. 서비스 옵션 조회
    if (services && services.length > 0) {
      console.log('\n🔧 서비스 옵션 조회 중...');
      const { data: options, error: optionsError } = await supabase
        .from('service_options')
        .select('*')
        .eq('is_active', true);

      if (optionsError) {
        console.error('❌ 옵션 조회 실패:', optionsError);
      } else {
        console.log('✅ 옵션 조회 성공:', options?.length, '개');
        console.table(options?.map(o => ({
          서비스: o.service_id,
          옵션명: o.option_name,
          추가가격: o.additional_price
        })));
      }
    }

    // 3. 리뷰 조회
    console.log('\n⭐ 리뷰 데이터 조회 중...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .eq('is_public', true);

    if (reviewsError) {
      console.error('❌ 리뷰 조회 실패:', reviewsError);
    } else {
      console.log('✅ 리뷰 조회 성공:', reviews?.length, '개');
    }

    console.log('\n✨ Supabase 연결 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

// 자동 실행
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
  console.log('💡 브라우저 콘솔에서 "testSupabase()" 를 실행하여 Supabase 연결을 테스트할 수 있습니다.');
}
