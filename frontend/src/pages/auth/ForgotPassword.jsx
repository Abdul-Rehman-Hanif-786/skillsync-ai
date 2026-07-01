import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiArrowLeft, FiCopy, FiCheck, FiClock } from 'react-icons/fi'
import { authService } from '../../services'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [resetUrl,  setResetUrl]  = useState('')
  const [copied,    setCopied]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authService.forgotPassword(email)
      setSent(true)
      if (res.data.dev_reset_url) {
        setResetUrl(res.data.dev_reset_url)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(resetUrl)
    setCopied(true)
    toast.success('Reset link copied!')
    setTimeout(() => setCopied(false), 3000)
  }

  /* ── Success state ── */
  if (sent) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <FiMail className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="text-gray-500 mt-2 text-sm">
            We sent a reset link to <span className="font-semibold text-gray-700">{email}</span>
          </p>
        </div>

        {/* Dev mode: show token directly */}
        {resetUrl && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Development Mode — Reset Link
              </p>
            </div>
            <p className="text-xs text-amber-600 mb-3">
              In production, this link would be emailed. For now, copy it manually:
            </p>
            <div className="flex items-center gap-2 bg-white rounded-xl p-2.5 border border-amber-200">
              <p className="text-xs text-gray-600 font-mono flex-1 truncate">{resetUrl}</p>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-semibold transition-colors flex-shrink-0"
              >
                {copied ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <FiClock className="w-3 h-3 text-amber-500" />
              <p className="text-[11px] text-amber-600">Expires in 30 minutes</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {resetUrl && (
            <a
              href={resetUrl}
              className="btn-primary w-full text-sm"
            >
              Open Reset Link
            </a>
          )}
          <button
            onClick={() => { setSent(false); setResetUrl('') }}
            className="btn-secondary w-full text-sm"
          >
            Try a different email
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-1">
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </p>
      </div>
    )
  }

  /* ── Request form ── */
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 font-medium">
          <FiArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Forgot password?</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field pl-10"
              placeholder="you@example.com"
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-sm disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember your password?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  )
}
