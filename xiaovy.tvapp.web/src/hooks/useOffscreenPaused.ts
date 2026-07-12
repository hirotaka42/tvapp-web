'use client';

import { useEffect, useState } from 'react';

export function useOffscreenPaused<T extends HTMLElement>() {
  const [el, setEl] = useState<T | null>(null);

  useEffect(() => {
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(([entry]) => {
      el.classList.toggle('anim-paused', !entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [el]);

  return setEl;
}
