import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FiUser, FiBriefcase, FiTarget, FiMapPin, FiCalendar,
  FiFileText, FiGithub, FiLinkedin, FiArrowLeft, FiSave,
  FiCheckCircle, FiAlertCircle, FiEye, FiLock,
} from 'react-icons/fi'
import { profileService } from '../../services'
import { useAuthStore } from '../../store/authStore'
import { getErrorMessage, capitalize } from '../../utils'
import { EXPERIENCE_LEVELS } from '../../config'
import toast from 'react-hot-toast'

/* ── Input classes ── */
const inputCls = `
  w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white
  text-sm text-gray-900 placeholder-gray-400 outline-none
  transition-all duration-200
  focus:border-primary-400 focus:ring-2 focus:ring-primary-100
`

/* ── Field wrapper ── */
function Field({ label, icon: Icon, hint, children, optional }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
        {optional && <span className="text-gray-400 text-xs font-normal">(optional)</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 leading-relaxed">{hint}</p>}
    </div>
  )
}

/* ── Section card ── */
function Section({ icon, color, title, children, delay = '0s' }) {
  return (
    <div className="card animate-slide-up" style={{ animationDelay: delay }}>
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <h2 className="font-bold text-gray-800 text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}

/* ── Level pills selector ── */
function LevelSelector({ value, onChange }) {
  const levels = [
    { value:'entry',  label:'Entry',  desc:'0–2 yrs',  color:'bg-slate-100 border-slate-300 text-slate-700'  },
    { value:'mid',    label:'Mid',    desc:'2–5 yrs',  color:'bg-blue-50 border-blue-300 text-blue-700'      },
    { value:'senior', label:'Senior', desc:'5–10 yrs', color:'bg-purple-50 border-purple-300 text-purple-700'},
    { value:'lead',   label:'Lead',   desc:'10+ yrs',  color:'bg-amber-50 border-amber-300 text-amber-700'   },
  ]
  return (
    <div className="grid grid-cols-4 gap-2">
      {levels.map(l => (
        <button key={l.value} type="button"
          onClick={() => onChange(l.value)}
          className={`flex flex-col items-center py-2.5 px-2 rounded-xl border-2 text-center transition-all duration-200 ${
            value === l.value
              ? `${l.color} border-current shadow-sm scale-105`
              : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
          }`}
        >
          <span className="text-sm font-bold">{l.label}</span>
          <span className="text-[10px] font-medium opacity-70 mt-0.5">{l.desc}</span>
        </button>
      ))}
    </div>
  )
}

export default function ProfileEdit() {
  const navigate   = useNavigate()
  const { user }   = useAuthStore()
  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(true)
  const [isNew,    setIsNew]    = useState(false)
  const [saved,    setSaved]    = useState(false)

  const [form, setForm] = useState({
    bio:'', current_role:'', target_role:'', location:'',
    years_of_experience:'', experience_level:'entry',
    github_url:'', linkedin_url:'',
  })

  /* Fetch existing profile */
  useEffect(() => {
    profileService.get()
      .then(res => {
        const p = res.data
        setForm({
          bio:                 p.bio || '',
          current_role:        p.current_role || '',
          target_role:         p.target_role || '',
          location:            p.location || '',
          years_of_experience: p.years_of_experience ?? '',
          experience_level:    p.experience_level || 'entry',
          github_url:          p.github_url || '',
          linkedin_url:        p.linkedin_url || '',
        })
      })
      .catch(err => { if (err?.response?.status === 404) setIsNew(true) })
      .finally(() => setFetching(false))
  }, [])

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))
  const setVal = (field, val) => setForm(f => ({ ...f, [field]: val }))

  /* Completeness */
  const checks = [
    { label: 'Bio',             done: !!form.bio.trim() },
    { label: 'Current Role',    done: !!form.current_role.trim() },
    { label: 'Target Role',     done: !!form.target_role.trim() },
    { label: 'Location',        done: !!form.location.trim() },
    { label: 'Experience',      done: form.years_of_experience !== '' },
    { label: 'Level',           done: !!form.experience_level },
  ]
  const doneCnt = checks.filter(c => c.done).length
  const pct = Math.round((doneCnt / checks.length) * 100)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        years_of_experience: form.years_of_experience !== ''
          ? Number(form.years_of_experience) : null,
      }
      if (isNew) { await profileService.create(payload); toast.success('Profile created!') }
      else       { await profileService.update(payload); toast.success('Changes saved!') }
      setSaved(true)
      setTimeout(() => navigate('/profile'), 900)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  /* ── Skeleton ── */
  if (fetching) return (
    <div className="max-w-5xl animate-pulse space-y-4">
      <div className="h-10 skeleton w-56 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 skeleton rounded-2xl" />
          <div className="h-48 skeleton rounded-2xl" />
        </div>
        <div className="h-80 skeleton rounded-2xl" />
      </div>
    </div>
  )

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'U'

  return (
    <div className="max-w-5xl animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-center gap-4 mb-7">
        <button onClick={() => navigate('/profile')}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all">
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {isNew ? 'Set Up Profile' : 'Edit Profile'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Keep your career profile up to date</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Completeness</p>
            <p className="text-sm font-extrabold text-primary-600">{pct}%</p>
          </div>
          {/* Mini ring */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4"
                stroke={pct===100?'#10b981':'#0ea5e9'}
                strokeDasharray={`${2*Math.PI*16}`}
                strokeDashoffset={`${2*Math.PI*16*(1-pct/100)}`}
                strokeLinecap="round"
                style={{ transition:'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ════════ LEFT — main fields (2/3) ════════ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <Section
              icon={<FiUser className="w-4 h-4 text-white" />}
              color="bg-primary-600"
              title="Basic Information"
              delay="0.05s"
            >
              <div className="space-y-4">
                <Field label="Bio" icon={FiFileText}
                  hint="A short intro about yourself — shown on your public profile">
                  <textarea
                    value={form.bio} onChange={set('bio')}
                    rows={4}
                    className={`${inputCls} resize-none leading-relaxed`}
                    placeholder="I'm a software developer passionate about building great products…"
                  />
                  <div className="flex justify-end">
                    <span className={`text-xs font-medium ${form.bio.length > 300 ? 'text-red-500' : 'text-gray-400'}`}>
                      {form.bio.length}/300
                    </span>
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Current Role" icon={FiBriefcase}>
                    <input type="text" value={form.current_role} onChange={set('current_role')}
                      className={inputCls} placeholder="e.g. Frontend Developer" />
                  </Field>
                  <Field label="Location" icon={FiMapPin}>
                    <input type="text" value={form.location} onChange={set('location')}
                      className={inputCls} placeholder="e.g. Karachi, Pakistan" />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Years of Experience" icon={FiCalendar}>
                    <input type="number" value={form.years_of_experience}
                      onChange={set('years_of_experience')}
                      min="0" max="50" className={inputCls} placeholder="0" />
                  </Field>
                  <Field label="Experience Level" icon={FiCalendar}>
                    <select value={form.experience_level}
                      onChange={e => setVal('experience_level', e.target.value)}
                      className={inputCls}>
                      {EXPERIENCE_LEVELS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Level pills */}
                <Field label="Quick Level Select" icon={FiCalendar}
                  hint="Click to quickly set your experience level">
                  <LevelSelector
                    value={form.experience_level}
                    onChange={v => setVal('experience_level', v)}
                  />
                </Field>
              </div>
            </Section>

            {/* Career Goal */}
            <Section
              icon={<FiTarget className="w-4 h-4 text-white" />}
              color="bg-violet-600"
              title="Career Goal"
              delay="0.10s"
            >
              <Field label="Target Role" icon={FiTarget}
                hint="Your dream job title — the AI uses this to generate skill gap analysis and roadmaps">
                <div className="relative">
                  <input type="text" value={form.target_role} onChange={set('target_role')}
                    className={inputCls} placeholder="e.g. Full Stack Developer"
                    list="role-suggestions" />
                  <datalist id="role-suggestions">
                    {['Full Stack Developer','Frontend Developer','Backend Developer',
                      'Data Scientist','AI Engineer','DevOps Engineer',
                      'Cloud Engineer','Mobile Developer'].map(r => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>
              </Field>

              {form.target_role && (
                <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-violet-50 border border-violet-100 animate-scale-in">
                  <FiCheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-violet-800">AI Analysis Enabled</p>
                    <p className="text-xs text-violet-600 mt-0.5">
                      Our AI will compare your skills against <strong>{form.target_role}</strong> requirements
                    </p>
                  </div>
                </div>
              )}
            </Section>

            {/* Social Links */}
            <Section
              icon={<FiGithub className="w-4 h-4 text-white" />}
              color="bg-slate-700"
              title="Social Links"
              delay="0.15s"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="GitHub" optional>
                  <div className="relative">
                    <FiGithub className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="url" value={form.github_url} onChange={set('github_url')}
                      className={`${inputCls} pl-10`}
                      placeholder="https://github.com/username" />
                  </div>
                </Field>
                <Field label="LinkedIn" optional>
                  <div className="relative">
                    <FiLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="url" value={form.linkedin_url} onChange={set('linkedin_url')}
                      className={`${inputCls} pl-10`}
                      placeholder="https://linkedin.com/in/username" />
                  </div>
                </Field>
              </div>
            </Section>

          </div>

          {/* ════════ RIGHT — preview + checklist (1/3) ════════ */}
          <div className="space-y-5">

            {/* Live Preview Card */}
            <div className="card animate-slide-up stagger-2 sticky top-24">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Live Preview</h3>

              {/* Mini profile preview */}
              <div className="flex flex-col items-center text-center mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl"
                    style={{ background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }}>
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <p className="font-extrabold text-gray-900 text-sm">{user?.full_name || 'Your Name'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{form.current_role || 'Current Role'}</p>
                {form.location && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <FiMapPin className="w-3 h-3" /> {form.location}
                  </p>
                )}
                {form.experience_level && (
                  <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                    {capitalize(form.experience_level)} Level
                  </span>
                )}
              </div>

              {/* Target role preview */}
              {form.target_role && (
                <div className="mb-4 p-3 rounded-xl border border-violet-100 bg-violet-50">
                  <p className="text-[10px] text-violet-500 font-bold uppercase tracking-wide mb-1">Goal</p>
                  <p className="text-sm font-bold text-violet-900">{form.target_role}</p>
                </div>
              )}

              {/* Checklist */}
              <div className="space-y-2 mb-4">
                {checks.map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    {done
                      ? <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      : <FiAlertCircle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    }
                    <span className={`text-xs ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: pct === 100
                      ? 'linear-gradient(90deg,#10b981,#059669)'
                      : 'linear-gradient(90deg,#0ea5e9,#8b5cf6)',
                  }} />
              </div>
              <p className="text-xs text-gray-400 text-right mt-1">{doneCnt}/{checks.length} fields</p>
            </div>

          </div>
        </div>

        {/* ── Save / Cancel ── */}
        <div className="flex items-center gap-3 mt-6 animate-slide-up stagger-4">
          <button type="submit" disabled={loading || saved}
            className="btn-primary flex items-center gap-2 min-w-[150px] justify-center disabled:opacity-60">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <><FiCheckCircle className="w-4 h-4" /> Saved!</>
            ) : (
              <><FiSave className="w-4 h-4" /> {isNew ? 'Create Profile' : 'Save Changes'}</>
            )}
          </button>
          <button type="button" onClick={() => navigate('/profile')} className="btn-secondary">
            Cancel
          </button>
          {!isNew && (
            <p className="text-xs text-gray-400 ml-2 flex items-center gap-1">
              <FiLock className="w-3 h-3" /> Changes are saved securely
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
