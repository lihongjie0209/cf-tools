import { useMemo, useState } from 'react'

interface FrequencyItem {
  label: string
  count: number
}

function formatReadingTime(words: number): string {
  if (words === 0) return '0 分钟'
  if (words < 200) return '< 1 分钟'
  return `${Math.ceil(words / 200)} 分钟`
}

export default function TextStatsTool() {
  const [input, setInput] = useState('')

  const stats = useMemo(() => {
    const characters = Array.from(input).length
    const charactersWithoutSpaces = Array.from(input.replace(/\s/g, '')).length
    const words = input.toLowerCase().match(/[a-z0-9\u00C0-\u024F\u4E00-\u9FFF]+/g) ?? []
    const sentences = input.split(/[.!?。！？]+/).map(item => item.trim()).filter(Boolean).length
    const lines = input ? input.split(/\r?\n/).length : 0
    const paragraphs = input.trim() ? input.trim().split(/\n\s*\n/).filter(Boolean).length : 0

    const wordFrequency = words.reduce<Map<string, number>>((map, word) => {
      map.set(word, (map.get(word) ?? 0) + 1)
      return map
    }, new Map())

    const topWords: FrequencyItem[] = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }))

    const charFrequency = Array.from(input.replace(/\s/g, '')).reduce<Map<string, number>>((map, char) => {
      map.set(char, (map.get(char) ?? 0) + 1)
      return map
    }, new Map())

    const topChars: FrequencyItem[] = Array.from(charFrequency.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }))

    return {
      characters,
      charactersWithoutSpaces,
      words: words.length,
      sentences,
      lines,
      paragraphs,
      topWords,
      topChars,
      maxCharCount: topChars[0]?.count ?? 1,
    }
  }, [input])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">文本统计</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">实时分析文本长度、词频、阅读时间和字符分布</p>

      <div className="mb-4">
        <label className="label">输入文本</label>
        <textarea className="tool-textarea h-96" value={input} onChange={e => setInput(e.target.value)} placeholder="粘贴要分析的文本内容..." />
      </div>

      <div className="grid max-w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
        {[
          { label: '字符数', value: stats.characters },
          { label: '非空白字符', value: stats.charactersWithoutSpaces },
          { label: '单词数', value: stats.words },
          { label: '句子数', value: stats.sentences },
          { label: '行数', value: stats.lines },
          { label: '段落数', value: stats.paragraphs },
        ].map(item => (
          <div key={item.label} className="tool-card">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.label}</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="tool-card mb-4">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">阅读时间估算</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">按 200 词 / 分钟估算：<span className="font-medium text-green-600 dark:text-green-400">{formatReadingTime(stats.words)}</span></p>
      </div>

      <div className="grid max-w-full grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="tool-card">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Top 10 高频词</p>
          {stats.topWords.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">输入文本后显示词频统计</p>
          ) : (
            <div className="space-y-2">
              {stats.topWords.map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-mono">{item.label}</span>
                  <span className="text-blue-600 dark:text-blue-400">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tool-card">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Top 10 字符频率</p>
          {stats.topChars.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">输入文本后显示字符柱状图</p>
          ) : (
            <div className="space-y-3">
              {stats.topChars.map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span className="font-mono">{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(item.count / stats.maxCharCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
