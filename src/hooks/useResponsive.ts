/**
 * @fileoverview Custom hook for responsive viewport tracking
 * @module hooks/useResponsive
 */

import { useState, useEffect } from 'react';
import { getViewport } from '@/src/utils/responsive';
import { debounce } from '@/src/utils/helpers';
import type { Viewport } from '@/src/utils/types';

/**
 * Hook that tracks viewport dimensions and provides responsive values
 */
export function useResponsive(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(getViewport());

  useEffect(() => {
    const handleResize = debounce(() => {
      setViewport(getViewport());
    }, 150);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
}
