/**
 * 液态玻璃背景壁纸
 *
 * 固定在全站底层的缓慢流动抽象渐变，深浅色各有一套配色；
 * 可见度由玻璃强度变量（--wallpaper-opacity）控制。
 */
export function BackgroundWallpaper() {
  return (
    <div className="wallpaper" aria-hidden="true">
      <div className="wallpaper-orb wallpaper-orb-1" />
      <div className="wallpaper-orb wallpaper-orb-2" />
      <div className="wallpaper-orb wallpaper-orb-3" />
    </div>
  )
}
