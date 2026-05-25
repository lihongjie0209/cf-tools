import { useState } from 'react'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
interface Header { key: string; value: string }

const METHODS: Method[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

type OutputTab = 'curl' | 'fetch'

export default function HttpTool() {
  const [method, setMethod] = useState<Method>('GET')
  const [url, setUrl] = useState('https://api.example.com/users')
  const [headers, setHeaders] = useState<Header[]>([{ key: 'Content-Type', value: 'application/json' }])
  const [body, setBody] = useState('')
  const [outTab, setOutTab] = useState<OutputTab>('curl')

  function addHeader() { setHeaders(h => [...h, { key: '', value: '' }]) }
  function removeHeader(i: number) { setHeaders(h => h.filter((_, idx) => idx !== i)) }
  function updateHeader(i: number, field: 'key' | 'value', val: string) {
    setHeaders(h => h.map((hdr, idx) => idx === i ? { ...hdr, [field]: val } : hdr))
  }

  const validHeaders = headers.filter(h => h.key.trim())

  const curl = (() => {
    const parts = [`curl -X ${method}`]
    for (const h of validHeaders) parts.push(`  -H "${h.key}: ${h.value}"`)
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      parts.push(`  -d '${body.replace(/'/g, "\\'")}'`)
    }
    parts.push(`  "${url}"`)
    return parts.join(' \\\n')
  })()

  const fetchCode = (() => {
    const opts: Record<string, unknown> = { method }
    if (validHeaders.length) {
      opts.headers = Object.fromEntries(validHeaders.map(h => [h.key, h.value]))
    }
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) opts.body = body
    const optsStr = JSON.stringify(opts, null, 2)
    return `const response = await fetch("${url}", ${optsStr});\nconst data = await response.json();\nconsole.log(data);`
  })()

  const output = outTab === 'curl' ? curl : fetchCode
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">HTTP 请求构建器</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">构建 HTTP 请求，生成 curl 命令和 fetch 代码</p>

      <div className="tool-card mb-4">
        {/* Method + URL */}
        <div className="flex gap-2 mb-4">
          <select className="tool-input w-28 font-mono font-bold" value={method}
            onChange={e => setMethod(e.target.value as Method)}>
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="url" className="tool-input flex-1" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" />
        </div>

        {/* Headers */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Headers</label>
            <button className="btn-secondary text-xs" onClick={addHeader}>+ 添加</button>
          </div>
          <div className="space-y-2">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" className="tool-input flex-1 font-mono text-xs" value={h.key}
                  onChange={e => updateHeader(i, 'key', e.target.value)} placeholder="Header-Name" />
                <input type="text" className="tool-input flex-1 font-mono text-xs" value={h.value}
                  onChange={e => updateHeader(i, 'value', e.target.value)} placeholder="value" />
                <button onClick={() => removeHeader(i)} className="text-red-400 hover:text-red-600 px-2 text-sm">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        {['POST', 'PUT', 'PATCH'].includes(method) && (
          <div>
            <label className="label">Body</label>
            <textarea className="tool-textarea h-28" value={body} onChange={e => setBody(e.target.value)}
              placeholder='{"key": "value"}' />
          </div>
        )}
      </div>

      {/* Output */}
      <div className="tool-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            {(['curl', 'fetch'] as OutputTab[]).map(t => (
              <button key={t} onClick={() => setOutTab(t)} className={outTab === t ? 'tab-btn-active' : 'tab-btn-inactive'}>
                {t === 'curl' ? 'cURL' : 'fetch (JS)'}
              </button>
            ))}
          </div>
          <button className="btn-secondary" onClick={copy}>{copied ? '✅ 已复制' : '复制'}</button>
        </div>
        <pre className="bg-gray-900 text-green-400 text-xs font-mono p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
          {output}
        </pre>
      </div>
    </div>
  )
}
