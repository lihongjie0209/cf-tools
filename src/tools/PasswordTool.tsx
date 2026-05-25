import { useEffect, useMemo, useState } from 'react'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const DEFAULT_SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>/?'

type StrengthTone = 'text-red-500' | 'text-yellow-500' | 'text-blue-500' | 'text-green-500'

function randomIndex(max: number): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] % max
}

function shuffle(chars: string[]): string[] {
  const next = [...chars]
  for (let i = next.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function buildStrength(length: number, poolSize: number): { label: string; color: StrengthTone; progress: number; entropy: number } {
  const entropy = poolSize > 0 ? length * Math.log2(poolSize) : 0
  if (entropy < 40) return { label: '弱', color: 'text-red-500', progress: 25, entropy }
  if (entropy < 60) return { label: '中', color: 'text-yellow-500', progress: 50, entropy }
  if (entropy < 80) return { label: '强', color: 'text-blue-500', progress: 75, entropy }
  return { label: '极强', color: 'text-green-500', progress: 100, entropy }
}

export default function PasswordTool() {
  const [length, setLength] = useState(20)
  const [count, setCount] = useState(5)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [customSymbols, setCustomSymbols] = useState(DEFAULT_SYMBOLS)
  const [passwords, setPasswords] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const groups = useMemo(() => {
    const selected: string[] = []
    if (useUppercase) selected.push(UPPERCASE)
    if (useLowercase) selected.push(LOWERCASE)
    if (useNumbers) selected.push(NUMBERS)
    if (useSymbols && customSymbols) selected.push(Array.from(new Set(Array.from(customSymbols))).join(''))
    return selected
  }, [customSymbols, useLowercase, useNumbers, useSymbols, useUppercase])

  const charset = groups.join('')
  const strength = useMemo(() => buildStrength(length, charset.length), [charset.length, length])

  function generatePasswords() {
    if (groups.length === 0 || !charset) {
      setError('请至少选择一种字符类型')
      setPasswords([])
      return
    }

    const generated = Array.from({ length: count }, () => {
      const chars: string[] = []
      for (const group of groups) {
        chars.push(group[randomIndex(group.length)])
      }
      while (chars.length < length) {
        chars.push(charset[randomIndex(charset.length)])
      }
      return shuffle(chars).join('').slice(0, length)
    })

    setPasswords(generated)
    setError('')
  }

  function copyAll() {
    if (passwords.length === 0) return
    navigator.clipboard.writeText(passwords.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  useEffect(() => {
    generatePasswords()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">密码生成器</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">自定义长度、字符集和数量，一次生成多组高强度密码</p>

      <div className="grid max-w-full grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="tool-card space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">密码长度</label>
              <span className="font-mono text-sm text-blue-600 dark:text-blue-400">{length}</span>
            </div>
            <input type="range" min={8} max={128} value={length} onChange={e => setLength(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <label className="label">生成数量 (1-20)</label>
            <input
              type="number"
              min={1}
              max={20}
              className="tool-input w-28"
              value={count}
              onChange={e => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
            />
          </div>

          <div className="grid max-w-full grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={useUppercase} onChange={e => setUseUppercase(e.target.checked)} />
              大写字母
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={useLowercase} onChange={e => setUseLowercase(e.target.checked)} />
              小写字母
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={useNumbers} onChange={e => setUseNumbers(e.target.checked)} />
              数字
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input type="checkbox" checked={useSymbols} onChange={e => setUseSymbols(e.target.checked)} />
              符号
            </label>
          </div>

          <div>
            <label className="label">自定义符号</label>
            <input
              type="text"
              className="tool-input w-full font-mono"
              value={customSymbols}
              onChange={e => setCustomSymbols(e.target.value)}
              disabled={!useSymbols}
              placeholder="!@#$%^&*"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-700 dark:text-gray-300">密码强度</span>
              <span className={`font-medium ${strength.color}`}>{strength.label}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className={`h-full transition-all ${strength.progress <= 25 ? 'bg-red-500' : strength.progress <= 50 ? 'bg-yellow-500' : strength.progress <= 75 ? 'bg-blue-500' : 'bg-green-500'}`} style={{ width: `${strength.progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">估算熵值：{strength.entropy.toFixed(1)} bits</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={generatePasswords}>生成密码</button>
            <button className="btn-secondary" onClick={copyAll}>{copied ? '✅ 已复制' : '复制全部'}</button>
            <button className="btn-secondary" onClick={() => setPasswords([])}>清空结果</button>
          </div>
          {error && <p className="text-red-500 text-sm">⚠️ {error}</p>}
        </div>

        <div className="tool-card">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">生成结果</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">{passwords.length} 条</span>
          </div>
          <textarea className="tool-textarea h-80" value={passwords.join('\n')} readOnly placeholder="点击“生成密码”后在这里查看结果" />
        </div>
      </div>
    </div>
  )
}
