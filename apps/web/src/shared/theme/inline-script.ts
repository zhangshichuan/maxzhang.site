/**
 * 首屏外观脚本
 *
 * 在 React 水合前读取本地偏好并设置 <html> 模式类与玻璃强度变量，
 * 避免深/浅色与材质浓度在刷新时闪烁（FOUC）。
 */
export const APPEARANCE_INLINE_SCRIPT = `(function(){try{var raw=localStorage.getItem('maxzhang.appearance');var stored=raw?JSON.parse(raw):{};var mode=stored.mode==='light'||stored.mode==='dark'?stored.mode:'system';var intensity=typeof stored.intensity==='number'?Math.min(100,Math.max(0,stored.intensity)):50;var mq=window.matchMedia('(prefers-color-scheme: dark)');var apply=function(){var dark=mode==='dark'||(mode==='system'&&mq.matches);var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(dark?'dark':'light');var alpha=Math.round((dark?36:48)+intensity*(dark?0.44:0.38));var blur=Math.round(14+intensity*0.22);var sat=(1.5-intensity*0.006).toFixed(2);var wp=(1-intensity*0.006).toFixed(2);root.style.setProperty('--glass-alpha',alpha+'%');root.style.setProperty('--glass-blur',blur+'px');root.style.setProperty('--glass-sat',sat);root.style.setProperty('--wallpaper-opacity',wp)};apply();if(mode==='system'){mq.addEventListener('change',apply)}}catch(e){document.documentElement.classList.add('light')}})();`
