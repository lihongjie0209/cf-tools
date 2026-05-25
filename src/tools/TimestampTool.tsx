import { useState, useEffect } from 'react'

const TZ_LIST = [
  'UTC', 'Asia/Shanghai', 'America/New_York', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore',
]

function toDateStr(ts: number, tz: string) {
  return new Date(ts).toLocaleString('zh-CN', { timeZone: tz, hour12: false })
}

export default function TimestampTool() {
  const [now, setNow] = useState(Date.now())
  const [tsInput, setTsInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [tz, setTz] = useState('Asia/Shanghai')
  const [tsResult, setTsResult] = useState('')
  const [dateResult, setDateResult] = useState('')

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  function convertTs() {
    const n = Number(tsInput)
    if (isNaN(n)) { setTsResult('⚠️ 请输入有效数字'); return }
    const ms = n > 1e10 ? n : n * 1000
    setTsResult(toDateStr(ms, tz))
  }

  function convertDate() {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) { setDateResult('⚠️ 无效日期格式'); return }
    setDateResult(`秒: ${Math.floor(d.getTime() / 1000)}\n毫秒: ${d.getTime()}`)
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">时间戳转换</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Unix 时间戳 ↔ 可读日期，支持多时区</p>

      {/* Current time */}
      <div className="tool-card mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">当前时间</p>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">{Math.floor(now / 1000)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">秒级 / {now} 毫秒级</p>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{toDateStr(now, tz)}</p>
          <button className="btn-secondary text-xs" onClick={() => copy(String(Math.floor(now / 1000)))}>复制秒级</button>
        </div>
      </div>

      {/* Timezone selector */}
      <div className="mb-4">
        <label className="label">时区</label>
        <select className="tool-input" value={tz} onChange={e => setTz(e.target.value)}>
          {TZ_LIST.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Timestamp → Date */}
        <div className="tool-card">
          <p className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">时间戳 → 日期</p>
          <label className="label">Unix 时间戳（秒或毫秒）</label>
          <input type="text" className="tool-input w-full mb-2" value={tsInput} onChange={e => setTsInput(e.target.value)}
            placeholder="1700000000" />
          <button className="btn-primary w-full mb-2" onClick={convertTs}>转换</button>
          {tsResult && <p className={`text-sm font-mono p-2 rounded bg-gray-50 dark:bg-gray-900 ${tsResult.startsWith('⚠️') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{tsResult}</p>}
        </div>

        {/* Date → Timestamp */}
        <div className="tool-card">
          <p className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">日期 → 时间戳</p>
          <label className="label">日期时间（如 2024-01-01 12:00:00）</label>
          <input type="datetime-local" className="tool-input w-full mb-2" value={dateInput} onChange={e => setDateInput(e.target.value)} />
          <button className="btn-primary w-full mb-2" onClick={convertDate}>转换</button>
          {dateResult && <pre className={`text-sm font-mono p-2 rounded bg-gray-50 dark:bg-gray-900 ${dateResult.startsWith('⚠️') ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{dateResult}</pre>}
        </div>
      </div>
    </div>
  )
}
