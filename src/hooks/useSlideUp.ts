import { useRef, useEffect, useCallback } from "react";

export function useSlideUp(_count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const triggered = useRef<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isInitialized = useRef(false);

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    refs.current[index] = el;

    if (el) {
      // 이미 트리거된 요소면 바로 in-view 추가
      if (triggered.current.has(index)) {
        el.classList.add("in-view");
      }
      // observer가 있고 초기화가 완료됐으면 관찰 시작
      if (observerRef.current && isInitialized.current) {
        observerRef.current.observe(el);
      }
    }
  }, []);

  useEffect(() => {
    // observer 생성
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLDivElement;
            const idx = refs.current.indexOf(el);
            if (idx !== -1) {
              triggered.current.add(idx);
            }
            el.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    // 브라우저가 초기 스타일을 적용한 후에 observer 연결
    // 이렇게 해야 transition 애니메이션이 제대로 동작함
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isInitialized.current = true;
        refs.current.forEach((el, idx) => {
          if (el) {
            if (triggered.current.has(idx)) {
              el.classList.add("in-view");
            }
            observerRef.current?.observe(el);
          }
        });

        // 페이지 로드 시 뷰포트 안에 있지만 rootMargin 때문에 트리거되지 않은 요소들 처리
        // 짧은 딜레이 후 뷰포트 내 요소들을 강제로 표시
        setTimeout(() => {
          refs.current.forEach((el, idx) => {
            if (el && !triggered.current.has(idx)) {
              const rect = el.getBoundingClientRect();
              // 요소가 뷰포트 안에 있으면 표시
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                triggered.current.add(idx);
                el.classList.add("in-view");
              }
            }
          });
        }, 300);
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  return { setRef };
}
