// ═══════════════════════════════════════════════════════
//  useBreakpoint.ts — responsive breakpoint detection
// ═══════════════════════════════════════════════════════
import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const MOBILE_MAX = 480;
const TABLET_MAX = 1023;

function getBreakpoint(width: number): Breakpoint {
  if (width <= MOBILE_MAX) return 'mobile';
  if (width <= TABLET_MAX) return 'tablet';
  return 'desktop';
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() => getBreakpoint(window.innerWidth));

  useEffect(() => {
    let rafId: number;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setBp(getBreakpoint(window.innerWidth));
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return bp;
}

export function useIsMobile(): boolean {
  return useBreakpoint() === 'mobile';
}
