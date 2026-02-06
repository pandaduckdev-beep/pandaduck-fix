import { useRef, useEffect, useCallback } from "react";

export function useSlideUp(_count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const triggered = useRef<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    refs.current[index] = el;

    if (el) {
      // 이미 트리거된 요소면 바로 in-view 추가
      if (triggered.current.has(index)) {
        el.classList.add("in-view");
      }
      // observer가 있으면 관찰 시작
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    }
  }, []);

  useEffect(() => {
    // observer 생성 (한 번만)
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
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    // 이미 등록된 요소들 관찰 시작
    refs.current.forEach((el, idx) => {
      if (el) {
        if (triggered.current.has(idx)) {
          el.classList.add("in-view");
        }
        observerRef.current?.observe(el);
      }
    });

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []); // 최초 마운트 시에만 실행

  return { setRef };
}
