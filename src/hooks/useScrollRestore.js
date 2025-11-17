// hooks/useScrollRestore.js
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const scrollPositions = {};

export function useScrollRestore(key) {
  const router = useRouter();

  useEffect(() => {
    const saved = scrollPositions[key];
    if (saved) {
      window.scrollTo(0, saved);
    }

    const save = () => {
      scrollPositions[key] = window.scrollY;
    };

    const handleRouteChange = () => save();
    window.addEventListener('scroll', save);
    router.events?.on('routeChangeStart', handleRouteChange);

    return () => {
      save();
      window.removeEventListener('scroll', save);
      router.events?.off('routeChangeStart', handleRouteChange);
    };
  }, [key, router]);
}