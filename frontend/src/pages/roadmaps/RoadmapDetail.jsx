import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FiArrowLeft, FiCheckCircle, FiCircle, FiClock,
  FiBookOpen, FiTarget, FiTrash2, FiExternalLink,
  FiZap, FiMap, FiArrowRight, FiStar,
} from 'react-icons/fi'
import { roadmapService } from '../../services'
import { formatDate } from '../../utils'
import toast from 'react-hot-toast'

const PHASE_COLORS = [
  { bg:'bg-blue-100',   text:'text-blue-700',   ring:'ring-blue-200',   grad:'linear-gradient(135deg,#0284c7,#0ea5e9)' },
  { bg:'bg-violet-100', text:'text-violet-700',  ring:'ring-violet-200', grad:'linear-gradient(135deg,#7c3aed,#8b5cf6)' },
  { bg:'bg-emerald-100',text:'text-emerald-700', ring:'ring-emerald-200',grad:'linear-gradient(135deg,#059669,#10b981)' },
  { bg:'bg-amber-100',  text:'text-amber-700',   ring:'ring-amber-200',  grad:'linear-gradient(135deg,#d97706,#f59e0b)' },
  { bg:'bg-rose-100',   text:'text-rose-700',    ring:'ring-rose-200',   grad:'linear-gradient(135deg,#dc2626,#ef4444)' },
]

export default function RoadmapDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [roadmap,  setRoadmap]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState({})

  useEffect(() => { load() }, [id])

  const load = async () => {
    try {
      const res = await roadmapService.getById(id)
      setRoadmap(res.data)
      // Expand first phase by default
      if (res.data?.steps?.length) setExpanded({ 0: true })
    } catch {
      toast.error('Roadmap not found')
      navigate('/roadmaps')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this roadmap?')) return
    setDeleting(true)
    try {
      await roadmapService.delete(id)
      toast.success('Deleted')
      navigate('/roadmaps')
    } catch {
      toast.error('Failed')
      setDeleting(false)
    }
  }

  const togglePhase = i => setExpanded(e => ({ ...e, [i]: !e[i] }))

  if (loading) return (
    <div className="max-w-4xl space-y-5 animate-pulse">
      <div className="h-8 skeleton w-48 rounded-xl" />
      <div className="h-28 skeleton rounded-2xl" />
      <div className="space-y-3">
        {[...Array(4)].map((_,i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
    </div>
  )

  const steps = roadmap?.steps || []
  const tips  = roadmap?.extra_data?.tips || []
  const name  = roadmap?.title || roadmap?.target_role || 'Roadmap'
  const totalPhases = steps.length
  const totalTopics = steps.reduce((acc, s) => acc + (s.topics?.length || 0), 0)

  return (
    <div className="max-w-4xl animate-fade-in space-y-6">

      {/* Back + actions */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/roadmaps')}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all">
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900 truncate">{name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{formatDate(roadmap?.created_at)}</p>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all disabled:opacity-50">
          {deleting
            ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
            : <FiTrash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>

      {/* Hero card */}
      <div className="rounded-3xl overflow-hidden border border-gray-100"
        style={{ boxShadow:'0 4px 32px rgba(0,0,0,0.07)' }}>
        <div className="h-20 relative" style={{ background:'linear-gradient(135deg,#0a1628,#0d1f3c)' }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} className="absolute rounded-full opacity-15" style={{
              width:`${8+(i%3)*5}px`, height:`${8+(i%3)*5}px`,
              background:i%2===0?'#38bdf8':'#818cf8',
              left:`${(i*20+5)%88}%`, top:`${(i*25+8)%65}%`,
              animation:`float ${4+(i%3)}s ease-in-out ${i*0.25}s infinite`,
            }} />
          ))}
        </div>
        <div className="bg-white px-6 pb-6 flex items-end gap-4 -mt-8">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white border-4 border-white"
              style={{ background:'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow:'0 4px 16px rgba(14,165,233,0.3)' }}>
              <FiMap className="w-8 h-8" />
            </div>
          </div>
          <div className="flex-1 pt-9">
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary-700 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100">
                <FiBookOpen className="w-3.5 h-3.5" />{totalPhases} Phases
              </span>
              {totalTopics > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-100">
                  <FiStar className="w-3.5 h-3.5" />{totalTopics} Topics
                </span>
              )}
              {roadmap?.duration_months && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <FiClock className="w-3.5 h-3.5" />{roadmap.duration_months} months
                </span>
              )}
            </div>
            {roadmap?.description && (
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">{roadmap.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Phases */}
      {steps.length > 0 ? (
        <div className="space-y-3 animate-slide-up">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <FiTarget className="w-4 h-4 text-primary-600" /> Learning Path
          </h2>
          {steps.map((phase, i) => {
            const clr   = PHASE_COLORS[i % PHASE_COLORS.length]
            const open  = expanded[i]
            const topics = phase.topics || []
            return (
              <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-200 animate-scale-in"
                style={{ animationDelay:`${i*0.05}s`, boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>

                {/* Phase header */}
                <button
                  onClick={() => togglePhase(i)}
                  className="w-full flex items-center gap-4 p-4 bg-white text-left"
                >
                  {/* Step number */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
                    style={{ background: clr.grad }}>
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm truncate">
                      {phase.title || phase.phase || `Phase ${i+1}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {phase.duration && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <FiClock className="w-2.5 h-2.5" />{phase.duration}
                        </span>
                      )}
                      {topics.length > 0 && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${clr.bg} ${clr.text}`}>
                          {topics.length} topics
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
                    style={{ background: open ? clr.grad : '#f1f5f9' }}>
                    <FiArrowRight className={`w-3 h-3 ${open ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                </button>

                {/* Topics (expanded) */}
                {open && topics.length > 0 && (
                  <div className="border-t border-gray-100 bg-slate-50 p-4 space-y-3 animate-fade-in">
                    {topics.map((topic, j) => (
                      <div key={j} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${clr.bg}`}>
                          <FiCheckCircle className={`w-3.5 h-3.5 ${clr.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">
                            {typeof topic === 'string'
                              ? topic
                              : topic.topic || topic.name || topic.title || 'Topic'}
                          </p>
                          {(topic.description) && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{topic.description}</p>
                          )}
                          {topic.estimated_hours && (
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                              <FiClock className="w-3 h-3" /> ~{topic.estimated_hours}h
                            </p>
                          )}
                          {/* Projects */}
                          {topic.projects?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Projects</p>
                              <div className="flex flex-wrap gap-1">
                                {topic.projects.map((p, k) => (
                                  <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-medium border border-violet-100">
                                    {typeof p === 'string' ? p : p.name || p.title || p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Resources */}
                          {topic.resources?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {topic.resources.map((r, k) => (
                                <a key={k}
                                  href={typeof r === 'string' ? '#' : (r.url || '#')}
                                  target="_blank" rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-700 font-semibold underline">
                                  <FiExternalLink className="w-2.5 h-2.5" />
                                  {typeof r === 'string' ? r : (r.name || r.title || r)}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No topics fallback */}
                {open && topics.length === 0 && phase.description && (
                  <div className="border-t border-gray-100 bg-slate-50 p-4 animate-fade-in">
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card text-center py-10">
          <FiMap className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No phases available for this roadmap.</p>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="card animate-slide-up stagger-2">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <FiZap className="w-4 h-4 text-amber-500" /> Tips for Success
          </h3>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <FiStar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up stagger-3">
        <Link to="/recommendations/careers"
          className="flex items-center gap-3 p-4 rounded-2xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background:'linear-gradient(135deg,#7c3aed,#0284c7)' }}>
          <FiTarget className="w-5 h-5" />
          View Skill Gap Analysis
          <FiArrowRight className="w-4 h-4 ml-auto" />
        </Link>
        <Link to="/roadmaps/advisor"
          className="flex items-center gap-3 p-4 rounded-2xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background:'linear-gradient(135deg,#059669,#0ea5e9)' }}>
          <FiZap className="w-5 h-5" />
          Ask Career Advisor
          <FiArrowRight className="w-4 h-4 ml-auto" />
        </Link>
      </div>
    </div>
  )
}
