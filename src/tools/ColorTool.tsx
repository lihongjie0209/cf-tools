import { useState, useCallback } from 'react'

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) }
}

export default function ColorTool() {
  const [hex, setHex] = useState('#3b82f6')
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 })
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 })
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const fromHex = useCallback((h: string) => {
    const v = h.startsWith('#') ? h : '#' + h
    setHex(v)
    const r = hexToRgb(v)
    if (r) { setRgb(r); setHsl(rgbToHsl(r.r, r.g, r.b)) }
  }, [])

  const fromRgb = useCallback((r: number, g: number, b: number) => {
    setRgb({ r, g, b })
    const h = rgbToHex(r, g, b)
    setHex(h)
    setHsl(rgbToHsl(r, g, b))
  }, [])

  const fromHsl = useCallback((h: number, s: number, l: number) => {
    setHsl({ h, s, l })
    const r = hslToRgb(h, s, l)
    setRgb(r)
    setHex(rgbToHex(r.r, r.g, r.b))
  }, [])

  const hexStr = hex.startsWith('#') ? hex : '#' + hex
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">颜色转换器</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">HEX ↔ RGB ↔ HSL 实时转换，支持色板选择</p>

      {/* Color preview */}
      <div className="tool-card mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-inner" style={{ backgroundColor: hexStr }} />
            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={hexStr}
              onChange={e => fromHex(e.target.value)} title="选择颜色" />
          </div>
          <div>
            <p className="font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">{hexStr.toUpperCase()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">点击色块选取颜色</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* HEX */}
        <div className="tool-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">HEX</span>
            <button className="btn-secondary text-xs" onClick={() => copy(hexStr.toUpperCase(), 'hex')}>
              {copied === 'hex' ? '✅' : '复制'}
            </button>
          </div>
          <input type="text" className="tool-input w-full font-mono" value={hexStr}
            onChange={e => fromHex(e.target.value)} placeholder="#000000" />
        </div>

        {/* RGB */}
        <div className="tool-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">RGB</span>
            <button className="btn-secondary text-xs" onClick={() => copy(rgbStr, 'rgb')}>
              {copied === 'rgb' ? '✅' : '复制'}
            </button>
          </div>
          <div className="flex gap-2">
            {(['r', 'g', 'b'] as const).map(ch => (
              <div key={ch} className="flex-1">
                <label className="label">{ch.toUpperCase()}</label>
                <input type="number" min={0} max={255} className="tool-input w-full font-mono" value={rgb[ch]}
                  onChange={e => {
                    const v = Math.min(255, Math.max(0, Number(e.target.value)))
                    fromRgb(ch === 'r' ? v : rgb.r, ch === 'g' ? v : rgb.g, ch === 'b' ? v : rgb.b)
                  }} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-400">{rgbStr}</p>
        </div>

        {/* HSL */}
        <div className="tool-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">HSL</span>
            <button className="btn-secondary text-xs" onClick={() => copy(hslStr, 'hsl')}>
              {copied === 'hsl' ? '✅' : '复制'}
            </button>
          </div>
          <div className="flex gap-2">
            {[
              { k: 'h' as const, label: 'H', max: 360, unit: '°' },
              { k: 's' as const, label: 'S', max: 100, unit: '%' },
              { k: 'l' as const, label: 'L', max: 100, unit: '%' },
            ].map(({ k, label, max, unit }) => (
              <div key={k} className="flex-1">
                <label className="label">{label} ({unit})</label>
                <input type="number" min={0} max={max} className="tool-input w-full font-mono" value={hsl[k]}
                  onChange={e => {
                    const v = Math.min(max, Math.max(0, Number(e.target.value)))
                    fromHsl(k === 'h' ? v : hsl.h, k === 's' ? v : hsl.s, k === 'l' ? v : hsl.l)
                  }} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs font-mono text-gray-500 dark:text-gray-400">{hslStr}</p>
        </div>
      </div>
    </div>
  )
}
