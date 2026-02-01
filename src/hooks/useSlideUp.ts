import { useRef, useEffect, useCallback } from "react";

export function useSlideUp(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const triggered = useRef<Set<number>>(new Set());

  const setRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    refs.current[index] = el;
    if (el && triggered.current.has(index)) {
      el.classList.add("in-view");
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
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

    // 현재 refs에 있는 모든 요소를 관찰
    refs.current.forEach((el) => {
      if (el) {
        const idx = refs.current.indexOf(el);
        if (triggered.current.has(idx)) {
          el.classList.add("in-view");
        }
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }); // count 의존성 제거 - 매 렌더링마다 refs 확인

  return { setRef };
}
