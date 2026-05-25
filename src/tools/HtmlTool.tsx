import { useMemo, useState } from 'react'

type Mode = 'encode' | 'decode'

function encodeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return Array.from(text).map(char => {
    if (map[char]) return map[char]
    const code = char.codePointAt(0) ?? 0
    return code > 126 ? `&#${code};` : char
  }).join('')
}

function decodeHtml(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

export default function HtmlTool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => {
    if (!input) return ''
    return mode === 'encode' ? encodeHtml(input) : decodeHtml(input)
  }, [input, mode])

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">HTML 编解码</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">HTML Entity 实时编码和解码，支持命名实体与数字实体</p>

      <div className="flex gap-1 mb-4">
        {(['encode', 'decode'] as Mode[]).map(item => (
          <button key={item} className={mode === item ? 'tab-btn-active' : 'tab-btn-inactive'} onClick={() => setMode(item)}>
            {item === 'encode' ? '编码' : '解码'}
          </button>
        ))}
      </div>

      <div className="grid max-w-full grid-cols-1 xl:grid-cols-2 gap-4">
        <div>
          <label className="label">{mode === 'encode' ? '原始 HTML / 文本' : 'HTML 实体字符串'}</label>
          <textarea
            className="tool-textarea h-96"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '<div class="card">Tom & Jerry</div>' : '&lt;div&gt;Tom &amp; Jerry&lt;/div&gt;'}
          />
        </div>
        <div>
          <label className="label">结果（实时）</label>
          <textarea className="tool-textarea h-96" value={output} readOnly placeholder="转换结果会实时显示在这里" />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="btn-secondary" onClick={copy} disabled={!output}>{copied ? '✅ 已复制' : '复制结果'}</button>
        <button className="btn-secondary" onClick={() => setInput('')}>清空</button>
      </div>
    </div>
  )
}
