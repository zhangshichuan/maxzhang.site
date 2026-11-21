export const THEME_STORAGE_KEY = 'mz-theme'

export type Theme = 'dark' | 'light'

/**
 * First-paint theme resolution. Dark is the signature mode, so an unknown or
 * missing value falls back to dark. `?theme=` is kept for screenshots.
 */
export function resolveInitialTheme(stored: string | null, forced?: string | null): Theme {
  if (forced === 'light' || forced === 'dark') return forced
  return stored === 'light' ? 'light' : 'dark'
}

export const THEME_BOOT_SCRIPT = `(function(){try{var key='${THEME_STORAGE_KEY}';var root=document.documentElement;var forced=new URLSearchParams(location.search).get('theme');var stored=null;try{stored=localStorage.getItem(key)}catch(e){}var theme=forced==='light'||forced==='dark'?forced:stored==='light'?'light':'dark';root.dataset.theme=theme;var meta=document.querySelector('meta[name="theme-color"]');if(meta){meta.setAttribute('content',theme==='light'?'#fafcfb':'#0a0e11')}}catch(e){document.documentElement.dataset.theme='dark'}})()`
