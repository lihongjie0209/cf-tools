import { useState } from 'react'

function decodeBase64Url(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  try {
    return decodeURIComponent(escape(atob(str)))
  } catch {
    return atob(str)
  }
}

function parseJwt(token: string) {
  const parts = token.trim().split('.')
  if (parts.length !== 3) throw new Error('无效的 JWT：应包含 3 个部分（header.payload.signature）')
  const header = JSON.parse(decodeBase64Url(parts[0]))
  const payload = JSON.parse(decodeBase64Url(parts[1]))
  return { header, payload, signature: parts[2] }
}

function getExpStatus(payload: Record<string, unknown>) {
  if (!payload.exp) return null
  const now = Math.floor(Date.now() / 1000)
  const exp = payload.exp as number
  if (exp < now) return { label: '已过期', color: 'text-red-500', at: new Date(exp * 1000).toLocaleString('zh-CN') }
  const diff = exp - now
  const mins = Math.floor(diff / 60)
  const hrs = Math.floor(diff / 3600)
  const label = hrs > 0 ? `${hrs} 小时后过期` : mins > 0 ? `${mins} 分钟后过期` : `${diff} 秒后过期`
  return { label, color: 'text-green-500', at: new Date(exp * 1000).toLocaleString('zh-CN') }
}

function JsonBlock({ data }: { data: object }) {
  return (
    <pre className="bg-gray-900 text-green-300 text-xs font-mono p-3 rounded-lg overflow-auto whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

export default function JwtTool() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState<{ header: object; payload: Record<string, unknown>; signature: string } | null>(null)
  const [error, setError] = useState('')

  function decode() {
    try {
      setResult(parseJwt(token))
      setError('')
    } catch (e: any) {
      setError(e.message)
      setResult(null)
    }
  }

  const expStatus = result ? getExpStatus(result.payload) : null

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">JWT 解析器</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">解析 JWT Token，查看 Header/Payload 和过期状态</p>

      <div className="mb-4">
        <label className="label">粘贴 JWT Token</label>
        <textarea className="tool-textarea h-28 font-mono" value={token} onChange={e => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.xxx" />
        <div className="flex gap-2 mt-2">
          <button className="btn-primary" onClick={decode}>解析</button>
          <button className="btn-secondary" onClick={() => { setToken(''); setResult(null); setError('') }}>清空</button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">⚠️ {error}</p>}

      {result && (
        <div className="space-y-3">
          {/* Exp status */}
          {expStatus && (
            <div className={`tool-card border-l-4 ${expStatus.color.includes('red') ? 'border-red-400' : 'border-green-400'}`}>
              <span className={`font-medium text-sm ${expStatus.color}`}>⏱ {expStatus.label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({expStatus.at})</span>
            </div>
          )}

          {/* Token parts color display */}
          <div className="tool-card">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Token 结构</p>
            <p className="font-mono text-xs break-all">
              <span className="text-red-400">{token.split('.')[0]}</span>
              <span className="text-gray-400">.</span>
              <span className="text-blue-400">{token.split('.')[1]}</span>
              <span className="text-gray-400">.</span>
              <span className="text-green-400">{token.split('.')[2]}</span>
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-red-400 mb-1">Header</p>
            <JsonBlock data={result.header} />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-400 mb-1">Payload</p>
            <JsonBlock data={result.payload} />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-400 mb-1">Signature</p>
            <p className="font-mono text-xs bg-gray-900 text-green-300 p-3 rounded-lg break-all">{result.signature}</p>
          </div>
        </div>
      )}
    </div>
  )
}
