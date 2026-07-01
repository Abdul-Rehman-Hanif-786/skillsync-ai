import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FiFileText, FiTrash2, FiArrowLeft, FiCheckCircle,
  FiClock, FiZap, FiCpu, FiArrowRight, FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi'
import { resumeService } from '../../services'
import { formatDate, getErrorMessage } from '../../utils'
import toast from 'react-hot-toast'

const SKILL_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
]

export default function ResumeInsights() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resume,   setResume]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showFull, setShowFull] = useState(false)

  useEffect(() => { loadResume() }, [id])

  const loadResume = async () => {
    try {
      const res = await resumeService.getById(id)
      setResume(res.data)
    } catch {
      toast.error('Resume not found')
      navigate('/resume/upload')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this resume?')) return
    setDeleting(true)
    try {
      await resumeService.delete(id)
      toast.success('Resume deleted')
      navigate('/resume/upload')
    } catch {
      toast.error('Failed to delete')
      setDeleting(false)
    }
  }

  /* ── Skeleton ── */
  if (loading) return (
    <div className="max-w-5xl space-y-5 animate-pulse">
      <div className="h-8 skeleton w-48 rounded-xl" />
      <div className="h-28 skeleton rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 skeleton rounded-2xl" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    </div>
  )

  const skills = resume?.extracted_skills || []
  const text   = resume?.extracted_text   || ''
  const fname  = resume?.filename || resume?.original_filename || 'Resume.pdf'

  return (
    <div className="max-w-5xl animate-fade-in space-y-6">

      {/* ── Back + header ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/resume/upload')}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all">
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900">Resume Insights</h1>
          <p className="text-gray-400 text-sm mt-0.5">AI-extracted information from your CV</p>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all disabled:opacity-50">
          {deleting
            ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
            : <FiTrash2 className="w-4 h-4" />
          }
          Delete
        </button>
      </div>

      {/* ── Resume hero card ── */}
      <div className="rounded-3xl overflow-hidden border border-gray-100"
        style={{ boxShadow:'0 4px 32px rgba(0,0,0,0.07)' }}>
        {/* Banner */}
        <div className="h-20 relative" style={{ background:'linear-gradient(135deg,#0a1628,#0d1f3c)' }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} className="absolute rounded-full opacity-15" style={{
              width:`${8+(i%3)*6}px`, height:`${8+(i%3)*6}px`,
              background:i%2===0?'#38bdf8':'#818cf8',
              left:`${(i*20+5)%85}%`, top:`${(i*25+10)%60}%`,
              animation:`float ${4+(i%3)}s ease-in-out ${i*0.3}s infinite`,
            }} />
          ))}
        </div>
        <div className="bg-white px-6 pb-5 flex items-end gap-4 -mt-7">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white"
              style={{ background:'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow:'0 4px 16px rgba(14,165,233,0.3)' }}>
              <FiFileText className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0 pt-8">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-gray-900 truncate">{fname}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <FiCheckCircle className="w-3 h-3" /> Parsed
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <FiClock className="w-3 h-3" /> {formatDate(resume?.created_at)}
              </span>
              {skills.length > 0 && (
                <span className="text-xs text-primary-600 font-semibold flex items-center gap-1">
                  <FiZap className="w-3 h-3" /> {skills.length} skills extracted
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Skills + text (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Extracted Skills */}
          <div className="card animate-slide-up">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <FiCpu className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Extracted Skills</h3>
                <p className="text-xs text-gray-400">{skills.length} skills found by AI</p>
              </div>
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => {
                  const name = typeof s === 'string' ? s : s.name || s
                  const cls  = SKILL_COLORS[i % SKILL_COLORS.length]
                  return (
                    <span key={i}
                      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border transition-transform hover:scale-105 duration-200 ${cls}`}
                      style={{ animationDelay:`${i*0.03}s` }}
                    >
                      {name}
                    </span>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiAlertCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No skills were extracted from this resume.</p>
                <p className="text-gray-400 text-xs mt-1">Try uploading a clearer PDF with listed skills.</p>
              </div>
            )}
          </div>

          {/* Resume Text */}
          {text && (
            <div className="card animate-slide-up stagger-2">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-600 flex items-center justify-center">
                    <FiFileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Parsed Text</h3>
                    <p className="text-xs text-gray-400">Extracted content from PDF</p>
                  </div>
                </div>
                <button onClick={() => setShowFull(v => !v)}
                  className="text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                  {showFull ? 'Show less' : 'Show full'}
                </button>
              </div>
              <div className={`relative overflow-hidden transition-all duration-500 ${showFull ? '' : 'max-h-64'}`}>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-x-auto">
                  {text}
                </pre>
                {!showFull && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Actions + tips (1/3) ── */}
        <div className="space-y-5 animate-slide-up stagger-2">

          {/* Quick stats */}
          <div className="card">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label:'Skills Found',     value: skills.length,          color:'text-primary-600'  },
                { label:'Words Parsed',     value: text.split(/\s+/).filter(Boolean).length || 0, color:'text-emerald-600'  },
                { label:'Parse Status',     value: 'Completed',            color:'text-violet-600'   },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500 font-medium">{label}</span>
                  <span className={`text-sm font-extrabold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next steps */}
          <div className="card">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Next Steps</h3>
            <div className="space-y-2">
              {[
                { label:'View Skill Gaps',      icon:FiCpu,       to:'/recommendations/careers',  color:'text-blue-600 bg-blue-50 hover:bg-blue-100' },
                { label:'Generate Roadmap',     icon:FiZap,       to:'/roadmaps',                 color:'text-violet-600 bg-violet-50 hover:bg-violet-100' },
                { label:'Get Recommendations',  icon:FiRefreshCw, to:'/recommendations',          color:'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
                { label:'Upload New Resume',    icon:FiFileText,  to:'/resume/upload',            color:'text-gray-600 bg-gray-50 hover:bg-gray-100' },
              ].map(({ label, icon: Icon, to, color }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${color}`}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {label}
                  <FiArrowRight className="w-3 h-3 ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="p-4 rounded-2xl border border-primary-100"
            style={{ background:'linear-gradient(135deg,rgba(14,165,233,0.06),rgba(139,92,246,0.04))' }}>
            <p className="text-xs font-bold text-primary-700 mb-1.5 flex items-center gap-1.5">
              <FiZap className="w-3.5 h-3.5" /> Pro Tip
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Upload an updated resume to get the most accurate skill gap analysis and career recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
