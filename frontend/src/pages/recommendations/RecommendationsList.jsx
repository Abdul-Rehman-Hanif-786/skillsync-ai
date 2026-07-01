import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiTrendingUp, FiTrash2, FiRefreshCw, FiZap,
  FiStar, FiBookOpen, FiTarget, FiArrowRight,
  FiCheckCircle, FiCpu, FiAward, FiFilter,
} from 'react-icons/fi'
import { recommendationService } from '../../services'
import { formatDate, getErrorMessage, capitalize } from '../../utils'
import toast from 'react-hot-toast'

/* ── Type config ── */
const TYPE_CONFIG = {
  skill: {
    gradient: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
    badge:    'bg-blue-100 text-blue-700 border-blue-200',
    icon:     <FiCpu className="w-4 h-4 text-white" />,
  },
  career_path: {
    gradient: 'linear-gradient(135deg,#7c3aed,#8b5cf6)',
    badge:    'bg-violet-100 text-violet-700 border-violet-200',
    icon:     <FiTarget className="w-4 h-4 text-white" />,
  },
  course: {
    gradient: 'linear-gradient(135deg,#059669,#10b981)',
    badge:    'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon:     <FiBookOpen className="w-4 h-4 text-white" />,
  },
  certification: {
    gradient: 'linear-gradient(135deg,#d97706,#f59e0b)',
    badge:    'bg-amber-100 text-amber-700 border-amber-200',
    icon:     <FiAward className="w-4 h-4 text-white" />,
  },
}

const getConfig = type => TYPE_CONFIG[type] || TYPE_CONFIG.skill

/* ── Priority badge ── */
function PriorityBadge({ priority }) {
  const map = {
    high:   'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low:    'bg-gray-100 text-gray-600 border-gray-200',
  }
  return priority ? (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${map[priority] || map.low}`}>
      {priority}
    </span>
  ) : null
}

/* ── Rec Card ── */
function RecCard({ rec, onDelete, deleting }) {
  const cfg   = getConfig(rec.recommendation_type)
  const title = rec.title || rec.content?.title || 'Recommendation'
  const desc  = rec.description || rec.content?.description || rec.reason || ''

  return (
    <div className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-primary-200 hover:shadow-sm transition-all duration-200 animate-scale-in">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-200"
        style={{ background: cfg.gradient }}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${cfg.badge}`}>
            {rec.recommendation_type?.replace('_', ' ') || 'skill'}
          </span>
          <PriorityBadge priority={rec.priority} />
          <span className="text-[10px] text-gray-400 ml-auto">{formatDate(rec.created_at)}</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm truncate">{title}</h3>
        {desc && <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{desc}</p>}

        {/* Recommended skills */}
        {rec.recommended_skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {rec.recommended_skills.slice(0,4).map((s,i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {s.name || s}
              </span>
            ))}
            {rec.recommended_skills.length > 4 && (
              <span className="text-[10px] text-gray-400">+{rec.recommended_skills.length-4}</span>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(rec.id)}
        disabled={deleting === rec.id}
        className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        {deleting === rec.id
          ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
          : <FiTrash2 className="w-4 h-4" />
        }
      </button>
    </div>
  )
}

export default function RecommendationsList() {
  const [recs,       setRecs]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState(false)
  const [deleting,   setDeleting]   = useState(null)
  const [filter,     setFilter]     = useState('all')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await recommendationService.getAll()
      setRecs(res.data || [])
    } catch { setRecs([]) }
    finally { setLoading(false) }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await recommendationService.generate({ generate_type: 'all' })
      toast.success('Recommendations generated!')
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async id => {
    setDeleting(id)
    try {
      await recommendationService.delete(id)
      setRecs(prev => prev.filter(r => r.id !== id))
      toast.success('Removed')
    } catch { toast.error('Failed') }
    finally { setDeleting(null) }
  }

  const types  = ['all', ...new Set(recs.map(r => r.recommendation_type).filter(Boolean))]
  const filtered = filter === 'all' ? recs : recs.filter(r => r.recommendation_type === filter)

  const counts = types.reduce((acc, t) => {
    acc[t] = t === 'all' ? recs.length : recs.filter(r => r.recommendation_type === t).length
    return acc
  }, {})

  /* ── Skeleton ── */
  if (loading) return (
    <div className="max-w-5xl space-y-4 animate-pulse">
      <div className="h-8 skeleton w-56 rounded-xl" />
      <div className="grid grid-cols-3 gap-4"><div className="h-20 skeleton rounded-2xl" /><div className="h-20 skeleton rounded-2xl" /><div className="h-20 skeleton rounded-2xl" /></div>
      {[...Array(3)].map((_,i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
    </div>
  )

  return (
    <div className="max-w-5xl animate-fade-in space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Recommendations</h1>
          <p className="text-gray-400 text-sm mt-0.5">AI-powered suggestions to advance your career</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/recommendations/careers" className="btn-secondary text-sm">
            <FiTarget className="w-4 h-4" /> Career Paths
          </Link>
          <button onClick={handleGenerate} disabled={generating}
            className="btn-primary text-sm disabled:opacity-60">
            <FiRefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Total',         value: recs.length,                                          gradient:'linear-gradient(135deg,#0284c7,#0ea5e9)', icon:<FiTrendingUp className="w-4 h-4 text-white"/> },
          { label:'Skill',         value: recs.filter(r=>r.recommendation_type==='skill').length,gradient:'linear-gradient(135deg,#059669,#10b981)', icon:<FiCpu className="w-4 h-4 text-white"/>},
          { label:'Career',        value: recs.filter(r=>r.recommendation_type==='career_path').length,gradient:'linear-gradient(135deg,#7c3aed,#8b5cf6)', icon:<FiTarget className="w-4 h-4 text-white"/>},
          { label:'High Priority', value: recs.filter(r=>r.priority==='high').length,           gradient:'linear-gradient(135deg,#dc2626,#ef4444)', icon:<FiStar className="w-4 h-4 text-white"/>},
        ].map(({ label, value, gradient, icon }) => (
          <div key={label} className="rounded-2xl p-4 text-white animate-slide-up"
            style={{ background: gradient }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">{icon}</div>
              <span className="text-white/60 text-[10px] font-semibold uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      {recs.length === 0 ? (
        <div className="card text-center py-16 animate-scale-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center mx-auto mb-5 animate-float">
            <FiZap className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-500 text-sm mb-2 max-w-sm mx-auto">
            Complete your profile and add skills, then let our AI generate personalized recommendations.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link to="/profile/skills" className="btn-secondary text-sm">Add Skills First</Link>
            <button onClick={handleGenerate} disabled={generating} className="btn-primary text-sm disabled:opacity-60">
              <FiZap className="w-4 h-4" />
              {generating ? 'Generating…' : 'Generate Now'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Filter sidebar */}
          <div className="card h-fit animate-slide-in-left">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <FiFilter className="w-3.5 h-3.5 text-gray-400" /> Filter
            </h3>
            <div className="space-y-1">
              {types.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === t
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="capitalize">{t === 'all' ? 'All' : t.replace('_',' ')}</span>
                  <span className={`text-xs rounded-full px-1.5 font-bold ${filter === t ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {counts[t]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-3 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">No {filter.replace('_',' ')} recommendations</p>
              </div>
            ) : (
              filtered.map((rec, i) => (
                <div key={rec.id} style={{ animationDelay:`${i*0.04}s` }}>
                  <RecCard rec={rec} onDelete={handleDelete} deleting={deleting} />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
