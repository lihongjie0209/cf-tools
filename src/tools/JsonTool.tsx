import { useState } from 'react'
import { diffLines, type Change } from 'diff'

type Tab = 'format' | 'minify' | 'compare'

function tryFormat(str: string): { ok: boolean; result: string } {
  try {
    const parsed = JSON.parse(str)
    return { ok: true, result: JSON.stringify(parsed, null, 2) }
  } catch (e: any) {
    return { ok: false, result: e.message }
  }
}

function tryMinify(str: string): { ok: boolean; result: string } {
  try {
    const parsed = JSON.parse(str)
    return { ok: true, result: JSON.stringify(parsed) }
  } catch (e: any) {
    return { ok: false, result: e.message }
  }
}

export default function JsonTool() {
  const [tab, setTab] = useState<Tab>('format')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [leftJson, setLeftJson] = useState('')
  const [rightJson, setRightJson] = useState('')
  const [diff, setDiff] = useState<Change[]>([])
  const [copied, setCopied] = useState(false)

  function handleFormat() {
    const { ok, result } = tryFormat(input)
    if (ok) { setOutput(result); setError('') }
    else { setOutput(''); setError(result) }
  }

  function handleMinify() {
    const { ok, result } = tryMinify(input)
    if (ok) { setOutput(result); setError('') }
    else { setOutput(''); setError(result) }
  }

  function handleCompare() {
    const lRes = tryFormat(leftJson)
    const rRes = tryFormat(rightJson)
    if (!lRes.ok) { setError('左侧 JSON 错误: ' + lRes.result); return }
    if (!rRes.ok) { setError('右侧 JSON 错误: ' + rRes.result); return }
    setError('')
    setDiff(diffLines(lRes.result, rRes.result))
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">JSON 工具</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">格式化、压缩 JSON，或对比两份 JSON 的差异</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(['format', 'minify', 'compare'] as Tab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setOutput(''); setError('') }}
            className={tab === t ? 'tab-btn-active' : 'tab-btn-inactive'}>
            {t === 'format' ? '格式化' : t === 'minify' ? '压缩' : '对比'}
          </button>
        ))}
      </div>

      {tab !== 'compare' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">输入 JSON</label>
            <textarea className="tool-textarea h-72" value={input} onChange={e => setInput(e.target.value)} placeholder='{"key": "value"}' />
            <div className="flex gap-2 mt-2">
              <button className="btn-primary" onClick={tab === 'format' ? handleFormat : handleMinify}>
                {tab === 'format' ? '格式化' : '压缩'}
              </button>
              <button className="btn-secondary" onClick={() => { setInput(''); setOutput(''); setError('') }}>清空</button>
            </div>
          </div>
          <div>
            <label className="label">输出</label>
            {error
              ? <div className="tool-textarea h-72 text-red-500 overflow-auto">{error}</div>
              : <textarea className="tool-textarea h-72" value={output} readOnly />
            }
            {output && (
              <button className="btn-secondary mt-2" onClick={() => copy(output)}>
                {copied ? '✅ 已复制' : '复制'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="label">左侧 JSON</label>
              <textarea className="tool-textarea h-60" value={leftJson} onChange={e => setLeftJson(e.target.value)} placeholder='{"a": 1}' />
            </div>
            <div>
              <label className="label">右侧 JSON</label>
              <textarea className="tool-textarea h-60" value={rightJson} onChange={e => setRightJson(e.target.value)} placeholder='{"a": 2}' />
            </div>
          </div>
          <button className="btn-primary mb-3" onClick={handleCompare}>对比</button>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          {diff.length > 0 && (
            <div className="tool-card overflow-auto max-h-96">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {diff.map((part, i) => (
                  <span key={i} className={part.added ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : part.removed ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'text-gray-600 dark:text-gray-400'}>
                    {part.value}
                  </span>
                ))}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
