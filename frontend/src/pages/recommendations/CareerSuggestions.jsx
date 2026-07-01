import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBriefcase, FiCheckCircle, FiAlertCircle, FiTarget,
  FiSearch, FiArrowRight, FiTrendingUp, FiMap, FiZap,
  FiCpu, FiAward, FiRefreshCw, FiChevronRight, FiBookOpen,
  FiStar, FiMessageSquare,
} from 'react-icons/fi'
import { recommendationService } from '../../services'
import { getErrorMessage } from '../../utils'
import { useProfile } from '../../hooks'
import toast from 'react-hot-toast'

/* ── Match ring ── */
function MatchRing({ pct = 0 }) {
  const r = 28, circ = 2 * Math.PI * r
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#0ea5e9' : pct >= 25 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-20 h-20">
      <svg className="-rotate-90 w-20 h-20" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="6"
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold text-gray-900">{Math.round(pct)}</span>
        <span className="text-[9px] text-gray-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

/* ── Career card ── */
function CareerCard({ s, i }) {
  const pct = s.match_score || s.match_percentage || 0
  const color = pct >= 75 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : pct >= 50 ? 'text-blue-600 bg-blue-50 border-blue-200'
    : pct >= 25 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-red-500 bg-red-50 border-red-200'
  return (
    <div className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-primary-200 hover:shadow-sm transition-all duration-200 animate-scale-in"
      style={{ animationDelay: `${i * 0.06}s` }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#0284c7)' }}>
        <FiBriefcase className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-sm">{s.role || s.title}</h3>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex-shrink-0 ${color}`}>
            {Math.round(pct)}% match
          </span>
        </div>
        {s.description && (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{s.description}</p>
        )}
        <div className="h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: pct >= 75 ? '#10b981' : pct >= 50 ? '#0ea5e9' : '#f59e0b' }} />
        </div>
      </div>
      <Link to="/roadmaps"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl text-primary-600 hover:bg-primary-50 flex-shrink-0"
        title="Generate Roadmap">
        <FiArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

export default function CareerSuggestions() {
  const { profile }  = useProfile()
  const [suggestions, setSuggestions] = useState([])
  const [skillGap,    setSkillGap]    = useState(null)
  const [targetRole,  setTargetRole]  = useState('')
  const [loading,     setLoading]     = useState(true)
  const [analyzing,   setAnalyzing]   = useState(false)

  useEffect(() => {
    loadSuggestions()
    if (profile?.target_role) setTargetRole(profile.target_role)
  }, [profile])

  const loadSuggestions = async () => {
    setLoading(true)
    try {
      const res = await recommendationService.getCareerSuggestions()
      setSuggestions(res.data || [])
    } catch { setSuggestions([]) }
    finally { setLoading(false) }
  }

  const handleAnalyze = async e => {
    e.preventDefault()
    if (!targetRole.trim()) return
    setAnalyzing(true); setSkillGap(null)
    try {
      const res = await recommendationService.getSkillGap(targetRole)
      setSkillGap(res.data)
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setAnalyzing(false) }
  }

  if (loading) return (
    <div className="max-w-6xl animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 skeleton w-52 rounded-xl" />
          <div className="h-48 skeleton rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 skeleton rounded-2xl" />
            <div className="h-32 skeleton rounded-2xl" />
          </div>
        </div>
        <div className="h-80 skeleton rounded-2xl" />
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══════════════════════════════════
            LEFT — main content (2/3)
        ══════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Career Suggestions</h1>
              <p className="text-gray-400 text-sm mt-0.5">AI-powered career path analysis</p>
            </div>
            <Link to="/recommendations" className="btn-secondary text-sm">
              <FiTrendingUp className="w-4 h-4" /> All Recommendations
            </Link>
          </div>

          {/* Skill Gap Analysis */}
          <div className="card animate-slide-up">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                <FiTarget className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Skill Gap Analysis</h2>
                <p className="text-xs text-gray-400">See how ready you are for any role</p>
              </div>
            </div>

            <form onSubmit={handleAnalyze} className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)}
                  placeholder="Enter target role — e.g. Data Scientist, DevOps Engineer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all" />
              </div>
              <button type="submit" disabled={analyzing || !targetRole.trim()}
                className="btn-primary text-sm disabled:opacity-60 whitespace-nowrap">
                {analyzing
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing…</>
                  : <><FiZap className="w-4 h-4" />Analyze</>}
              </button>
            </form>

            {/* Quick roles */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['Full Stack Engineer','Data Scientist','DevOps Engineer','Product Manager','UI/UX Designer'].map(r => (
                <button key={r} type="button" onClick={() => setTargetRole(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    targetRole === r
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600'
                  }`}>{r}</button>
              ))}
            </div>

            {/* Results */}
            {skillGap && (
              <div className="animate-scale-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl border border-violet-100 mb-5"
                  style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.05),rgba(14,165,233,0.04))' }}>
                  <MatchRing pct={skillGap.skill_match_percentage || skillGap.match_percentage || 0} />
                  <div className="flex-1">
                    <h3 className="font-extrabold text-gray-900 text-lg">{skillGap.target_role || targetRole}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 capitalize">{skillGap.readiness_level?.replace(/_/g,' ')} readiness</p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <FiCheckCircle className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400">You Have</p>
                          <p className="font-extrabold text-emerald-700">
                            {(skillGap.required_skills?.length || 0) - (skillGap.missing_required_skills?.length || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                        <FiAlertCircle className="text-orange-500 w-4 h-4 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400">Missing</p>
                          <p className="font-extrabold text-orange-600">{skillGap.missing_required_skills?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {skillGap.required_skills?.filter(s => !skillGap.missing_required_skills?.includes(s)).length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        Skills You Have ({skillGap.required_skills.filter(s => !skillGap.missing_required_skills?.includes(s)).length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillGap.required_skills.filter(s => !skillGap.missing_required_skills?.includes(s)).map((s,i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <FiCheckCircle className="w-3 h-3" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skillGap.missing_required_skills?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-orange-700 flex items-center gap-1.5 mb-2">
                        <FiAlertCircle className="w-3.5 h-3.5" />
                        Skills to Learn ({skillGap.missing_required_skills.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillGap.missing_required_skills.map((s,i) => (
                          <span key={i} className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-5">
                  <Link to="/roadmaps" className="btn-primary text-sm"><FiMap className="w-4 h-4" />Generate Roadmap</Link>
                  <Link to="/profile/skills" className="btn-secondary text-sm"><FiCpu className="w-4 h-4" />Add Skills</Link>
                </div>
              </div>
            )}
          </div>

          {/* Career Suggestions */}
          {suggestions.length > 0 ? (
            <div className="animate-slide-up stagger-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Suggested Career Paths</h2>
                <span className="text-xs text-gray-400">{suggestions.length} paths</span>
              </div>
              <div className="space-y-3">
                {suggestions.map((s, i) => <CareerCard key={i} s={s} i={i} />)}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4 animate-float">
                <FiBriefcase className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="font-extrabold text-gray-900 mb-2">No suggestions yet</h3>
              <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">
                Add more skills to get personalized career path suggestions.
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/profile/skills" className="btn-secondary text-sm">Add Skills</Link>
                <Link to="/resume/upload" className="btn-primary text-sm">Upload Resume</Link>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════
            RIGHT — Info panel (1/3) sticky
        ══════════════════════════════════ */}
        <div className="animate-slide-up stagger-2">
          <div className="card sticky top-24 space-y-5">

            {/* Available roles */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-3">Available Career Roles</h3>
              <div className="space-y-1.5">
                {[
                  { role:'Full Stack Developer',  color:'bg-blue-100 text-blue-700' },
                  { role:'Data Scientist',         color:'bg-purple-100 text-purple-700' },
                  { role:'DevOps Engineer',        color:'bg-emerald-100 text-emerald-700' },
                  { role:'AI Engineer',            color:'bg-pink-100 text-pink-700' },
                  { role:'Backend Developer',      color:'bg-amber-100 text-amber-700' },
                  { role:'Frontend Developer',     color:'bg-cyan-100 text-cyan-700' },
                  { role:'Mobile Developer',       color:'bg-violet-100 text-violet-700' },
                  { role:'Cloud Engineer',         color:'bg-rose-100 text-rose-700' },
                ].map(({ role, color }) => (
                  <button key={role} onClick={() => setTargetRole(role)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group text-left">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{role}</span>
                    <FiArrowRight className="w-3 h-3 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">How It Works</h3>
              <div className="space-y-3">
                {[
                  { n:'1', t:'Enter a Role',        d:'Pick any target role',                    c:'bg-violet-600' },
                  { n:'2', t:'AI Compares Skills',  d:'Checks your profile vs role requirements',c:'bg-blue-600'   },
                  { n:'3', t:'See Your Gaps',       d:'Missing skills highlighted clearly',      c:'bg-emerald-600'},
                  { n:'4', t:'Take Action',         d:'Generate roadmap or add skills',          c:'bg-amber-600'  },
                ].map(({ n, t, d, c }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg ${c} flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 mt-0.5`}>{n}</div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{t}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label:'Generate Roadmap',   icon:FiMap,           to:'/roadmaps',              color:'text-primary-600 bg-primary-50 hover:bg-primary-100' },
                  { label:'Career Advisor',     icon:FiMessageSquare, to:'/roadmaps/advisor',       color:'text-violet-600 bg-violet-50 hover:bg-violet-100'   },
                  { label:'Manage Skills',      icon:FiCpu,           to:'/profile/skills',         color:'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'},
                  { label:'All Recommendations',icon:FiTrendingUp,    to:'/recommendations',        color:'text-amber-600 bg-amber-50 hover:bg-amber-100'      },
                ].map(({ label, icon: Icon, to, color }) => (
                  <Link key={to} to={to}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${color}`}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />{label}
                    <FiChevronRight className="w-3 h-3 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="p-3.5 rounded-2xl border border-violet-100"
                style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.07),rgba(14,165,233,0.04))' }}>
                <p className="text-xs font-bold text-violet-700 mb-1 flex items-center gap-1.5">
                  <FiZap className="w-3 h-3" /> Pro Tip
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Click any role from the list above to instantly load it into the analyzer — no typing needed!
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
