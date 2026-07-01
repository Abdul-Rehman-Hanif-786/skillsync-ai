import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiMap, FiPlus, FiTrash2, FiChevronRight, FiZap,
  FiClock, FiTarget, FiRefreshCw, FiMessageSquare,
  FiBookOpen, FiStar,
} from 'react-icons/fi'
import { roadmapService } from '../../services'
import { formatDate, getErrorMessage } from '../../utils'
import { useProfile } from '../../hooks'
import toast from 'react-hot-toast'

const POPULAR_ROLES = [
  'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
  'AI Engineer', 'Backend Developer', 'Frontend Developer',
]
const GRAD = [
  'linear-gradient(135deg,#0284c7,#0ea5e9)',
  'linear-gradient(135deg,#7c3aed,#8b5cf6)',
  'linear-gradient(135deg,#059669,#10b981)',
  'linear-gradient(135deg,#d97706,#f59e0b)',
  'linear-gradient(135deg,#dc2626,#ef4444)',
]

export default function MyRoadmaps() {
  const navigate    = useNavigate()
  const { profile } = useProfile()
  const [roadmaps,   setRoadmaps]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState(false)
  const [targetRole, setTargetRole] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    load()
    if (profile?.target_role) setTargetRole(profile.target_role)
  }, [profile])

  const load = async () => {
    setLoading(true)
    try {
      const res = await roadmapService.getAll()
      setRoadmaps(res.data || [])
    } catch { setRoadmaps([]) }
    finally { setLoading(false) }
  }

  const handleGenerate = async e => {
    e.preventDefault()
    if (!targetRole.trim()) { toast.error('Enter a target role'); return }
    setGenerating(true)
    try {
      const res = await roadmapService.generate({ target_role: targetRole })
      toast.success('Roadmap generated!')
      navigate(`/roadmaps/${res.data.id}`)
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setGenerating(false) }
  }

  const handleDelete = async (id, name, e) => {
    e.preventDefault(); e.stopPropagation()
    if (!window.confirm(`Delete "${name}"?`)) return
    setDeletingId(id)
    try {
      await roadmapService.delete(id)
      setRoadmaps(prev => prev.filter(r => r.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
    finally { setDeletingId(null) }
  }

  if (loading) return (
    <div className="max-w-6xl animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 skeleton w-44 rounded-xl" />
          <div className="h-40 skeleton rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 skeleton rounded-2xl" />
            <div className="h-32 skeleton rounded-2xl" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-40 skeleton rounded-2xl" />
          <div className="h-56 skeleton rounded-2xl" />
        </div>
      </div>
    </div>
  )

  const totalPhases = roadmaps.reduce((a, r) => a + (r.steps?.length || 0), 0)
  const avgDuration = roadmaps.length
    ? Math.round(roadmaps.reduce((a, r) => a + (r.duration_months || 6), 0) / roadmaps.length)
    : 0

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══════════════════════════════════
            LEFT — Generate + Roadmaps (2/3)
        ══════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Page header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">My Roadmaps</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                AI-generated learning paths for your career goals
              </p>
            </div>
            <Link to="/roadmaps/advisor"
              className="btn-secondary text-sm flex items-center gap-2">
              <FiMessageSquare className="w-4 h-4" /> Career Advisor
            </Link>
          </div>

          {/* Generate card */}
          <div className="card animate-slide-up">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                <FiZap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Generate New Roadmap</h2>
                <p className="text-xs text-gray-400">
                  AI creates a personalized step-by-step learning plan
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FiTarget className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text" value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="Target role — e.g. Full Stack Developer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
                <button type="submit" disabled={generating}
                  className="btn-primary text-sm disabled:opacity-60 whitespace-nowrap flex items-center gap-2">
                  {generating
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
                    : <><FiPlus className="w-4 h-4" />Generate</>}
                </button>
              </div>

              {/* Quick role chips */}
              <div className="flex flex-wrap gap-2">
                {POPULAR_ROLES.map(r => (
                  <button key={r} type="button" onClick={() => setTargetRole(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      targetRole === r
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                    }`}>{r}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Roadmaps list */}
          {roadmaps.length === 0 ? (
            <div className="card text-center py-14 animate-scale-in">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-float"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                <FiMap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">No roadmaps yet</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Generate your first AI learning roadmap by entering a target role above.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/roadmaps/advisor" className="btn-secondary text-sm">
                  Ask Career Advisor
                </Link>
                <button
                  onClick={() => setTargetRole('Full Stack Developer')}
                  className="btn-primary text-sm">
                  Try Full Stack Developer
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up stagger-2">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Your Roadmaps</h2>
                <span className="text-xs text-gray-400">{roadmaps.length} generated</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roadmaps.map((rm, i) => {
                  const grad  = GRAD[i % GRAD.length]
                  const steps = rm.steps?.length || 0
                  const name  = rm.title || rm.target_role || 'Roadmap'
                  return (
                    <div key={rm.id} className="group relative animate-scale-in"
                      style={{ animationDelay: `${i * 0.06}s` }}>
                      <Link
                        to={`/roadmaps/${rm.id}`}
                        className="block rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
                      >
                        <div className="h-1.5 w-full" style={{ background: grad }} />
                        <div className="bg-white p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
                              style={{ background: grad }}>
                              <FiMap className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 truncate text-sm">{name}</h3>
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <FiClock className="w-3 h-3" />{formatDate(rm.created_at)}
                              </p>
                            </div>
                            <FiChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
                          </div>
                          <div className="flex items-center gap-3">
                            {steps > 0 && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100">
                                <FiBookOpen className="w-3 h-3" />{steps} phases
                              </span>
                            )}
                            {rm.duration_months && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                <FiClock className="w-3 h-3" />{rm.duration_months} months
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Delete on hover */}
                      <button
                        onClick={e => handleDelete(rm.id, name, e)}
                        disabled={deletingId === rm.id}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white shadow-sm text-gray-300 hover:text-red-500 hover:bg-red-50 border border-gray-100"
                      >
                        {deletingId === rm.id
                          ? <div className="w-3.5 h-3.5 border border-red-300 border-t-red-500 rounded-full animate-spin" />
                          : <FiTrash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════
            RIGHT — Info panel (1/3) sticky
        ══════════════════════════════════ */}
        <div className="space-y-4 animate-slide-up stagger-2">

          {/* Stats */}
          <div className="card sticky top-24">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Overview</h3>
            <div className="space-y-2.5 mb-5">
              {[
                { label: 'Roadmaps Generated', value: roadmaps.length,                   color: 'text-primary-600', bg: 'bg-primary-50' },
                { label: 'Total Phases',        value: totalPhases,                        color: 'text-violet-600',  bg: 'bg-violet-50'  },
                { label: 'Avg. Duration',       value: avgDuration ? `${avgDuration} mo` : '—', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`flex items-center justify-between p-3 rounded-xl ${bg}`}>
                  <span className="text-xs font-medium text-gray-600">{label}</span>
                  <span className={`text-sm font-extrabold ${color}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* How it works */}
            <h3 className="font-bold text-gray-900 text-sm mb-3 pt-3 border-t border-gray-100">
              How It Works
            </h3>
            <div className="space-y-3 mb-5">
              {[
                { n:'1', t:'Enter Target Role',       d:'Type the job title you want',             c:'bg-primary-600' },
                { n:'2', t:'AI Analyzes Your Skills', d:'Compares with role requirements',         c:'bg-violet-600'  },
                { n:'3', t:'Get Learning Path',       d:'Step-by-step structured plan',            c:'bg-emerald-600' },
                { n:'4', t:'Follow & Grow',           d:'Execute phases, track progress',          c:'bg-amber-600'   },
              ].map(({ n, t, d, c }) => (
                <div key={n} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg ${c} flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 mt-0.5`}>
                    {n}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{t}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <h3 className="font-bold text-gray-900 text-sm mb-3 pt-3 border-t border-gray-100">
              Quick Actions
            </h3>
            <div className="space-y-2 mb-5">
              {[
                { label: 'Career Advisor Chat',  icon: FiMessageSquare, to: '/roadmaps/advisor',        color: 'text-primary-600 bg-primary-50 hover:bg-primary-100' },
                { label: 'Skill Gap Analysis',   icon: FiTarget,        to: '/recommendations/careers', color: 'text-violet-600 bg-violet-50 hover:bg-violet-100'   },
                { label: 'Get Recommendations',  icon: FiRefreshCw,     to: '/recommendations',         color: 'text-amber-600 bg-amber-50 hover:bg-amber-100'      },
                { label: 'My Profile',           icon: FiStar,          to: '/profile',                 color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'},
              ].map(({ label, icon: Icon, to, color }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${color}`}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {label}
                  <FiChevronRight className="w-3 h-3 ml-auto" />
                </Link>
              ))}
            </div>

            {/* Tip */}
            <div className="p-3.5 rounded-2xl border border-primary-100"
              style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.07),rgba(139,92,246,0.04))' }}>
              <p className="text-xs font-bold text-primary-700 mb-1 flex items-center gap-1.5">
                <FiZap className="w-3 h-3" /> Pro Tip
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Add skills to your profile first — AI generates more accurate roadmaps based on your current level.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
