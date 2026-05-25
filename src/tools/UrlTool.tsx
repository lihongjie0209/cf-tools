import { useState } from 'react'

type Mode = 'encode' | 'decode'

export default function UrlTool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const output = (() => {
    if (!input) return ''
    try {
      return mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input)
    } catch {
      return '⚠️ 转换失败：输入包含无效字符'
    }
  })()

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">URL 编解码</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">encodeURIComponent / decodeURIComponent，实时转换</p>

      <div className="flex gap-1 mb-4">
        {(['encode', 'decode'] as Mode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setInput('') }}
            className={mode === m ? 'tab-btn-active' : 'tab-btn-inactive'}>
            {m === 'encode' ? '编码' : '解码'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="label">{mode === 'encode' ? '原始文本' : 'URL 编码字符串'}</label>
          <textarea className="tool-textarea h-64" value={input} onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'https://example.com/path?key=值&foo=bar' : 'https%3A%2F%2Fexample.com%2F...'}
          />
          <button className="btn-secondary mt-2" onClick={() => setInput('')}>清空</button>
        </div>
        <div>
          <label className="label">结果（实时）</label>
          <textarea className="tool-textarea h-64" value={output} readOnly placeholder="实时显示转换结果..." />
          {output && !output.startsWith('⚠️') && (
            <button className="btn-secondary mt-2" onClick={copy}>
              {copied ? '✅ 已复制' : '复制'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
