import { useState, useRef, useEffect } from 'react'
import { roadmapService } from '../../services'
import { getErrorMessage } from '../../utils'
import { FiSend } from 'react-icons/fi'

export default function CareerAdvisor() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I\'m your AI Career Advisor. Ask me anything about your career path, skill development, or job market.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const question = input.trim()
    if (!question) return

    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)

    try {
      const res = await roadmapService.getCareerAdvice(question)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.data?.advice || res.data?.answer || 'No response received.' },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Sorry, something went wrong: ${getErrorMessage(err)}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Career Advisor</h1>

      {/* Chat Area */}
      <div className="flex-1 card overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-gray-500 animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your career path..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary px-5 disabled:opacity-50"
        >
          <FiSend className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
