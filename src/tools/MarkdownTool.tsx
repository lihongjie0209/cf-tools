import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

const SAMPLE = `# Markdown 预览

这是一个 **Markdown** 编辑器，支持 GFM 语法。

## 代码高亮

\`\`\`typescript
const greet = (name: string) => \`Hello, \${name}!\`
console.log(greet('World'))
\`\`\`

## 表格

| 名称 | 类型 | 说明 |
|------|------|------|
| id   | string | 唯一标识 |
| name | string | 名称 |

## 列表

- [x] 支持 GFM
- [x] 代码高亮
- [ ] 实时预览

> 这是引用文本
`

export default function MarkdownTool() {
  const [content, setContent] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Markdown 预览</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">左侧编辑，右侧实时预览，支持 GFM 和代码高亮</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={copy}>{copied ? '✅ 已复制' : '复制'}</button>
          <button className="btn-secondary" onClick={() => setContent('')}>清空</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex flex-col">
          <label className="label">编辑</label>
          <textarea
            className="tool-textarea flex-1 resize-none"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label className="label">预览</label>
          <div className="flex-1 overflow-y-auto tool-card prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
