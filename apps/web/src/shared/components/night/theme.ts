export const THEME_STORAGE_KEY = 'mz-theme'

export type Theme = 'dark' | 'light'

/**
 * First-paint theme resolution. An explicit `?theme=` wins (screenshots), then
 * a stored user choice, then the device's `prefers-color-scheme`. Dark stays
 * the brand fallback when the media query is unavailable.
 */
export function resolveInitialTheme(stored: string | null, forced?: string | null, prefersLight = false): Theme {
  if (forced === 'light' || forced === 'dark') return forced
  if (stored === 'light' || stored === 'dark') return stored
  return prefersLight ? 'light' : 'dark'
}

export function systemPrefersLight(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-color-scheme: light)').matches
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#fafcfb' : '#0a0e11')
}

export const THEME_BOOT_SCRIPT = `(function(){try{
  var key='${THEME_STORAGE_KEY}';
  var root=document.documentElement;
  var forced=new URLSearchParams(location.search).get('theme');
  var stored=null;
  try{stored=localStorage.getItem(key)}catch(e){}
  var system='dark';
  try{system=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}catch(e){}
  var theme=forced==='light'||forced==='dark'?forced:(stored==='light'||stored==='dark'?stored:system);
  root.dataset.theme=theme;
  var meta=document.querySelector('meta[name="theme-color"]');
  if(meta){meta.setAttribute('content',theme==='light'?'#fafcfb':'#0a0e11')}
}catch(e){document.documentElement.dataset.theme='dark'}})()`
