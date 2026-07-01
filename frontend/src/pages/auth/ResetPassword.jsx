import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiLock, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi'
import { authService } from '../../services'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [tokenValid,   setTokenValid]   = useState(null)  // null = checking
  const [tokenEmail,   setTokenEmail]   = useState('')
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [showPass,     setShowPass]     = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [done,         setDone]         = useState(false)

  /* Verify token on mount */
  useEffect(() => {
    if (!token) { setTokenValid(false); return }
    authService.verifyResetToken(token)
      .then(res => { setTokenValid(true); setTokenEmail(res.data.email) })
      .catch(() => setTokenValid(false))
  }, [token])

  /* ── Password strength ── */
  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8)               s++
    if (/[A-Z]/.test(password))             s++
    if (/[0-9]/.test(password))             s++
    if (/[^A-Za-z0-9]/.test(password))      s++
    return s
  })()
  const strengthLabel = ['','Weak','Fair','Good','Strong'][strength]
  const strengthColor = ['','bg-red-400','bg-amber-400','bg-blue-400','bg-emerald-400'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 8)  { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed. Token may have expired.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Loading ── */
  if (tokenValid === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 animate-fade-in">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Verifying your reset link…</p>
      </div>
    )
  }

  /* ── Invalid token ── */
  if (!tokenValid) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Link expired or invalid</h2>
        <p className="text-gray-500 text-sm mb-6">
          This reset link is no longer valid. Reset links expire after 30 minutes.
        </p>
        <Link to="/forgot-password" className="btn-primary text-sm">
          Request new link
        </Link>
        <p className="mt-4">
          <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 inline-flex items-center gap-1">
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to login
          </Link>
        </p>
      </div>
    )
  }

  /* ── Success ── */
  if (done) {
    return (
      <div className="text-center animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password updated!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary w-full text-sm"
        >
          Go to Login
        </button>
      </div>
    )
  }

  /* ── Reset form ── */
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
        {tokenEmail && (
          <p className="text-gray-500 mt-1 text-sm">
            For <span className="font-semibold text-gray-700">{tokenEmail}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field pl-10 pr-10"
              placeholder="Min. 8 characters"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {password && (
            <div className="mt-2 space-y-1.5 animate-fade-in">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className={`text-xs font-semibold ${['','text-red-500','text-amber-500','text-blue-500','text-emerald-500'][strength]}`}>
                {strengthLabel}
              </p>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className={`input-field pl-10 ${confirm && confirm !== password ? 'border-red-300 focus:ring-red-400' : ''}`}
              placeholder="Re-enter password"
            />
            {confirm && confirm === password && (
              <FiCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
            )}
          </div>
          {confirm && confirm !== password && (
            <p className="text-xs text-red-500 mt-1 font-medium">Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || password !== confirm || password.length < 8}
          className="btn-primary w-full text-sm disabled:opacity-60 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <p className="text-center mt-4">
        <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 inline-flex items-center gap-1 font-medium">
          <FiArrowLeft className="w-3.5 h-3.5" /> Back to login
        </Link>
      </p>
    </div>
  )
}
