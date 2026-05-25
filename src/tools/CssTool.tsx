import { useState } from 'react'

type Tab = 'format' | 'unit'

function formatCss(css: string): string {
  // Simple CSS formatter
  let result = ''
  let depth = 0
  const indent = '  '
  css = css.replace(/\s+/g, ' ').trim()
  for (let i = 0; i < css.length; i++) {
    const ch = css[i]
    if (ch === '{') {
      result += ' {\n'
      depth++
    } else if (ch === '}') {
      depth--
      result += '\n' + indent.repeat(depth) + '}\n\n'
    } else if (ch === ';') {
      result += ';\n' + indent.repeat(depth)
    } else if (ch === ':' && css[i + 1] === ' ') {
      result += ': '
      i++ // skip space
    } else {
      if (result.endsWith('\n') && depth > 0 && ch !== ' ') {
        result += indent.repeat(depth)
      }
      result += ch
    }
  }
  return result.trim()
}

export default function CssTool() {
  const [tab, setTab] = useState<Tab>('format')
  const [cssInput, setCssInput] = useState('')
  const [cssOutput, setCssOutput] = useState('')
  const [pxVal, setPxVal] = useState('')
  const [remBase, setRemBase] = useState('16')
  const [copied, setCopied] = useState(false)

  function handleFormat() {
    setCssOutput(formatCss(cssInput))
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const base = parseFloat(remBase) || 16
  const px = parseFloat(pxVal)
  const rem = !isNaN(px) ? (px / base).toFixed(4) : ''
  const vw100 = !isNaN(px) ? ((px / 1920) * 100).toFixed(4) : ''
  const vw375 = !isNaN(px) ? ((px / 375) * 100).toFixed(4) : ''

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">CSS 工具</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">CSS 格式化美化，以及 px ↔ rem/vw 单位换算</p>

      <div className="flex gap-1 mb-4">
        {(['format', 'unit'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'tab-btn-active' : 'tab-btn-inactive'}>
            {t === 'format' ? '格式化' : '单位换算'}
          </button>
        ))}
      </div>

      {tab === 'format' ? (
        <div className="grid max-w-full grid-cols-1 xl:grid-cols-2 gap-4">
          <div>
            <label className="label">输入 CSS</label>
            <textarea className="tool-textarea h-96" value={cssInput} onChange={e => setCssInput(e.target.value)}
              placeholder=".btn{color:red;background:blue;}" />
            <div className="flex gap-2 mt-2">
              <button className="btn-primary" onClick={handleFormat}>格式化</button>
              <button className="btn-secondary" onClick={() => { setCssInput(''); setCssOutput('') }}>清空</button>
            </div>
          </div>
          <div>
            <label className="label">输出</label>
            <textarea className="tool-textarea h-96" value={cssOutput} readOnly placeholder="格式化结果..." />
            {cssOutput && <button className="btn-secondary mt-2" onClick={() => copy(cssOutput)}>{copied ? '✅ 已复制' : '复制'}</button>}
          </div>
        </div>
      ) : (
        <div className="tool-card">
          <div className="flex gap-3 items-center mb-4">
            <div>
              <label className="label">根字体大小（rem 基准）</label>
              <div className="flex items-center gap-1">
                <input type="number" className="tool-input w-20" value={remBase} onChange={e => setRemBase(e.target.value)} />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="label">像素值（px）</label>
            <div className="flex items-center gap-2">
              <input type="number" className="tool-input w-32" value={pxVal} onChange={e => setPxVal(e.target.value)} placeholder="16" />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>
          {pxVal && !isNaN(px) && (
            <div className="space-y-2">
              {[
                { label: 'rem', value: rem, desc: `基准 ${remBase}px` },
                { label: 'vw (1920px 设计稿)', value: vw100 + 'vw', desc: '1920px 宽度' },
                { label: 'vw (375px 移动端)', value: vw375 + 'vw', desc: '375px 宽度' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                  <div>
                    <span className="text-xs text-gray-500">{item.desc}</span>
                    <p className="font-mono font-bold text-blue-600 dark:text-blue-400">{item.value}{item.label === 'rem' ? 'rem' : ''}</p>
                  </div>
                  <button className="btn-secondary text-xs" onClick={() => copy(`${item.value}${item.label === 'rem' ? 'rem' : ''}`)}>复制</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
