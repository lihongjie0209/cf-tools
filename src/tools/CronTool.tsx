import { useState } from 'react'
import cronstrue from 'cronstrue/i18n'

function getNextRuns(cronExpr: string, count = 5): Date[] {
  // Simple next-run calculator for standard 5-field cron
  // Uses a brute-force minute-by-minute approach for simplicity
  try {
    const parts = cronExpr.trim().split(/\s+/)
    if (parts.length !== 5) return []
    const [minP, hourP, domP, monP, dowP] = parts

    function matchField(val: number, field: string, min: number, max: number): boolean {
      if (field === '*') return true
      for (const part of field.split(',')) {
        if (part.includes('/')) {
          const [range, step] = part.split('/')
          const s = parseInt(step)
          const start = range === '*' ? min : parseInt(range)
          for (let i = start; i <= max; i += s) if (i === val) return true
        } else if (part.includes('-')) {
          const [lo, hi] = part.split('-').map(Number)
          if (val >= lo && val <= hi) return true
        } else {
          if (parseInt(part) === val) return true
        }
      }
      return false
    }

    const results: Date[] = []
    let d = new Date()
    d.setSeconds(0, 0)
    d.setMinutes(d.getMinutes() + 1)

    for (let i = 0; i < 100000 && results.length < count; i++) {
      const min = d.getMinutes(), hour = d.getHours()
      const dom = d.getDate(), mon = d.getMonth() + 1, dow = d.getDay()
      if (
        matchField(min, minP, 0, 59) &&
        matchField(hour, hourP, 0, 23) &&
        matchField(dom, domP, 1, 31) &&
        matchField(mon, monP, 1, 12) &&
        matchField(dow, dowP, 0, 6)
      ) {
        results.push(new Date(d))
      }
      d.setMinutes(d.getMinutes() + 1)
    }
    return results
  } catch {
    return []
  }
}

export default function CronTool() {
  const [expr, setExpr] = useState('0 9 * * 1-5')
  const [desc, setDesc] = useState('')
  const [nextRuns, setNextRuns] = useState<Date[]>([])
  const [error, setError] = useState('')

  function parse() {
    try {
      const d = cronstrue.toString(expr, { locale: 'zh_CN', throwExceptionOnParseError: true })
      setDesc(d)
      setNextRuns(getNextRuns(expr))
      setError('')
    } catch (e: any) {
      setError(e.toString())
      setDesc('')
      setNextRuns([])
    }
  }

  const EXAMPLES = [
    { label: '每天9点', expr: '0 9 * * *' },
    { label: '每周一到五9点', expr: '0 9 * * 1-5' },
    { label: '每小时', expr: '0 * * * *' },
    { label: '每5分钟', expr: '*/5 * * * *' },
    { label: '每月1号0点', expr: '0 0 1 * *' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">CRON 解析器</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">解析 CRON 表达式，显示自然语言描述和下次执行时间</p>

      <div className="tool-card mb-4">
        <label className="label">CRON 表达式（5 字段）</label>
        <div className="flex gap-2 mb-2">
          <input type="text" className="tool-input flex-1 font-mono" value={expr} onChange={e => setExpr(e.target.value)}
            placeholder="* * * * *" />
          <button className="btn-primary" onClick={parse}>解析</button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {EXAMPLES.map(ex => (
            <button key={ex.expr} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 font-mono transition-colors"
              onClick={() => { setExpr(ex.expr); }}>
              {ex.label}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-400 grid grid-cols-5 gap-1">
          {['分钟', '小时', '日', '月', '星期'].map((f, i) => (
            <div key={i} className="text-center bg-gray-50 dark:bg-gray-900 px-1 py-0.5 rounded">{f}</div>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">⚠️ {error}</p>}

      {desc && (
        <div className="tool-card mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">含义</p>
          <p className="text-base font-semibold text-blue-600 dark:text-blue-400">{desc}</p>
        </div>
      )}

      {nextRuns.length > 0 && (
        <div className="tool-card">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">接下来 5 次执行时间</p>
          <div className="space-y-1.5">
            {nextRuns.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{d.toLocaleString('zh-CN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
