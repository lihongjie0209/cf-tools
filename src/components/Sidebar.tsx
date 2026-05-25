import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const categories = [
  {
    name: '编码解码',
    tools: [
      { path: '/base64', label: 'Base64', icon: '🔤' },
      { path: '/url', label: 'URL 编解码', icon: '🔗' },
      { path: '/jwt', label: 'JWT 解析', icon: '🪙' },
    ],
  },
  {
    name: '格式化',
    tools: [
      { path: '/json', label: 'JSON 工具', icon: '{}' },
      { path: '/css', label: 'CSS 工具', icon: '🎨' },
      { path: '/markdown', label: 'Markdown 预览', icon: '📝' },
    ],
  },
  {
    name: '生成器',
    tools: [
      { path: '/uuid', label: 'UUID 生成', icon: '🆔' },
      { path: '/hash', label: 'Hash 计算', icon: '#' },
    ],
  },
  {
    name: '转换工具',
    tools: [
      { path: '/timestamp', label: '时间戳', icon: '⏱️' },
      { path: '/color', label: '颜色转换', icon: '🖌️' },
    ],
  },
  {
    name: '开发辅助',
    tools: [
      { path: '/regex', label: 'Regex 测试', icon: '🔍' },
      { path: '/http', label: 'HTTP 构建器', icon: '🌐' },
      { path: '/diff', label: 'Diff 对比', icon: '⚖️' },
      { path: '/cron', label: 'CRON 解析', icon: '⏰' },
    ],
  },
]

interface Props { onClose?: () => void }

export default function Sidebar({ onClose }: Props) {
  const { theme, toggle } = useTheme()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">CF Tools</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400" title="切换主题">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 lg:hidden">✕</button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {categories.map(cat => (
          <div key={cat.name}>
            <p className="px-2 mb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{cat.name}</p>
            <div className="space-y-0.5">
              {cat.tools.map(tool => (
                <NavLink
                  key={tool.path}
                  to={tool.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <span className="w-5 text-center text-base leading-none">{tool.icon}</span>
                  <span>{tool.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Powered by Cloudflare Pages</p>
      </div>
    </div>
  )
}
