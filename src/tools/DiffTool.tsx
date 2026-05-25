import { useState } from 'react'
import { diffLines, diffWords, type Change } from 'diff'

type DiffMode = 'lines' | 'words'

export default function DiffTool() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [changes, setChanges] = useState<Change[]>([])
  const [mode, setMode] = useState<DiffMode>('lines')
  const [compared, setCompared] = useState(false)

  function compare() {
    const result = mode === 'lines' ? diffLines(left, right) : diffWords(left, right)
    setChanges(result)
    setCompared(true)
  }

  const stats = changes.reduce(
    (acc, c) => {
      if (c.added) acc.added += c.count || 1
      if (c.removed) acc.removed += c.count || 1
      return acc
    },
    { added: 0, removed: 0 }
  )

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">Diff 对比</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">对比两段文本的差异，支持行级和字符级</p>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="label">原始文本</label>
          <textarea className="tool-textarea h-52" value={left} onChange={e => setLeft(e.target.value)}
            placeholder="粘贴原始内容..." />
        </div>
        <div>
          <label className="label">修改后文本</label>
          <textarea className="tool-textarea h-52" value={right} onChange={e => setRight(e.target.value)}
            placeholder="粘贴修改后内容..." />
        </div>
      </div>

      <div className="flex gap-2 mb-4 items-center">
        <button className="btn-primary" onClick={compare}>对比</button>
        {(['lines', 'words'] as DiffMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} className={mode === m ? 'tab-btn-active' : 'tab-btn-inactive'}>
            {m === 'lines' ? '行级' : '字符级'}
          </button>
        ))}
        <button className="btn-secondary ml-auto" onClick={() => { setLeft(''); setRight(''); setChanges([]); setCompared(false) }}>清空</button>
      </div>

      {compared && changes.length > 0 && (
        <div>
          {/* Stats */}
          <div className="flex gap-3 mb-3">
            <span className="text-sm text-green-600 dark:text-green-400">+{stats.added} 新增</span>
            <span className="text-sm text-red-600 dark:text-red-400">-{stats.removed} 删除</span>
            <span className="text-sm text-gray-500">{changes.filter(c => !c.added && !c.removed).length} 未变</span>
          </div>

          <div className="tool-card overflow-auto max-h-96">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {changes.map((part, i) => (
                <span
                  key={i}
                  className={
                    part.added
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                      : part.removed
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 line-through'
                        : 'text-gray-600 dark:text-gray-400'
                  }
                >
                  {part.value}
                </span>
              ))}
            </pre>
          </div>
        </div>
      )}

      {compared && changes.length > 0 && changes.every(c => !c.added && !c.removed) && (
        <div className="tool-card text-center text-green-600 dark:text-green-400 py-4">
          ✅ 两段文本完全相同
        </div>
      )}
    </div>
  )
}
