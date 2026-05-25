import { useMemo, useState } from 'react'

type BaseKey = 'binary' | 'octal' | 'decimal' | 'hex'

const BASE_CONFIG: Record<BaseKey, { label: string; base: number; placeholder: string }> = {
  binary: { label: '二进制 (2)', base: 2, placeholder: '101010' },
  octal: { label: '八进制 (8)', base: 8, placeholder: '755' },
  decimal: { label: '十进制 (10)', base: 10, placeholder: '255' },
  hex: { label: '十六进制 (16)', base: 16, placeholder: 'FF' },
}

const EMPTY_FIELDS: Record<BaseKey, string> = {
  binary: '',
  octal: '',
  decimal: '',
  hex: '',
}

const DIGITS = '0123456789ABCDEF'

function parseInBase(raw: string, base: number): bigint {
  let text = raw.trim()
  if (!text) throw new Error('请输入要转换的数字')

  let sign = 1n
  if (text.startsWith('-')) {
    sign = -1n
    text = text.slice(1)
  } else if (text.startsWith('+')) {
    text = text.slice(1)
  }

  if (base === 2) text = text.replace(/^0b/i, '')
  if (base === 8) text = text.replace(/^0o/i, '')
  if (base === 16) text = text.replace(/^0x/i, '')
  if (!text) throw new Error('请输入完整的数字')

  let result = 0n
  for (const char of text.toUpperCase()) {
    const digit = DIGITS.indexOf(char)
    if (digit < 0 || digit >= base) {
      throw new Error(`输入中包含无效的 ${base} 进制字符：${char}`)
    }
    result = result * BigInt(base) + BigInt(digit)
  }

  return result * sign
}

function toWord(value: bigint, bits: number): bigint {
  const modulo = 1n << BigInt(bits)
  return ((value % modulo) + modulo) % modulo
}

function interpretSigned(word: bigint, bits: number): bigint {
  const modulo = 1n << BigInt(bits)
  const signBit = 1n << BigInt(bits - 1)
  return (word & signBit) !== 0n ? word - modulo : word
}

function fitsSignedRange(value: bigint, bits: number): boolean {
  const min = -(1n << BigInt(bits - 1))
  const max = (1n << BigInt(bits - 1)) - 1n
  return value >= min && value <= max
}

function formatInBase(value: bigint, base: number, bits: number): string {
  if (base === 10) return value.toString(10)

  if (value < 0n) {
    const word = toWord(value, bits)
    const width = base === 2 ? bits : base === 16 ? Math.ceil(bits / 4) : Math.ceil(bits / 3)
    return word.toString(base).toUpperCase().padStart(width, '0')
  }

  return value.toString(base).toUpperCase()
}

function buildFields(value: bigint, bits: number): Record<BaseKey, string> {
  return {
    binary: formatInBase(value, 2, bits),
    octal: formatInBase(value, 8, bits),
    decimal: formatInBase(value, 10, bits),
    hex: formatInBase(value, 16, bits),
  }
}

export default function NumberBaseTool() {
  const [sourceKey, setSourceKey] = useState<BaseKey>('decimal')
  const [sourceText, setSourceText] = useState('255')
  const [bitWidth, setBitWidth] = useState(32)

  const result = useMemo(() => {
    if (!sourceText.trim()) {
      return { fields: EMPTY_FIELDS, parsed: null as bigint | null, error: '' }
    }

    try {
      const parsed = parseInBase(sourceText, BASE_CONFIG[sourceKey].base)
      return {
        fields: { ...buildFields(parsed, bitWidth), [sourceKey]: sourceText },
        parsed,
        error: '',
      }
    } catch (error) {
      return {
        fields: { ...EMPTY_FIELDS, [sourceKey]: sourceText },
        parsed: null,
        error: error instanceof Error ? error.message : '转换失败',
      }
    }
  }, [bitWidth, sourceKey, sourceText])

  const wordValue = result.parsed === null ? null : toWord(result.parsed, bitWidth)
  const signedValue = wordValue === null ? null : interpretSigned(wordValue, bitWidth)
  const exceedsSigned = result.parsed !== null && !fitsSignedRange(result.parsed, bitWidth)
  const exceedsUnsigned = result.parsed !== null && (result.parsed < 0n || result.parsed >= (1n << BigInt(bitWidth)))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">进制转换</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">二进制、八进制、十进制、十六进制实时互转，支持大整数和补码显示</p>

      <div className="tool-card mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">补码位宽</label>
            <select className="tool-input" value={bitWidth} onChange={e => setBitWidth(Number(e.target.value))}>
              {[8, 16, 32, 64, 128].map(bits => (
                <option key={bits} value={bits}>{bits} bit</option>
              ))}
            </select>
          </div>
          <button className="btn-secondary" onClick={() => { setSourceKey('decimal'); setSourceText('') }}>清空</button>
        </div>
      </div>

      <div className="grid max-w-full grid-cols-1 xl:grid-cols-2 gap-4">
        {(Object.keys(BASE_CONFIG) as BaseKey[]).map(key => (
          <div key={key} className="tool-card">
            <label className="label">{BASE_CONFIG[key].label}</label>
            <input
              type="text"
              className="tool-input w-full font-mono"
              value={result.fields[key]}
              onChange={e => { setSourceKey(key); setSourceText(e.target.value) }}
              placeholder={BASE_CONFIG[key].placeholder}
            />
          </div>
        ))}
      </div>

      {result.error && (
        <div className="tool-card mt-4 text-red-500 text-sm">
          ⚠️ {result.error}
        </div>
      )}

      {!result.error && result.parsed !== null && wordValue !== null && signedValue !== null && (
        <div className="grid max-w-full grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
          <div className="tool-card">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">无符号解释</p>
            <p className="font-mono text-lg text-blue-600 dark:text-blue-400 break-all">{wordValue.toString(10)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-all">0x{wordValue.toString(16).toUpperCase()}</p>
          </div>
          <div className="tool-card">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">有符号解释</p>
            <p className="font-mono text-lg text-green-600 dark:text-green-400 break-all">{signedValue.toString(10)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">按 {bitWidth} 位二补码解释</p>
          </div>
          <div className="tool-card">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">当前说明</p>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>原始值：<span className="font-mono break-all">{result.parsed.toString(10)}</span></li>
              <li>{result.parsed < 0n ? '负数会以补码形式显示到二/八/十六进制' : '正数直接转换到各进制'}</li>
              <li>{exceedsSigned || exceedsUnsigned ? `已超出 ${bitWidth} 位范围，解释值按低 ${bitWidth} 位计算` : `当前值可在 ${bitWidth} 位范围内准确表示`}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
