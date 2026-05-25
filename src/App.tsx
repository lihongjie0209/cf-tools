import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import JsonTool from './tools/JsonTool'
import Base64Tool from './tools/Base64Tool'
import UrlTool from './tools/UrlTool'
import TimestampTool from './tools/TimestampTool'
import UuidTool from './tools/UuidTool'
import HashTool from './tools/HashTool'
import RegexTool from './tools/RegexTool'
import MarkdownTool from './tools/MarkdownTool'
import HttpTool from './tools/HttpTool'
import JwtTool from './tools/JwtTool'
import CssTool from './tools/CssTool'
import CronTool from './tools/CronTool'
import DiffTool from './tools/DiffTool'
import ColorTool from './tools/ColorTool'
import HtmlTool from './tools/HtmlTool'
import JsonYamlTool from './tools/JsonYamlTool'
import PasswordTool from './tools/PasswordTool'
import NumberBaseTool from './tools/NumberBaseTool'
import StringTool from './tools/StringTool'
import TextStatsTool from './tools/TextStatsTool'

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/json" replace />} />
            <Route path="/json" element={<JsonTool />} />
            <Route path="/base64" element={<Base64Tool />} />
            <Route path="/url" element={<UrlTool />} />
            <Route path="/html" element={<HtmlTool />} />
            <Route path="/timestamp" element={<TimestampTool />} />
            <Route path="/uuid" element={<UuidTool />} />
            <Route path="/hash" element={<HashTool />} />
            <Route path="/password" element={<PasswordTool />} />
            <Route path="/radix" element={<NumberBaseTool />} />
            <Route path="/regex" element={<RegexTool />} />
            <Route path="/markdown" element={<MarkdownTool />} />
            <Route path="/http" element={<HttpTool />} />
            <Route path="/jwt" element={<JwtTool />} />
            <Route path="/yaml" element={<JsonYamlTool />} />
            <Route path="/css" element={<CssTool />} />
            <Route path="/cron" element={<CronTool />} />
            <Route path="/diff" element={<DiffTool />} />
            <Route path="/string" element={<StringTool />} />
            <Route path="/stats" element={<TextStatsTool />} />
            <Route path="/color" element={<ColorTool />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  )
}
