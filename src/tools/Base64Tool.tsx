import { useState, useRef } from 'react'

type Mode = 'encode' | 'decode'

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleConvert() {
    setError('')
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))))
      }
    } catch {
      setError(mode === 'encode' ? '编码失败' : '解码失败：请确保输入是有效的 Base64 字符串')
      setOutput('')
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setOutput(result.split(',')[1] || result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">Base64</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">文本与 Base64 互转，支持文件 Base64 编码</p>

      <div className="flex gap-1 mb-4">
        {(['encode', 'decode'] as Mode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setInput(''); setOutput(''); setError('') }}
            className={mode === m ? 'tab-btn-active' : 'tab-btn-inactive'}>
            {m === 'encode' ? '编码' : '解码'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">{mode === 'encode' ? '输入文本' : '输入 Base64'}</label>
          <textarea className="tool-textarea h-40" value={input} onChange={e => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入 Base64 字符串...'} />
        </div>

        <div className="flex gap-2 items-center">
          <button className="btn-primary" onClick={handleConvert}>
            {mode === 'encode' ? '编码 →' : '解码 →'}
          </button>
          {mode === 'encode' && (
            <>
              <button className="btn-secondary" onClick={() => fileRef.current?.click()}>📁 文件编码</button>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
            </>
          )}
          <button className="btn-secondary" onClick={() => { setInput(''); setOutput(''); setError('') }}>清空</button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="label">输出</label>
          <textarea className="tool-textarea h-40" value={output} readOnly placeholder="结果将显示在这里..." />
          {output && (
            <button className="btn-secondary mt-2" onClick={copy}>
              {copied ? '✅ 已复制' : '复制'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
