import { useState } from 'react'

interface Match {
  fullMatch: string
  groups: string[]
  index: number
}

export default function RegexTool() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testStr, setTestStr] = useState('')
  const [error, setError] = useState('')

  const toggleFlag = (f: string) =>
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)

  const { matches, highlighted } = (() => {
    if (!pattern || !testStr) return { matches: [], highlighted: null }
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      setError('')
      const ms: Match[] = []
      let m: RegExpExecArray | null
      while ((m = re.exec(testStr)) !== null) {
        ms.push({ fullMatch: m[0], groups: m.slice(1), index: m.index })
        if (!flags.includes('g')) break
      }
      // build highlighted segments
      const segs: { text: string; matched: boolean }[] = []
      let last = 0
      for (const match of ms) {
        if (match.index > last) segs.push({ text: testStr.slice(last, match.index), matched: false })
        segs.push({ text: match.fullMatch, matched: true })
        last = match.index + match.fullMatch.length
      }
      if (last < testStr.length) segs.push({ text: testStr.slice(last), matched: false })
      return { matches: ms, highlighted: segs }
    } catch (e: any) {
      setError(e.message)
      return { matches: [], highlighted: null }
    }
  })()

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">Regex 测试器</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">实时测试正则表达式，高亮匹配结果</p>

      {/* Pattern */}
      <div className="tool-card mb-3">
        <div className="flex gap-2 items-center mb-2">
          <span className="text-gray-400 text-lg">/</span>
          <input type="text" className="tool-input flex-1 font-mono" value={pattern}
            onChange={e => setPattern(e.target.value)} placeholder="正则表达式..." />
          <span className="text-gray-400 text-lg">/</span>
          <input type="text" className="tool-input w-16 font-mono" value={flags}
            onChange={e => setFlags(e.target.value)} placeholder="flags" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['g', 'i', 'm', 's'].map(f => (
            <button key={f} onClick={() => toggleFlag(f)}
              className={`px-2.5 py-1 text-xs rounded border font-mono transition-colors ${flags.includes(f) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400'}`}>
              {f} <span className="font-sans opacity-70">({f === 'g' ? 'global' : f === 'i' ? 'ignore case' : f === 'm' ? 'multiline' : 'dot all'})</span>
            </button>
          ))}
        </div>
        {error && <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>}
      </div>

      {/* Test string */}
      <div className="mb-3">
        <label className="label">测试字符串</label>
        <textarea className="tool-textarea h-32" value={testStr} onChange={e => setTestStr(e.target.value)}
          placeholder="输入要测试的字符串..." />
      </div>

      {/* Highlighted result */}
      {highlighted && testStr && (
        <div className="tool-card mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">匹配高亮（共 {matches.length} 处）</p>
          <p className="font-mono text-sm whitespace-pre-wrap break-all">
            {highlighted.map((seg, i) =>
              seg.matched
                ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-gray-100 rounded px-0.5">{seg.text}</mark>
                : <span key={i} className="text-gray-700 dark:text-gray-300">{seg.text}</span>
            )}
          </p>
        </div>
      )}

      {/* Matches table */}
      {matches.length > 0 && (
        <div className="tool-card overflow-x-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">匹配详情</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-1 pr-4">#</th>
                <th className="pb-1 pr-4">匹配内容</th>
                <th className="pb-1 pr-4">位置</th>
                <th className="pb-1">捕获组</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-1.5 pr-4 text-gray-500">{i + 1}</td>
                  <td className="py-1.5 pr-4 font-mono text-green-700 dark:text-green-400">{m.fullMatch || '(空字符串)'}</td>
                  <td className="py-1.5 pr-4 text-gray-600 dark:text-gray-400">{m.index}</td>
                  <td className="py-1.5 font-mono text-xs text-gray-600 dark:text-gray-400">{m.groups.length > 0 ? m.groups.map((g, gi) => `$${gi + 1}: ${g ?? 'undefined'}`).join('  ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
