import { useState } from 'react'

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

interface YamlLine {
  indent: number
  text: string
}

const SAMPLE_VALUE: JsonValue = {
  name: 'cf-tools',
  version: 1,
  enabled: true,
  tags: ['json', 'yaml', 'converter'],
  settings: {
    theme: 'dark',
    retries: 3,
    cache: null,
  },
}

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isScalar(value: JsonValue): value is null | boolean | number | string {
  return value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string'
}

function yamlScalar(value: null | boolean | number | string): string {
  if (value === null) return 'null'
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  if (value === '') return "''"
  if (/^[A-Za-z0-9_.-]+$/.test(value) && !/^(true|false|null|~)$/i.test(value)) return value
  return JSON.stringify(value)
}

function stringifyYaml(value: JsonValue, indent = 0): string {
  const space = ' '.repeat(indent)

  if (Array.isArray(value)) {
    if (value.length === 0) return `${space}[]`
    return value.map(item => {
      if (isScalar(item)) return `${space}- ${yamlScalar(item)}`
      if (Array.isArray(item)) return `${space}-\n${stringifyYaml(item, indent + 2)}`
      const nested = stringifyYaml(item, indent + 2).split('\n')
      return `${space}- ${nested[0].trimStart()}${nested.length > 1 ? `\n${nested.slice(1).join('\n')}` : ''}`
    }).join('\n')
  }

  if (isObject(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0) return `${space}{}`
    return entries.map(([key, child]) => {
      if (isScalar(child)) return `${space}${key}: ${yamlScalar(child)}`
      return `${space}${key}:\n${stringifyYaml(child, indent + 2)}`
    }).join('\n')
  }

  return `${space}${yamlScalar(value)}`
}

function preprocessYaml(raw: string): YamlLine[] {
  return raw
    .split(/\r?\n/)
    .map(line => line.replace(/\t/g, '  '))
    .filter(line => line.trim() && !line.trim().startsWith('#'))
    .map(line => ({
      indent: line.match(/^ */)?.[0].length ?? 0,
      text: line.trim(),
    }))
}

function splitKeyValue(text: string): [string, string] | null {
  const index = text.indexOf(':')
  if (index === -1) return null
  return [text.slice(0, index).trim(), text.slice(index + 1).trim()]
}

function parseScalar(raw: string): JsonValue {
  if (raw === 'null' || raw === '~') return null
  if (/^(true|false)$/i.test(raw)) return raw.toLowerCase() === 'true'
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  if (raw.startsWith('"') && raw.endsWith('"')) return JSON.parse(raw) as JsonValue
  if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1)
  if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
    try {
      return JSON.parse(raw) as JsonValue
    } catch {
      return raw
    }
  }
  return raw
}

function parseYaml(raw: string): JsonValue {
  const lines = preprocessYaml(raw)
  if (lines.length === 0) return null

  let index = 0

  function peek(): YamlLine | undefined {
    return lines[index]
  }

  function parseBlock(indent: number): JsonValue {
    const line = peek()
    if (!line) return null
    if (line.indent < indent) return null
    if (line.text.startsWith('-')) return parseArray(line.indent)
    if (splitKeyValue(line.text)) return parseObject(line.indent)
    index += 1
    return parseScalar(line.text)
  }

  function parseObject(indent: number): JsonValue {
    const result: { [key: string]: JsonValue } = {}

    while (true) {
      const line = peek()
      if (!line || line.indent < indent || line.text.startsWith('-')) break
      if (line.indent !== indent) throw new Error(`第 ${index + 1} 行缩进不正确`)

      const pair = splitKeyValue(line.text)
      if (!pair) throw new Error(`第 ${index + 1} 行缺少冒号`) 

      const [key, rest] = pair
      index += 1

      if (rest) {
        result[key] = parseScalar(rest)
      } else {
        const next = peek()
        result[key] = next && next.indent > line.indent ? parseBlock(next.indent) : null
      }
    }

    return result
  }

  function parseArray(indent: number): JsonValue {
    const result: JsonValue[] = []

    while (true) {
      const line = peek()
      if (!line || line.indent < indent) break
      if (line.indent !== indent || !line.text.startsWith('-')) break

      const content = line.text.slice(1).trimStart()
      index += 1

      if (!content) {
        const next = peek()
        result.push(next && next.indent > line.indent ? parseBlock(next.indent) : null)
        continue
      }

      const pair = splitKeyValue(content)
      if (pair) {
        const [key, rest] = pair
        const item: { [key: string]: JsonValue } = {}
        item[key] = rest ? parseScalar(rest) : (() => {
          const next = peek()
          return next && next.indent > line.indent ? parseBlock(next.indent) : null
        })()

        const next = peek()
        if (next && next.indent > line.indent) {
          const extra = parseObject(next.indent)
          if (isObject(extra)) Object.assign(item, extra)
        }

        result.push(item)
      } else {
        result.push(parseScalar(content))
      }
    }

    return result
  }

  return parseBlock(0)
}

export default function JsonYamlTool() {
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLE_VALUE, null, 2))
  const [yamlText, setYamlText] = useState(stringifyYaml(SAMPLE_VALUE))
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'json' | 'yaml' | null>(null)

  function convertJsonToYaml() {
    try {
      const parsed = JSON.parse(jsonText) as JsonValue
      setYamlText(stringifyYaml(parsed))
      setError('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'JSON 转 YAML 失败')
    }
  }

  function convertYamlToJson() {
    try {
      const parsed = parseYaml(yamlText)
      setJsonText(JSON.stringify(parsed, null, 2))
      setError('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'YAML 转 JSON 失败')
    }
  }

  function copy(text: string, target: 'json' | 'yaml') {
    navigator.clipboard.writeText(text)
    setCopied(target)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">JSON / YAML 转换</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">常见对象、数组、布尔值和嵌套结构的双向转换，适合日常开发配置处理</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button className="btn-primary" onClick={convertJsonToYaml}>JSON → YAML</button>
        <button className="btn-primary" onClick={convertYamlToJson}>YAML → JSON</button>
        <button className="btn-secondary" onClick={() => copy(jsonText, 'json')}>{copied === 'json' ? '✅ JSON 已复制' : '复制 JSON'}</button>
        <button className="btn-secondary" onClick={() => copy(yamlText, 'yaml')}>{copied === 'yaml' ? '✅ YAML 已复制' : '复制 YAML'}</button>
        <button className="btn-secondary" onClick={() => { setJsonText(''); setYamlText(''); setError('') }}>清空</button>
      </div>

      {error && <div className="tool-card mb-4 text-red-500 text-sm">⚠️ {error}</div>}

      <div className="grid max-w-full grid-cols-1 xl:grid-cols-2 gap-4">
        <div>
          <label className="label">JSON</label>
          <textarea className="tool-textarea h-96" value={jsonText} onChange={e => setJsonText(e.target.value)} placeholder='{"name": "cf-tools"}' />
        </div>
        <div>
          <label className="label">YAML</label>
          <textarea className="tool-textarea h-96" value={yamlText} onChange={e => setYamlText(e.target.value)} placeholder={'name: cf-tools\nenabled: true'} />
        </div>
      </div>
    </div>
  )
}
