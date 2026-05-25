import { useMemo, useState } from 'react'

function splitWords(text: string): string[] {
  const normalized = text
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .trim()

  return normalized.match(/[A-Za-z0-9\u00C0-\u024F\u4E00-\u9FFF]+/g) ?? []
}

function capitalize(word: string): string {
  return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''
}

function reverseText(text: string): string {
  return Array.from(text).reverse().join('')
}

function removeDuplicateLines(text: string): string {
  const seen = new Set<string>()
  return text
    .split(/\r?\n/)
    .filter(line => {
      if (seen.has(line)) return false
      seen.add(line)
      return true
    })
    .join('\n')
}

function sortLines(text: string): string {
  return text
    .split(/\r?\n/)
    .sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' }))
    .join('\n')
}

function trimLines(text: string): string {
  return text.split(/\r?\n/).map(line => line.trim()).join('\n')
}

export default function StringTool() {
  const [input, setInput] = useState('hello world\nfoo_bar\nfoo_bar')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const words = useMemo(() => splitWords(input), [input])
  const stats = useMemo(() => {
    const lines = input ? input.split(/\r?\n/).length : 0
    return {
      chars: Array.from(input).length,
      words: words.length,
      lines,
    }
  }, [input, words.length])

  const caseOperations = [
    { label: 'camelCase', run: () => words.length ? words[0].toLowerCase() + words.slice(1).map(capitalize).join('') : '' },
    { label: 'PascalCase', run: () => words.map(capitalize).join('') },
    { label: 'snake_case', run: () => words.map(word => word.toLowerCase()).join('_') },
    { label: 'kebab-case', run: () => words.map(word => word.toLowerCase()).join('-') },
    { label: 'UPPER_SNAKE', run: () => words.map(word => word.toUpperCase()).join('_') },
    { label: 'Title Case', run: () => words.map(capitalize).join(' ') },
    { label: 'UPPERCASE', run: () => input.toUpperCase() },
    { label: 'lowercase', run: () => input.toLowerCase() },
  ]

  const textOperations = [
    { label: '反转文本', run: () => reverseText(input) },
    { label: '去重行', run: () => removeDuplicateLines(input) },
    { label: '排序行', run: () => sortLines(input) },
    { label: '逐行 Trim', run: () => trimLines(input) },
  ]

  function copyOutput() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">字符串工具</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">常见大小写转换、文本清洗与统计，一键处理开发中的字符串内容</p>

      <div className="grid max-w-full grid-cols-1 xl:grid-cols-2 gap-4">
        <div>
          <label className="label">输入文本</label>
          <textarea className="tool-textarea h-96" value={input} onChange={e => setInput(e.target.value)} placeholder="输入要处理的文本..." />
        </div>
        <div>
          <label className="label">输出结果</label>
          <textarea className="tool-textarea h-96" value={output} readOnly placeholder="点击下方按钮后在这里查看结果" />
        </div>
      </div>

      <div className="grid max-w-full grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4 mt-4">
        <div className="tool-card">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">大小写转换</p>
          <div className="flex flex-wrap gap-2">
            {caseOperations.map(item => (
              <button key={item.label} className="btn-secondary" onClick={() => setOutput(item.run())}>{item.label}</button>
            ))}
          </div>

          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">文本操作</p>
          <div className="flex flex-wrap gap-2">
            {textOperations.map(item => (
              <button key={item.label} className="btn-secondary" onClick={() => setOutput(item.run())}>{item.label}</button>
            ))}
          </div>
        </div>

        <div className="tool-card">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">快速统计</p>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>字符数：<span className="font-mono">{stats.chars}</span></p>
            <p>单词数：<span className="font-mono">{stats.words}</span></p>
            <p>行数：<span className="font-mono">{stats.lines}</span></p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button className="btn-primary" onClick={() => setInput(output)} disabled={!output}>输出覆盖输入</button>
            <button className="btn-secondary" onClick={copyOutput} disabled={!output}>{copied ? '✅ 已复制' : '复制输出'}</button>
            <button className="btn-secondary" onClick={() => { setInput(''); setOutput('') }}>清空</button>
          </div>
        </div>
      </div>
    </div>
  )
}
