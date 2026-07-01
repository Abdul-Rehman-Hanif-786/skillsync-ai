import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FiUpload, FiFileText, FiX, FiCheckCircle, FiTrash2,
  FiEye, FiClock, FiZap, FiArrowRight, FiRefreshCw,
  FiAlertCircle, FiDownload,
} from 'react-icons/fi'
import { resumeService } from '../../services'
import { formatDate, getErrorMessage } from '../../utils'
import toast from 'react-hot-toast'

/* ── Format bytes ── */
const fmt = bytes => bytes < 1024 * 1024
  ? `${(bytes / 1024).toFixed(0)} KB`
  : `${(bytes / 1024 / 1024).toFixed(1)} MB`

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    completed: { cls:'bg-emerald-100 text-emerald-700 border-emerald-200', icon:<FiCheckCircle className="w-3 h-3"/>, label:'Parsed' },
    processing: { cls:'bg-blue-100 text-blue-700 border-blue-200', icon:<FiRefreshCw className="w-3 h-3 animate-spin"/>, label:'Processing' },
    failed:     { cls:'bg-red-100 text-red-700 border-red-200', icon:<FiAlertCircle className="w-3 h-3"/>, label:'Failed' },
  }
  const { cls, icon, label } = map[status] || map.completed
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cls}`}>
      {icon}{label}
    </span>
  )
}

export default function ResumeUpload() {
  const navigate  = useNavigate()
  const inputRef  = useRef(null)
  const [file,       setFile]       = useState(null)
  const [uploading,  setUploading]  = useState(false)
  const [dragOver,   setDragOver]   = useState(false)
  const [resumes,    setResumes]    = useState([])
  const [loadingHist,setLoadingHist]= useState(true)
  const [progress,   setProgress]   = useState(0)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    setLoadingHist(true)
    try {
      const res = await resumeService.getAll()
      setResumes(res.data || [])
    } catch { setResumes([]) }
    finally { setLoadingHist(false) }
  }

  const handleFile = f => {
    if (!f) return
    if (f.type !== 'application/pdf') { toast.error('Only PDF files are supported'); return }
    if (f.size > 10 * 1024 * 1024)    { toast.error('File must be under 10MB'); return }
    setFile(f)
  }

  const handleDrop = e => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true); setProgress(0)
    // Fake progress animation
    const interval = setInterval(() => {
      setProgress(p => p < 85 ? p + 5 : p)
    }, 200)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await resumeService.upload(formData)
      clearInterval(interval); setProgress(100)
      toast.success(res.data.message || 'Resume uploaded!')
      setTimeout(() => {
        setFile(null); setProgress(0)
        navigate(`/resume/${res.data.resume?.id}`)
      }, 600)
    } catch (err) {
      clearInterval(interval); setProgress(0)
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id, name, e) => {
    e.stopPropagation()
    if (!window.confirm(`Delete "${name}"?`)) return
    setDeletingId(id)
    try {
      await resumeService.delete(id)
      setResumes(prev => prev.filter(r => r.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
    finally { setDeletingId(null) }
  }

  return (
    <div className="max-w-5xl animate-fade-in space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Resume</h1>
          <p className="text-gray-400 text-sm mt-0.5">Upload your CV — AI extracts skills automatically</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
          <FiFileText className="w-4 h-4" />
          {resumes.length} uploaded
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ════ LEFT — Upload (3/5) ════ */}
        <div className="lg:col-span-3 space-y-5">

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            className="relative rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden"
            style={{
              borderColor: dragOver ? '#0ea5e9' : file ? '#10b981' : '#e2e8f0',
              background:  dragOver ? 'rgba(14,165,233,0.04)' : file ? 'rgba(16,185,129,0.03)' : '#fafbfc',
              cursor: file ? 'default' : 'pointer',
            }}
          >
            <input ref={inputRef} type="file" accept=".pdf" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />

            {!file ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="relative mb-5 animate-float">
                  <div className="absolute inset-0 rounded-2xl bg-primary-400 blur-xl opacity-20" />
                  <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background:'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                    <FiUpload className="w-9 h-9 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-gray-800 mb-1">
                  {dragOver ? 'Drop it here!' : 'Upload Your Resume'}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Drag & drop your PDF or <span className="text-primary-600 font-semibold">click to browse</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                    <FiFileText className="w-3 h-3" /> PDF only
                  </span>
                  <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                    Max 10MB
                  </span>
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                    <FiZap className="w-3 h-3" /> AI Parsed
                  </span>
                </div>
              </div>
            ) : (
              /* File selected */
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'linear-gradient(135deg,#10b981,#059669)' }}>
                    <FiFileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{fmt(file.size)}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-semibold">Ready to upload</span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress bar during upload */}
                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Uploading & parsing…</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width:`${progress}%`, background:'linear-gradient(90deg,#0ea5e9,#10b981)' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn-primary w-full text-sm disabled:opacity-50 justify-center"
          >
            {uploading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
              : <><FiUpload className="w-4 h-4" /> Upload & Parse Resume</>
            }
          </button>

          {/* What AI extracts */}
          <div className="card animate-slide-up">
            <h3 className="font-bold text-gray-900 text-sm mb-4">What our AI extracts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon:'🎯', title:'Technical Skills',  desc:'Programming languages, frameworks, tools' },
                { icon:'📊', title:'Experience Level',  desc:'Years of work and seniority signals' },
                { icon:'🏢', title:'Job Titles',        desc:'Past and current role titles' },
                { icon:'🎓', title:'Education',         desc:'Degrees, certifications, courses' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════ RIGHT — History (2/5) ════ */}
        <div className="lg:col-span-2">
          <div className="card h-full animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-sm">Upload History</h3>
              <button onClick={loadHistory}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                <FiRefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingHist ? (
              <div className="space-y-3">
                {[...Array(3)].map((_,i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
              </div>
            ) : resumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiFileText className="w-12 h-12 text-gray-200 mb-3 animate-float" />
                <p className="text-gray-400 font-medium text-sm">No resumes yet</p>
                <p className="text-gray-400 text-xs mt-1">Upload your first resume to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((r, i) => (
                  <div key={r.id}
                    className="group flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 cursor-pointer animate-scale-in"
                    style={{ animationDelay:`${i*0.05}s` }}
                    onClick={() => navigate(`/resume/${r.id}`)}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-200"
                      style={{ background:'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                      <FiFileText className="w-5 h-5 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {r.filename || r.original_filename || 'Resume.pdf'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <FiClock className="w-2.5 h-2.5" />
                          {formatDate(r.created_at)}
                        </span>
                        {r.parsing_status && <StatusBadge status={r.parsing_status} />}
                      </div>
                      {r.extracted_skills?.length > 0 && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          {r.extracted_skills.length} skills extracted
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/resume/${r.id}`) }}
                        className="p-1.5 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors"
                        title="View insights"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => handleDelete(r.id, r.filename || 'Resume', e)}
                        disabled={deletingId === r.id}
                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        {deletingId === r.id
                          ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <FiTrash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
