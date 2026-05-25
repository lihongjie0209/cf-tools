import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function UuidTool() {
  const [count, setCount] = useState(5)
  const [uuids, setUuids] = useState<string[]>([])
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [uppercase, setUppercase] = useState(false)
  const [noDash, setNoDash] = useState(false)

  function generate() {
    const list = Array.from({ length: count }, () => {
      let id = uuidv4()
      if (noDash) id = id.replace(/-/g, '')
      if (uppercase) id = id.toUpperCase()
      return id
    })
    setUuids(list)
  }

  function copyOne(idx: number) {
    navigator.clipboard.writeText(uuids[idx])
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join('\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">UUID 生成器</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">批量生成 UUID v4</p>

      <div className="tool-card mb-4">
        <div className="flex flex-wrap gap-4 items-center mb-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">数量</label>
            <input type="number" className="tool-input w-20" min={1} max={100} value={count}
              onChange={e => setCount(Math.min(100, Math.max(1, Number(e.target.value))))} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} className="rounded" />
            大写
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={noDash} onChange={e => setNoDash(e.target.checked)} className="rounded" />
            去掉连字符
          </label>
        </div>
        <button className="btn-primary" onClick={generate}>生成</button>
      </div>

      {uuids.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{uuids.length} 个 UUID</span>
            <button className="btn-secondary" onClick={copyAll}>{copiedAll ? '✅ 已复制' : '复制全部'}</button>
          </div>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {uuids.map((id, i) => (
              <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{id}</span>
                <button className="btn-secondary text-xs ml-2 shrink-0" onClick={() => copyOne(i)}>
                  {copiedIdx === i ? '✅' : '复制'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
