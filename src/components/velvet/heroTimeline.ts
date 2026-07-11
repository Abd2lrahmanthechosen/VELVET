export const HERO_SCROLL_SCREENS = 3;

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function getHeroScrollLength() {
  if (typeof window === "undefined") return 1;
  return window.innerHeight * HERO_SCROLL_SCREENS;
}

export function getHeroProgressFromScroll(scrollY: number) {
  return clamp01(scrollY / getHeroScrollLength());
}

export function getHeroProgress(fallback = 0) {
  if (typeof window === "undefined") return fallback;
  return getHeroProgressFromScroll(window.scrollY);
}
