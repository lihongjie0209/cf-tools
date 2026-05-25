import { useState, useRef } from 'react'
import CryptoJS from 'crypto-js'

const ALGOS = ['MD5', 'SHA1', 'SHA256', 'SHA512'] as const
type Algo = typeof ALGOS[number]

function computeHash(text: string, algo: Algo): string {
  switch (algo) {
    case 'MD5': return CryptoJS.MD5(text).toString()
    case 'SHA1': return CryptoJS.SHA1(text).toString()
    case 'SHA256': return CryptoJS.SHA256(text).toString()
    case 'SHA512': return CryptoJS.SHA512(text).toString()
  }
}

export default function HashTool() {
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<Algo, string> | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [uppercase, setUppercase] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function compute() {
    if (!input) return
    const result = {} as Record<Algo, string>
    for (const algo of ALGOS) {
      result[algo] = uppercase ? computeHash(input, algo).toUpperCase() : computeHash(input, algo)
    }
    setHashes(result)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const wordArray = CryptoJS.lib.WordArray.create(reader.result as ArrayBuffer)
      const result = {} as Record<Algo, string>
      result['MD5'] = CryptoJS.MD5(wordArray).toString()
      result['SHA1'] = CryptoJS.SHA1(wordArray).toString()
      result['SHA256'] = CryptoJS.SHA256(wordArray).toString()
      result['SHA512'] = CryptoJS.SHA512(wordArray).toString()
      if (uppercase) for (const k of ALGOS) result[k] = result[k].toUpperCase()
      setHashes(result)
      setInput(`[文件: ${file.name}]`)
    }
    reader.readAsArrayBuffer(file)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">Hash 计算</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">计算文本或文件的 MD5、SHA1、SHA256、SHA512</p>

      <div className="tool-card mb-4">
        <label className="label">输入文本</label>
        <textarea className="tool-textarea h-32 mb-3" value={input} onChange={e => setInput(e.target.value)}
          placeholder="输入要计算 Hash 的文本..." />
        <div className="flex flex-wrap gap-2 items-center">
          <button className="btn-primary" onClick={compute}>计算</button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>📁 选择文件</button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer ml-auto">
            <input type="checkbox" checked={uppercase} onChange={e => setUppercase(e.target.checked)} />
            大写
          </label>
          <button className="btn-secondary" onClick={() => { setInput(''); setHashes(null) }}>清空</button>
        </div>
      </div>

      {hashes && (
        <div className="space-y-2">
          {ALGOS.map(algo => (
            <div key={algo} className="tool-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{algo}</span>
                <button className="btn-secondary text-xs" onClick={() => copy(hashes[algo], algo)}>
                  {copied === algo ? '✅ 已复制' : '复制'}
                </button>
              </div>
              <p className="font-mono text-sm break-all text-gray-800 dark:text-gray-200">{hashes[algo]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
