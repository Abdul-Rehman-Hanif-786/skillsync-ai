import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSend, FiZap, FiUser, FiMap, FiTarget,
  FiCpu, FiCopy, FiCheck, FiTrash2, FiMessageSquare,
} from 'react-icons/fi'
import { roadmapService } from '../../services'
import { getErrorMessage } from '../../utils'
import { useAuthStore } from '../../store/authStore'

const STORAGE_KEY  = 'skillsync_chat_history'
const MAX_MESSAGES = 100

const QUICK_QUESTIONS = [
  'What is the highest paying tech skill in 2025?',
  'How do I transition from frontend to backend?',
  'Should I learn React or Vue?',
  'What certifications are worth it for DevOps?',
  'How to negotiate a higher salary as a developer?',
  'What is the best way to prepare for coding interviews?',
]

/* ── Markdown renderer ── */
function renderMarkdown(text) {
  if (!text) return ''
  return text
    // ## Headers
    .replace(/^## (.+)$/gm, '<p class="text-sm font-extrabold text-gray-900 mt-3 mb-1.5 border-b border-gray-100 pb-1">$1</p>')
    // ### Sub-headers
    .replace(/^### (.+)$/gm, '<p class="text-xs font-bold text-gray-700 mt-2 mb-1">$1</p>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-primary-700 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    // Numbered list items
    .replace(/^\d+\.\s\*\*(.+?)\*\*(.*)$/gm, '<li class="flex items-start gap-2 mb-2"><span class="w-5 h-5 rounded-full bg-primary-600 text-white text-[9px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">•</span><span><strong class="font-bold text-gray-900">$1</strong>$2</span></li>')
    .replace(/^\d+\.\s(.+)$/gm, '<li class="flex items-start gap-2 mb-1.5"><span class="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[9px] font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">•</span><span>$1</span></li>')
    // Bullet list items
    .replace(/^-\s\*\*(.+?)\*\*(.*)$/gm, '<li class="flex items-start gap-2 mb-1.5"><span class="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0 mt-1.5"></span><span><strong class="font-bold text-gray-900">$1</strong>$2</span></li>')
    .replace(/^[-•]\s(.+)$/gm, '<li class="flex items-start gap-2 mb-1"><span class="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0 mt-1.5"></span><span>$1</span></li>')
    // Wrap consecutive li tags in ul
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, '<ul class="space-y-0.5 my-2 ml-1">$&</ul>')
    // Next Step highlight
    .replace(/\*\*Next Step:\*\*(.*)/g, '<div class="mt-3 p-2.5 rounded-xl bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-800 flex items-start gap-1.5"><span>→</span><span><strong>Next Step:</strong>$1</span></div>')
    // Line breaks
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g, '<br/>')
}

/* ── Typing dots ── */
function TypingDots() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }}>
        <FiZap className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 bg-white border border-gray-100"
        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

/* ── Date separator ── */
function DateSeparator({ date }) {
  const d    = new Date(date)
  const now  = new Date()
  const diff = Math.floor((now - d) / 86400000)
  const label = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

/* ── Message bubble ── */
function Message({ msg, i }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)
  const time = new Date(msg.ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const copyText = () => {
    navigator.clipboard.writeText(msg.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex items-end gap-2.5 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animationDelay: `${Math.min(i, 5) * 0.04}s` }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mb-1"
        style={isUser
          ? { background: 'linear-gradient(135deg,#0284c7,#0ea5e9)' }
          : { background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }
        }>
        {isUser ? <FiUser className="w-4 h-4 text-white" /> : <FiZap className="w-4 h-4 text-white" />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] text-gray-400 px-1">
          {isUser ? 'You' : 'SkillSync AI'} · {time}
        </span>

        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isUser ? 'rounded-2xl rounded-br-sm text-white' : 'rounded-2xl rounded-bl-sm text-gray-800'
          }`}
          style={isUser
            ? { background: 'linear-gradient(135deg,#0284c7,#0ea5e9)' }
            : { background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }
          }
        >
          {isUser
            ? <p>{msg.text}</p>
            : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
          }
        </div>

        {!isUser && (
          <button onClick={copyText}
            className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors px-2 py-0.5 rounded hover:bg-gray-100">
            {copied ? <FiCheck className="w-3 h-3 text-emerald-500" /> : <FiCopy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function CareerAdvisor() {
  const { user }     = useAuthStore()
  const storageKey   = user?.email ? `${STORAGE_KEY}_${user.email}` : STORAGE_KEY

  const getInitial = () => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return [{
      role: 'assistant',
      text: "Hi! I'm **SkillSync AI** — your career advisor 🚀\n\nAsk me anything about tech careers, skills, or salaries. I'll keep it short and actionable.",
      ts: Date.now(),
    }]
  }

  const [messages, setMessages] = useState(getInitial)
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  /* Save on change */
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_MESSAGES)))
  }, [messages, storageKey])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async text => {
    const q = (text || input).trim()
    if (!q || loading) return
    setMessages(prev => [...prev, { role: 'user', text: q, ts: Date.now() }])
    setInput('')
    setLoading(true)
    try {
      const res = await roadmapService.getCareerAdvice(q)
      const ans = res.data?.answer || res.data?.advice || 'No response.'
      setMessages(prev => [...prev, { role: 'assistant', text: ans, ts: Date.now() }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Sorry, something went wrong. ${getErrorMessage(err)}`,
        ts: Date.now(),
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const clearChat = () => {
    const welcome = {
      role: 'assistant',
      text: "Chat cleared! What would you like to know?",
      ts: Date.now(),
    }
    setMessages([welcome])
    localStorage.setItem(storageKey, JSON.stringify([welcome]))
  }

  /* Group by date */
  const grouped = (() => {
    const result = []
    let lastDate = null
    messages.forEach((msg, i) => {
      const date = new Date(msg.ts || Date.now()).toDateString()
      if (date !== lastDate) {
        result.push({ type: 'sep',     date: msg.ts, key: `s${i}` })
        lastDate = date
      }
      result.push({ type: 'msg', msg, index: i, key: `m${i}` })
    })
    return result
  })()

  const userCount     = messages.filter(m => m.role === 'user').length
  const showSuggestions = messages.length <= 1 && !loading

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }}>
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Career Advisor</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-gray-400 font-medium">
                Groq AI · {userCount} messages saved
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userCount > 0 && (
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <FiCheck className="w-3 h-3" /> Auto-saved
            </span>
          )}
          <button onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 hover:bg-red-50 transition-all">
            <FiTrash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl border border-gray-100 p-5 space-y-3 mb-4"
        style={{
          background: 'linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {grouped.map(item =>
          item.type === 'sep'
            ? <DateSeparator key={item.key} date={item.date} />
            : <Message key={item.key} msg={item.msg} i={item.index} />
        )}
        {loading && <TypingDots />}

        {showSuggestions && (
          <div className="pt-2 animate-fade-in">
            <p className="text-xs text-gray-400 font-medium mb-3 text-center">
              — Quick questions to get started —
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-left text-xs font-medium border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all bg-white">
                  <FiZap className="w-3 h-3 text-primary-400 flex-shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-3 flex-shrink-0">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about skills, salaries, career paths…"
            disabled={loading}
            className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all disabled:opacity-60"
          />
          {input && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-medium">
              Enter ↵
            </span>
          )}
        </div>
        <button type="submit" disabled={loading || !input.trim()}
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0"
          style={{ background: input.trim() && !loading ? 'linear-gradient(135deg,#0284c7,#0ea5e9)' : '#e2e8f0' }}>
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <FiSend className="w-5 h-5" style={{ color: input.trim() ? 'white' : '#94a3b8' }} />
          }
        </button>
      </form>

      {/* Bottom bar */}
      <div className="flex items-center gap-4 mt-3 flex-shrink-0 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Quick:</span>
        {[
          { label: 'Generate Roadmap', icon: FiMap,    to: '/roadmaps' },
          { label: 'Skill Analysis',   icon: FiTarget, to: '/recommendations/careers' },
          { label: 'My Skills',        icon: FiCpu,    to: '/profile/skills' },
        ].map(({ label, icon: Icon, to }) => (
          <Link key={to} to={to}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors font-medium">
            <Icon className="w-3 h-3" />{label}
          </Link>
        ))}
        <span className="ml-auto text-[10px] text-gray-300 flex items-center gap-1">
          <FiMessageSquare className="w-3 h-3" />{userCount} sent
        </span>
      </div>
    </div>
  )
}
