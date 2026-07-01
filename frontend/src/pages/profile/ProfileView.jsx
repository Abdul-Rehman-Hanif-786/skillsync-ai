import { Link } from 'react-router-dom'
import {
  FiEdit, FiMail, FiBriefcase, FiMapPin, FiCalendar,
  FiTarget, FiGithub, FiLinkedin, FiTrendingUp, FiBookOpen,
  FiArrowRight, FiCheckCircle, FiCpu, FiAward,
  FiZap, FiStar, FiAlertCircle,
} from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useProfile } from '../../hooks'
import { capitalize } from '../../utils'

const PROF_PCT  = { expert:100, advanced:75, intermediate:50, beginner:25 }
const PROF_GRAD = {
  expert:       'linear-gradient(135deg,#7c3aed,#6d28d9)',
  advanced:     'linear-gradient(135deg,#0284c7,#0369a1)',
  intermediate: 'linear-gradient(135deg,#059669,#047857)',
  beginner:     'linear-gradient(135deg,#d97706,#b45309)',
}
const LEVEL_MAP = {
  entry:  { bg:'bg-slate-100',  text:'text-slate-600',  dot:'bg-slate-400',  label:'Entry Level'  },
  mid:    { bg:'bg-blue-50',    text:'text-blue-700',   dot:'bg-blue-500',   label:'Mid Level'    },
  senior: { bg:'bg-purple-50',  text:'text-purple-700', dot:'bg-purple-500', label:'Senior Level' },
  lead:   { bg:'bg-amber-50',   text:'text-amber-700',  dot:'bg-amber-500',  label:'Lead / Principal' },
}

/* ── Small info chip ── */
function Chip({ icon: Icon, label, color = 'text-gray-500' }) {
  if (!label) return null
  return (
    <div className={`flex items-center gap-1.5 text-sm ${color}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  )
}

/* ── Right panel info card ── */
function InfoCard({ icon: Icon, title, value, sub, gradient, empty }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-sm transition-all duration-200"
      style={{ boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: gradient }}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{title}</p>
          {value
            ? <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
            : <p className="text-sm text-gray-400 italic">{empty}</p>
          }
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

export default function ProfileView() {
  const { user } = useAuthStore()
  const { profile, loading } = useProfile()

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'U'

  const levelStyle = LEVEL_MAP[profile?.experience_level] || LEVEL_MAP.entry

  /* ── Skeleton ── */
  if (loading) return (
    <div className="animate-pulse space-y-4 max-w-6xl">
      <div className="h-44 skeleton rounded-3xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 skeleton rounded-2xl" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    </div>
  )

  /* ── Profile completion % ── */
  const completionFields = ['bio','current_role','target_role','location','years_of_experience','experience_level']
  const filled = completionFields.filter(f => profile?.[f] != null && String(profile[f]).trim() !== '').length
  const completion = Math.round((filled / completionFields.length) * 100)
  const hasSkills = profile?.skills?.length > 0

  return (
    <div className="max-w-6xl animate-fade-in space-y-6">

      {/* ══════════════════════════════════════
          HERO CARD — Banner + Avatar + Name
      ══════════════════════════════════════ */}
      <div className="rounded-3xl overflow-hidden border border-gray-100"
        style={{ boxShadow:'0 4px 32px rgba(0,0,0,0.07)' }}>

        {/* Banner */}
        <div className="h-28 relative flex-shrink-0" style={{
          background:'linear-gradient(135deg,#060f1e 0%,#0d1f3c 50%,#0a1628 100%)'
        }}>
          {[...Array(8)].map((_,i) => (
            <div key={i} className="absolute rounded-full" style={{
              width:`${6+(i%3)*6}px`, height:`${6+(i%3)*6}px`,
              opacity:0.15,
              background:i%3===0?'#38bdf8':i%3===1?'#818cf8':'#34d399',
              left:`${(i*18+5)%88}%`, top:`${(i*25+8)%70}%`,
              animation:`float ${4+(i%3)}s ease-in-out ${i*0.3}s infinite`,
            }} />
          ))}
          {/* Edit button top-right */}
          <Link to="/profile/edit"
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{ background:'rgba(255,255,255,0.12)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
          >
            <FiEdit className="w-3.5 h-3.5" /> Edit Profile
          </Link>
        </div>

        {/* White content area */}
        <div className="bg-white px-6 pb-6">
          {/* Avatar row — pulled up over banner */}
          <div className="flex flex-wrap items-end gap-4 -mt-10 mb-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl blur-lg opacity-40"
                style={{ background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }} />
              <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl border-4 border-white"
                style={{ background:'linear-gradient(135deg,#0ea5e9,#8b5cf6)', boxShadow:'0 4px 20px rgba(14,165,233,0.3)' }}>
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-4 border-white" />
            </div>

            {/* Name + badges — BELOW avatar, not overlapping */}
            <div className="flex-1 min-w-0 pt-10">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-gray-900">
                  {user?.full_name || 'Your Name'}
                </h1>
                {profile?.experience_level && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${levelStyle.bg} ${levelStyle.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${levelStyle.dot}`} />
                    {levelStyle.label}
                  </span>
                )}
              </div>
              {/* Info chips */}
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <Chip icon={FiMail}      label={user?.email}                    color="text-gray-400" />
                <Chip icon={FiBriefcase} label={profile?.current_role}          color="text-gray-600" />
                <Chip icon={FiMapPin}    label={profile?.location}              color="text-gray-600" />
                <Chip icon={FiCalendar}  label={profile?.years_of_experience != null ? `${profile.years_of_experience} yrs exp` : null} color="text-gray-600" />
              </div>
            </div>

            {/* Social badges */}
            <div className="flex items-center gap-2 pb-1">
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                  <FiGithub className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all">
                  <FiLinkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile?.bio
            ? <p className="text-gray-600 text-sm leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">{profile.bio}</p>
            : <div className="text-center py-3 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">No bio yet. <Link to="/profile/edit" className="text-primary-600 font-semibold">Add one →</Link></p>
              </div>
          }
        </div>
      </div>

      {/* ══════════════════════════════════════
          TWO COLUMN — left: skills, right: info
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Skills (2/3) ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Skills card */}
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">My Skills</h2>
                <p className="text-xs text-gray-400 mt-0.5">{profile?.skills?.length || 0} skills in profile</p>
              </div>
              <Link to="/profile/skills" className="btn-secondary text-xs py-1.5 px-3">Manage</Link>
            </div>

            {profile?.skills?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.skills.slice(0,8).map((us, i) => {
                  const name = us.skill?.name || '—'
                  const prof = (us.proficiency_level || us.proficiency || 'beginner').toLowerCase()
                  const pct  = PROF_PCT[prof]  || 25
                  const grad = PROF_GRAD[prof] || PROF_GRAD.beginner
                  return (
                    <div key={us.id || i}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 group"
                      style={{ animationDelay:`${i*0.04}s` }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
                        style={{ background: grad }}>
                        {name.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800 truncate">{name}</span>
                          <span className="text-[10px] text-gray-400 capitalize ml-2 flex-shrink-0">{prof}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width:`${pct}%`, background: grad }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiCpu className="w-10 h-10 text-gray-200 mx-auto mb-2 animate-float" />
                <p className="text-gray-400 text-sm mb-3">No skills added yet</p>
                <Link to="/profile/skills" className="btn-primary text-sm">Add Skills</Link>
              </div>
            )}
            {profile?.skills?.length > 8 && (
              <div className="text-center mt-4">
                <Link to="/profile/skills" className="text-sm text-primary-600 font-semibold hover:text-primary-700">
                  +{profile.skills.length - 8} more →
                </Link>
              </div>
            )}
          </div>

          {/* Career Goal card */}
          <div className="card animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Career Goal</h2>
              <Link to="/profile/edit" className="text-xs text-primary-600 font-semibold hover:text-primary-700">Edit →</Link>
            </div>
            {profile?.target_role ? (
              <div className="flex items-center justify-between p-4 rounded-2xl border border-violet-100"
                style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.05),rgba(14,165,233,0.04))' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:'linear-gradient(135deg,#7c3aed,#0284c7)' }}>
                    <FiTarget className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Target Role</p>
                    <p className="font-extrabold text-gray-900">{profile.target_role}</p>
                  </div>
                </div>
                <Link to="/recommendations/careers"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#7c3aed,#0284c7)' }}>
                  View Path <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 rounded-2xl border-2 border-dashed border-gray-200">
                <FiTarget className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-float" />
                <p className="text-gray-400 text-sm mb-3">Set a target role to get AI recommendations</p>
                <Link to="/profile/edit" className="btn-primary text-sm">Set Goal</Link>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Info panel (1/3) ── */}
        <div className="space-y-4 animate-slide-up stagger-2">

          {/* Profile completion */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">Profile Strength</h3>
              <span className="text-xs font-bold text-primary-600">{completion}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width:`${completion}%`, background:'linear-gradient(90deg,#0ea5e9,#8b5cf6)' }} />
            </div>
            <div className="space-y-1.5">
              {[
                { label:'Bio added',            done: !!profile?.bio },
                { label:'Current role set',     done: !!profile?.current_role },
                { label:'Target role set',      done: !!profile?.target_role },
                { label:'Location added',       done: !!profile?.location },
                { label:'Skills added',         done: hasSkills },
                { label:'Experience level set', done: !!profile?.experience_level },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2">
                  {done
                    ? <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    : <FiAlertCircle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  }
                  <span className={`text-xs ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{label}</span>
                </div>
              ))}
            </div>
            {completion < 100 && (
              <Link to="/profile/edit" className="btn-primary w-full text-xs mt-4 justify-center">
                Complete Profile
              </Link>
            )}
          </div>

          {/* Info cards */}
          <InfoCard icon={FiCpu}      title="Skills"           value={profile?.skills?.length ? `${profile.skills.length} skills` : null} empty="None added"        gradient="linear-gradient(135deg,#0284c7,#0ea5e9)" sub="Click Manage to add" />
          <InfoCard icon={FiCalendar} title="Experience"       value={profile?.years_of_experience != null ? `${profile.years_of_experience} years` : null} empty="Not set" gradient="linear-gradient(135deg,#059669,#10b981)" />
          <InfoCard icon={FiTarget}   title="Target Role"      value={profile?.target_role}    empty="Not set"          gradient="linear-gradient(135deg,#7c3aed,#8b5cf6)" />
          <InfoCard icon={FiMapPin}   title="Location"         value={profile?.location}       empty="Not added"        gradient="linear-gradient(135deg,#ea580c,#f59e0b)" />

          {/* Quick actions */}
          <div className="card">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label:'Get Recommendations', icon:FiTrendingUp, to:'/recommendations',    color:'text-blue-600 bg-blue-50 hover:bg-blue-100' },
                { label:'Generate Roadmap',    icon:FiBookOpen,   to:'/roadmaps',           color:'text-violet-600 bg-violet-50 hover:bg-violet-100' },
                { label:'Upload Resume',       icon:FiZap,        to:'/resume/upload',      color:'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
                { label:'Career Advisor',      icon:FiStar,       to:'/roadmaps/advisor',   color:'text-amber-600 bg-amber-50 hover:bg-amber-100' },
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

        </div>
      </div>

    </div>
  )
}
