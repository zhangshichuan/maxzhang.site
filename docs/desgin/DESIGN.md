# Glitch Core · 完整设计系统 &amp; 实现规范

> Codename: Glitch Core
> 项目: Max Zhang 个人网站
> 版本: v2.0
> 目标: 任何人（包括 AI）读此文件即可 1:1 复刻

---

## 一、CSS 变量 (复制粘贴开头)

```css
:root {
  --bg: #020008;
  --fg: #e0e0f0;
  --neon: #ff2d95;
  --cyan: #00e5ff;
  --purple: #b347ea;
  --yellow: #ffee00;
  --card: #0a0a16;
}
```

---

## 二、全局 Reset & Body

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;
  background: var(--bg);
  color: var(--fg);
  overflow-x: hidden;
  cursor: crosshair;
  -webkit-font-smoothing: antialiased;
}
```

---

## 三、背景层 (不可删改，所有页面共用)

### 3.1 Canvas 粒子场

HTML 骨架第一行：

```html
<canvas id="bg"></canvas>
```

CSS：

```css
#bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
```

JS 粒子场代码（完整复制）：

```javascript
const c = document.getElementById('bg'),
  ctx = c.getContext('2d')
let w,
  h,
  particles = [],
  mouse = { x: 0.5 * innerWidth, y: 0.5 * innerHeight }
function resize() {
  w = c.width = innerWidth
  h = c.height = innerHeight
}
resize()
addEventListener('resize', resize)

class P {
  constructor() {
    this.reset()
  }
  reset() {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.z = Math.random() * 400 + 30
    this.vx = (Math.random() - 0.5) * 0.25
    this.vy = (Math.random() - 0.5) * 0.25
    this.r = 0.5 + Math.random() * 2
    this.hue = Math.random() > 0.5 ? 290 : 200
  }
  update() {
    this.x += this.vx
    this.y += this.vy
    this.z -= 0.3
    if (this.z < 8) {
      this.z = 400
      this.x = Math.random() * w
      this.y = Math.random() * h
    }
    if (this.x < 0 || this.x > w) this.vx *= -1
    if (this.y < 0 || this.y > h) this.vy *= -1
  }
  draw() {
    const s = 180 / this.z
    const px = (this.x - mouse.x * s) * s + mouse.x
    const py = (this.y - mouse.y * s) * s + mouse.y
    const alpha = Math.min(0.9, 80 / this.z)
    const sr = this.r * s
    ctx.beginPath()
    ctx.arc(px, py, sr, 0, Math.PI * 2)
    const lum = this.hue === 290 ? '255,45,149' : '0,229,255'
    ctx.fillStyle = `rgba(${lum},${alpha})`
    ctx.fill()
  }
}

for (let i = 0; i < 150; i++) particles.push(new P())
document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})
document.addEventListener(
  'touchmove',
  (e) => {
    mouse.x = e.touches[0].clientX
    mouse.y = e.touches[0].clientY
  },
  { passive: true },
)

;(function a() {
  ctx.fillStyle = 'rgba(2,0,8,.12)'
  ctx.fillRect(0, 0, w, h)
  for (const p of particles) {
    p.update()
    p.draw()
  }
  requestAnimationFrame(a)
})()
```

### 3.2 扫描线纹理

HTML：

```html
<div class="scanline"></div>
```

CSS：

```css
.scanline {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.025;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.4) 2px,
    rgba(0, 0, 0, 0.4) 4px
  );
}
```

### 3.3 噪点纹理

HTML：

```html
<div class="noise"></div>
```

CSS：

```css
.noise {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.02;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: noise 0.4s steps(3) infinite;
}
@keyframes noise {
  0%,
  100% {
    transform: translate(0);
  }
  25% {
    transform: translate(-2%, 1%);
  }
  50% {
    transform: translate(3%, -1%);
  }
  75% {
    transform: translate(-1%, 2%);
  }
}
```

### 3.4 内容层容器

```css
.overlay {
  position: relative;
  z-index: 2;
}
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 28px;
}
```

---

## 四、HTML 骨架 (所有页面使用此结构)

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><!-- 页面标题 --></title>
    <!-- 此处放全部 CSS -->
  </head>
  <body>
    <canvas id="bg"></canvas>
    <div class="scanline"></div>
    <div class="noise"></div>

    <div class="overlay">
      <div class="container">
        <!-- 页面内容 -->
      </div>
    </div>

    <!-- 此处放粒子场 JS -->
  </body>
</html>
```

**硬规则：** `canvas#bg` + `.scanline` + `.noise` + `.overlay > .container` 这套结构是必须的，所有页面统一。外层结构不可改，只替换 `<!-- 页面内容 -->` 部分。

---

## 五、导航 Header

HTML：

```html
<header>
  <div class="logo">ZM::</div>
  <nav>
    <a href="#">[Projects]</a>
    <a href="#">[Blog]</a>
    <a href="#">[Resume]</a>
    <a href="#">[Contact]</a>
  </nav>
</header>
```

CSS：

```css
header {
  padding: 32px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--neon);
  text-shadow: 0 0 20px rgba(255, 45, 149, 0.4);
}
nav {
  display: flex;
  gap: 24px;
}
nav a {
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: 0.25s;
  position: relative;
}
nav a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--cyan);
  transition: 0.25s;
}
nav a:hover {
  color: var(--cyan);
}
nav a:hover::after {
  width: 100%;
}
```

---

## 六、Hero 区域

HTML：

```html
<div class="hero">
  <div>
    <div class="tagline">Fullstack Developer</div>
    <div class="glitch-block">
      <h1 class="glitch" data-text="BUILD HARDER. GLITCH LOUDER.">BUILD HARDER. GLITCH LOUDER.</h1>
    </div>
    <p class="bio">Rust 信徒 · TypeScript 老兵 · K8s 驯兽师。在系统和界面的裂缝里写代码，用粒子重构现实。</p>
    <div class="btn-group">
      <button class="btn btn-p">Enter the field</button>
      <button class="btn btn-c">Download resume</button>
      <button class="btn btn-g">GitHub</button>
    </div>
    <div class="counter-row">
      <div class="counter">
        <div class="num">12y</div>
        <div class="lbl">Experience</div>
      </div>
      <div class="counter">
        <div class="num">50+</div>
        <div class="lbl">OSS repos</div>
      </div>
      <div class="counter">
        <div class="num">3k</div>
        <div class="lbl">Stars</div>
      </div>
    </div>
  </div>
</div>
```

CSS：

```css
.hero {
  padding: 80px 0 60px;
  display: flex;
  align-items: center;
  min-height: 75vh;
}

.tagline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--cyan);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 12px;
}

.glitch-block {
  position: relative;
  margin-bottom: 28px;
}
.glitch {
  font-size: clamp(36px, 7vw, 72px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  position: relative;
  color: #fff;
  text-shadow: 0 0 40px rgba(255, 45, 149, 0.3);
}
.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.glitch::before {
  left: 2px;
  text-shadow: -2px 0 var(--cyan);
  animation: ga 3s infinite linear alternate-reverse;
  clip: rect(30px, 9999px, 90px, 0);
}
.glitch::after {
  left: -2px;
  text-shadow: 2px 0 var(--neon);
  animation: gb 2.5s infinite linear alternate-reverse;
  clip: rect(70px, 9999px, 40px, 0);
}
@keyframes ga {
  0%,
  100% {
    clip: rect(20px, 9999px, 60px, 0);
  }
  20% {
    clip: rect(80px, 9999px, 20px, 0);
  }
  40% {
    clip: rect(10px, 9999px, 90px, 0);
  }
  60% {
    clip: rect(50px, 9999px, 30px, 0);
  }
  80% {
    clip: rect(70px, 9999px, 10px, 0);
  }
}
@keyframes gb {
  0%,
  100% {
    clip: rect(60px, 9999px, 10px, 0);
  }
  20% {
    clip: rect(30px, 9999px, 70px, 0);
  }
  40% {
    clip: rect(90px, 9999px, 30px, 0);
  }
  60% {
    clip: rect(10px, 9999px, 80px, 0);
  }
  80% {
    clip: rect(40px, 9999px, 50px, 0);
  }
}

.bio {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.45);
  max-width: 520px;
  line-height: 1.9;
  margin-bottom: 32px;
}

.counter-row {
  display: flex;
  gap: 36px;
  margin-top: 40px;
}
.counter .num {
  font-size: 34px;
  font-weight: 900;
  color: var(--neon);
  text-shadow: 0 0 20px rgba(255, 45, 149, 0.3);
  line-height: 1;
}
.counter .lbl {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 6px;
}
```

---

## 七、按钮系统

HTML 示例：

```html
<button class="btn btn-p">Primary</button>
<button class="btn btn-c">Secondary</button>
<button class="btn btn-g">Tertiary</button>
```

CSS：

```css
.btn-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.btn {
  padding: 13px 30px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid;
  font-family: inherit;
  transition: 0.25s;
  position: relative;
  overflow: hidden;
  background: transparent;
}
.btn-p {
  color: var(--neon);
  border-color: var(--neon);
}
.btn-p:hover {
  background: var(--neon);
  color: #000;
  box-shadow: 0 0 30px rgba(255, 45, 149, 0.5);
  transform: translateY(-2px);
}
.btn-c {
  color: var(--cyan);
  border-color: var(--cyan);
}
.btn-c:hover {
  background: var(--cyan);
  color: #000;
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.5);
  transform: translateY(-2px);
}
.btn-g {
  color: rgba(255, 255, 255, 0.4);
  border-color: rgba(255, 255, 255, 0.1);
}
.btn-g:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
}
```

**按钮语义规则：**

- `.btn-p` (pink, --neon) = 主 CTA，每页最多一个
- `.btn-c` (cyan, --cyan) = 次级 CTA
- `.btn-g` (ghost) = 三级/取消/外链
- 三种按钮 CSS 不可修改

---

## 八、区块标题 Section Header

HTML：

```html
<section>
  <div class="sec-head">
    <span class="bracket">[区块名称]</span>
    <div class="line"></div>
  </div>
  <!-- 内容 -->
</section>
```

CSS：

```css
section {
  padding: 80px 0;
}
.sec-head {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 36px;
}
.sec-head .bracket {
  font-size: 11px;
  color: var(--cyan);
  text-transform: uppercase;
  letter-spacing: 3px;
}
.sec-head .line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--cyan), transparent);
  opacity: 0.3;
}
```

---

## 九、项目卡片 Project Card

HTML 示例（单个）：

```html
<div class="proj-grid">
  <div class="proj">
    <div class="idx">01</div>
    <h3>项目名称 — 一句话描述</h3>
    <p>项目详细描述，13px，rgba(255,255,255,.4)，line-height 1.8</p>
    <div class="tags">
      <span class="tag">标签1</span>
      <span class="tag">标签2</span>
    </div>
  </div>
  <!-- 更多 .proj ... -->
</div>
```

CSS：

```css
.proj-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.proj {
  position: relative;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 28px;
  transition: 0.3s;
  overflow: hidden;
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%);
}
.proj::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 80% 20%, rgba(255, 45, 149, 0.06), transparent 70%);
  opacity: 0;
  transition: 0.3s;
}
.proj:hover {
  border-color: rgba(255, 45, 149, 0.3);
  transform: translateY(-3px);
}
.proj:hover::before {
  opacity: 1;
}
.proj .idx {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 64px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.02);
  line-height: 1;
  pointer-events: none;
}
.proj h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  position: relative;
}
.proj p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.8;
  position: relative;
}
.proj .tags {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
  position: relative;
}
.proj .tag {
  font-size: 10px;
  color: var(--cyan);
  border: 1px solid rgba(0, 229, 255, 0.2);
  padding: 4px 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 2px;
}
```

---

## 十、技能矩阵 Skill Matrix

HTML 示例：

```html
<div class="spec-grid">
  <div class="spec-item">
    <div class="icon">&#x2699;</div>
    <div class="title">Languages</div>
    <div class="list">Rust<br />TypeScript<br />Go<br />Python</div>
  </div>
  <div class="spec-item">
    <div class="icon">&#x25A3;</div>
    <div class="title">Frameworks</div>
    <div class="list">React · Next.js<br />Tokio · Axum<br />Tailwind</div>
  </div>
  <div class="spec-item">
    <div class="icon">&#x2601;</div>
    <div class="title">Infrastructure</div>
    <div class="list">Docker · K8s<br />Terraform<br />AWS · Vercel</div>
  </div>
  <div class="spec-item">
    <div class="icon">&#x25C7;</div>
    <div class="title">Data Layer</div>
    <div class="list">PostgreSQL<br />Redis · Kafka<br />S3 · DynamoDB</div>
  </div>
</div>
```

CSS：

```css
.spec-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: rgba(255, 255, 255, 0.04);
}
.spec-item {
  background: var(--bg);
  padding: 20px 18px;
  text-align: center;
}
.spec-item .icon {
  font-size: 20px;
  margin-bottom: 10px;
}
.spec-item .title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--neon);
  margin-bottom: 8px;
}
.spec-item .list {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 2.2;
}
```

---

## 十一、滚动跑马灯 Marquee

HTML 示例：

```html
<div class="marquee">
  <div class="marquee-inner">
    <span>RUST</span><span class="dot">&#x25CF;</span> <span>TYPESCRIPT</span><span class="dot">&#x25CF;</span>
    <span>KUBERNETES</span><span class="dot">&#x25CF;</span>
    <!-- 再重复一遍以形成无限循环 -->
    <span>RUST</span><span class="dot">&#x25CF;</span> <span>TYPESCRIPT</span><span class="dot">&#x25CF;</span>
    <span>KUBERNETES</span><span class="dot">&#x25CF;</span>
  </div>
</div>
```

CSS：

```css
.marquee {
  overflow: hidden;
  padding: 32px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 40px;
}
.marquee-inner {
  display: flex;
  gap: 40px;
  animation: scroll 25s linear infinite;
  width: max-content;
}
.marquee-inner span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 3px;
  white-space: nowrap;
}
.marquee-inner .dot {
  color: var(--neon);
}
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
```

**规则：** marquee-inner 内必须放两遍相同内容，第一遍和第二遍完全一样，以保证无限循环无缝。

---

## 十二、Footer

HTML：

```html
<footer>
  <div class="sig">&#x263B;</div>
  <div class="note">Zhang Ming &copy; 2026 · Particles never lie</div>
</footer>
```

CSS：

```css
footer {
  padding: 50px 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}
footer .sig {
  font-size: 24px;
  color: var(--neon);
  margin-bottom: 8px;
}
footer .note {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 2px;
}
```

---

## 十三、响应式 Media Query

```css
@media (max-width: 700px) {
  .proj-grid {
    grid-template-columns: 1fr;
  }
  .spec-grid {
    grid-template-columns: 1fr 1fr;
  }
  header {
    flex-direction: column;
    gap: 14px;
  }
  .hero {
    padding: 40px 0;
    min-height: auto;
  }
}
```

---

## 十四、新页面生成协议

以上一至十三节是现代整个系统的完整实现代码。新页面生成时：

1. 复制第十二节 "HTML 骨架" 中的外层结构（head 内包含所有 CSS，body 内包含 canvas + scanline + noise + overlay > container）
2. 替换 `<!-- 页面内容 -->` 为新页面内容
3. 导航和 Footer 保持不变
4. 使用五到十一节的组件 CSS 和 HTML 模式来填充内容
5. 禁止引入不在上述规范中的新 CSS 类、新颜色、新动画

**完整页面模板（复制即用）：**

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Max Zhang — 新页面</title>
    <style>
      /* ===== 此处粘贴第一章到第十二章的全部 CSS ===== */
    </style>
  </head>
  <body>
    <canvas id="bg"></canvas>
    <div class="scanline"></div>
    <div class="noise"></div>

    <div class="overlay">
      <div class="container">
        <header>
          <div class="logo">ZM::</div>
          <nav>
            <a href="#">[Projects]</a>
            <a href="#">[Blog]</a>
            <a href="#">[Resume]</a>
            <a href="#">[Contact]</a>
          </nav>
        </header>

        <!-- ===== 新页面内容 ===== -->

        <footer>
          <div class="sig">&#x263B;</div>
          <div class="note">Max Zhang &copy; 2026 · Particles never lie</div>
        </footer>
      </div>
    </div>

    <script>
      /* ===== 此处粘贴第三章 3.1 的完整粒子场 JS ===== */
    </script>
  </body>
</html>
```

---

## 十五、设计决策日志

| ID  | 决策                     | 理由                               | 日期    |
| --- | ------------------------ | ---------------------------------- | ------- |
| D1  | Cyberpunk × 3D 粒子方向  | 暗色 + 霓虹 + 粒子 = "强而有品味"  | 2026-07 |
| D2  | 只有粉/青两种强调色      | 多色 = 噪音，双色 = 信号           | 2026-07 |
| D3  | clip-path 斜切角而非圆角 | 斜切是这个系统的识别度，圆角是模板 | 2026-07 |
| D4  | 不做 fade-in/slide-in    | "打开即完整" 是最强的前端声明      | 2026-07 |
| D5  | 正文 Inter，不用衬线     | 开发者身份 > 文艺身份              | 2026-07 |
| D6  | glitch 只在 Hero 用一次  | 故障效果用多就廉价                 | 2026-07 |
