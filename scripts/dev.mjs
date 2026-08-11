#!/usr/bin/env node
/**
 * 一键本地开发环境
 *
 * 默认同时拉起：
 *   - Web 开发服务器（Vite + TanStack Start，:3000）
 *   - TTS 服务（uv + uvicorn，:8001，自动热重载）
 *   - 树洞聊天服务（go run .，:9000）
 *
 * 环境变量按服务放在各自目录的 .env（均被 gitignore），
 * 示例文件见各服务目录下的 .env.example。
 */

import { spawn, spawnSync } from 'node:child_process'
import net from 'node:net'
import { createInterface } from 'node:readline'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))
const servicesOnly = args.has('--services-only')
const clean = args.has('--clean')
const skipTts = args.has('--skip-tts')
const skipChat = args.has('--skip-chat')
const skipStorage = args.has('--skip-storage')

const children = []
let stopping = false

const TAG_COLORS = {
  tts: 36,
  chat: 35,
  storage: 32,
  web: 34,
  dev: 33,
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function log(tag, message) {
  const color = TAG_COLORS[tag] ?? 32
  process.stdout.write(`\x1b[2m[${tag}]\x1b[0m \x1b[${color}m${message}\x1b[0m\n`)
}

function hasBin(bin, versionArgs = ['--version']) {
  return spawnSync(bin, versionArgs, { stdio: 'ignore' }).status === 0
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(true))
    server.once('listening', () => server.close(() => resolve(false)))
    server.listen(port, '127.0.0.1')
  })
}

function portPids(port) {
  const result = spawnSync('lsof', ['-ti', `:${port}`], { encoding: 'utf8' })
  if (result.status !== 0) return []
  return result.stdout
    .trim()
    .split('\n')
    .map((line) => Number(line.trim()))
    .filter((pid) => Number.isInteger(pid) && pid > 0)
}

/**
 * 启动前释放端口：先 SIGTERM 优雅退出，1 秒后仍有残留再 SIGKILL。
 * 避免上次 dev 残留的 Web/TTS/聊天进程占着端口导致新实例起不来。
 */
async function killPort(port, label) {
  const pids = portPids(port)
  if (pids.length === 0) return
  log('dev', `释放 ${label} 端口 ${port}：终止 PID ${pids.join(', ')}`)
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      /* 进程可能刚好退出 */
    }
  }
  await sleep(1000)
  const leftover = portPids(port)
  for (const pid of leftover) {
    try {
      process.kill(pid, 'SIGKILL')
    } catch {
      /* 忽略 */
    }
  }
}

function pipeWithPrefix(stream, tag) {
  const rl = createInterface({ input: stream, crlfDelay: Infinity })
  rl.on('line', (line) => {
    if (line.trim()) log(tag, line)
  })
}

function start(name, command, commandArgs, options = {}) {
  const child = spawn(command, commandArgs, {
    cwd: options.cwd ?? root,
    env: options.env ?? process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  children.push({ name, child })
  pipeWithPrefix(child.stdout, name)
  pipeWithPrefix(child.stderr, name)

  child.on('error', (error) => {
    log('dev', `${name} 启动失败：${error.message}`)
  })
  child.on('exit', (code) => {
    if (!stopping) {
      log('dev', `${name} 已退出（code=${code}）`)
      // Web 是主进程：它退出时，整条开发环境一起收掉。
      if (name === 'web') shutdown(0)
    }
  })
  return child
}

/**
 * 读取 .env（只取简单 KEY=VALUE 行），返回合并后的环境变量。
 * 进程环境优先，文件只是兜底。
 */
function envFromFiles(files) {
  const merged = {}
  for (const file of files) {
    const full = path.join(root, file)
    if (!fs.existsSync(full)) continue
    for (const rawLine of fs.readFileSync(full, 'utf8').split('\n')) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      const value = line
        .slice(eq + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')
      if (key) merged[key] = value
    }
  }
  return merged
}

/**
 * 合并环境变量：进程环境优先，文件里的值只补缺。
 */
function mergeEnv(base, fileEnv) {
  const env = { ...base }
  for (const [key, value] of Object.entries(fileEnv)) {
    if (!(key in env)) env[key] = value
  }
  return env
}

function ensureDatabase() {
  const db = path.join(root, 'apps/web/prisma/dev.db')
  if (fs.existsSync(db)) {
    log('dev', 'SQLite 开发库已就绪')
  } else {
    log('dev', '未找到 SQLite 开发库，请先执行：pnpm db:migrate')
  }
}

/**
 * --clean：把 TanStack / Vite 的 dev 缓存移到 /tmp（不删除，可恢复）。
 * 多次 build/dev 交替后可能出现 "Invalid server function ID" 等脏状态，
 * 清掉缓存重启即可解决。
 */
function cleanDevCaches() {
  if (!clean) return
  const targets = ['apps/web/.tanstack', 'apps/web/node_modules/.vite']
  for (const rel of targets) {
    const source = path.join(root, rel)
    if (!fs.existsSync(source)) continue
    const backup = `/tmp/${path.basename(rel)}-bak-${Date.now()}`
    fs.renameSync(source, backup)
    log('dev', `已清理缓存：${rel} → ${backup}`)
  }
}

function startTts() {
  if (!hasBin('uv')) {
    log('dev', '未安装 uv，跳过 TTS 服务（pip 安装 astral-sh/uv 后即可）')
    return
  }
  const ttsDir = path.join(root, 'apps/services/tts')
  const env = mergeEnv(process.env, envFromFiles(['apps/services/tts/.env']))
  log('tts', '正在启动（uv run uvicorn :8001 --reload）…')
  start('tts', 'uv', ['run', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8001', '--reload'], {
    cwd: ttsDir,
    env,
  })
}

function startChat() {
  if (!hasBin('go', ['version'])) {
    log('dev', '未安装 Go，跳过聊天服务')
    return
  }
  const fileEnv = envFromFiles(['apps/services/chat/.env'])
  if (
    process.env.DEEPSEEK_API_KEY &&
    fileEnv.DEEPSEEK_API_KEY &&
    process.env.DEEPSEEK_API_KEY !== fileEnv.DEEPSEEK_API_KEY
  ) {
    log(
      'dev',
      '进程环境中存在 DEEPSEEK_API_KEY，但 apps/services/chat/.env 另有配置；本地开发以 .env 为准，环境变量中的 key 会被忽略',
    )
  }
  // 聊天服务以自身 .env 为配置源：父进程/终端注入的旧 key 不应覆盖服务配置。
  const env = { ...process.env, ...fileEnv }
  if (!env.DEEPSEEK_API_KEY) {
    log('dev', '未检测到 DEEPSEEK_API_KEY，聊天服务仍会启动，但请求会返回 503；可通过 export 或 .env 注入')
  }
  const chatDir = path.join(root, 'apps/services/chat')
  log('chat', '正在启动（go run . :9000）…')
  start('chat', 'go', ['run', '.'], { cwd: chatDir, env })
}

function startStorage() {
  const fileEnv = envFromFiles(['apps/services/storage/.env'])
  const env = mergeEnv(process.env, fileEnv)
  // 默认写到 Web 的 public/photos，让 Vite dev 直接伺服（生产由 docker-compose 注入 /data/photos）
  if (!env.PHOTOS_DIR) env.PHOTOS_DIR = path.join(root, 'apps/web/public/photos')
  log('storage', '正在启动（pnpm --filter storage dev :9001）…')
  start('storage', 'pnpm', ['--filter', 'storage', 'dev'], { env })
}

async function startWeb() {
  const webPort = 3000
  if (await isPortInUse(webPort)) {
    const lsof = spawnSync('lsof', ['-ti', `:${webPort}`], { encoding: 'utf8' })
    const pids = lsof.status === 0 ? lsof.stdout.trim().replace(/\n/g, ' ') : ''
    log(
      'dev',
      `端口 ${webPort} 已被占用${pids ? `（PID: ${pids}）` : ''}，Vite 会自动改用 3001；如想固定 3000，请先停掉占用进程`,
    )
  }
  log('web', '正在启动（Vite :3000）…')
  // 只把 Web 需要的存储配置透传过去；PORT 等存储专用变量不能污染 Web。
  const storageEnv = envFromFiles(['apps/services/storage/.env'])
  const sharedEnv = {}
  if (storageEnv.STORAGE_API_KEY !== undefined) {
    sharedEnv.STORAGE_API_KEY = storageEnv.STORAGE_API_KEY
  }
  const env = mergeEnv(process.env, sharedEnv)
  start('web', 'pnpm', ['--filter', 'web', 'dev'], { env })
}

function shutdown(code) {
  if (stopping) return
  stopping = true
  log('dev', '正在停止所有服务…')
  for (const { child } of children) {
    if (child.exitCode === null) {
      try {
        child.kill('SIGINT')
      } catch {
        /* 忽略已退出的子进程 */
      }
    }
  }
  setTimeout(() => {
    for (const { child } of children) {
      if (child.exitCode === null) {
        try {
          child.kill('SIGKILL')
        } catch {
          /* 忽略 */
        }
      }
    }
  }, 3000).unref()
  process.exitCode = code
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

async function main() {
  ensureDatabase()
  cleanDevCaches()

  if (!servicesOnly) {
    await killPort(3000, 'Web')
    if (!skipTts) await killPort(8001, 'TTS')
    if (!skipChat) await killPort(9000, '聊天')
    if (!skipStorage) await killPort(9001, '存储')
    if (!skipTts) startTts()
    if (!skipChat) startChat()
    if (!skipStorage) startStorage()
    await startWeb()
  } else {
    if (!skipTts) await killPort(8001, 'TTS')
    if (!skipChat) await killPort(9000, '聊天')
    if (!skipStorage) await killPort(9001, '存储')
    if (!skipTts) startTts()
    if (!skipChat) startChat()
    if (!skipStorage) startStorage()
    log('dev', 'services-only 模式：Web 未启动，Ctrl+C 退出')
  }

  log('dev', '本地开发环境已拉起：')
  if (servicesOnly) {
    if (!skipTts) log('dev', '  TTS  : http://localhost:8001/healthz')
    if (!skipChat) log('dev', '  Chat : http://localhost:9000/healthz')
    if (!skipStorage) log('dev', '  Storage : http://localhost:9001/healthz')
  } else {
    log('dev', '  Web  : http://localhost:3000')
    if (!skipTts) log('dev', '  TTS  : http://localhost:8001/healthz')
    if (!skipChat) log('dev', '  Chat : http://localhost:9000/healthz')
    if (!skipStorage) log('dev', '  Storage : http://localhost:9001/healthz')
  }
  log('dev', '按 Ctrl+C 一键停止全部服务')
}

main()
