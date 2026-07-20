import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts'
import {
  FiTrendingUp, FiAward, FiBookOpen, FiTarget, FiCheckCircle,
  FiAlertCircle, FiArrowRight, FiFileText, FiZap, FiMap,
  FiStar, FiClock, FiActivity, FiCpu,
} from 'react-icons/fi'
import { dashboardService } from '../../services'
import { useAuthStore } from '../../store/authStore'
import { capitalize } from '../../utils'
import toast from 'react-hot-toast'

const COLORS   = ['#0ea5e9','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899']
const profToNum = { expert:100, advanced:75, intermediate:50, beginner:25 }

/* ─── Animated counter ─────────────────────────────────────── */
function CountUp({ end, duration = 1200, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!end) return
    const startTime = performance.now()
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * end))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [end, duration])
  return <>{val}{suffix}</>
}

/* ─── SVG Circle Progress ──────────────────────────────────── */
function CircleProgress({ value = 0, size = 110, stroke = 9, color = '#0ea5e9', label, sub }) {
  const r      = (size - stroke) / 2
  const circ   = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{Math.round(value)}</span>
          <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
        </div>
      </div>
      {label && <p className="text-xs font-semibold text-gray-700 text-center">{label}</p>}
      {sub   && <p className="text-[10px] text-gray-400 text-center">{sub}</p>}
    </div>
  )
}

/* ─── Gradient Stat Card ───────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, gradient, link, linkLabel, delay = '0s', suffix = '' }) {
  const num = parseFloat(String(value).replace('%',''))
  return (
    <div
      className="stat-card animate-slide-up"
      style={{ background: gradient, animationDelay: delay }}
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute right-2 bottom-2 w-16 h-16 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-3xl font-extrabold text-white mb-0.5">
          {suffix ? <><CountUp end={num} />{suffix}</> : value}
        </p>
        {sub && <p className="text-white/60 text-xs truncate max-w-[160px]">{sub}</p>}
        {link && (
          <Link to={link} className="inline-flex items-center gap-1 mt-3 text-white/75 hover:text-white text-xs font-semibold transition-colors group">
            {linkLabel}
            <FiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  )
}

/* ─── Readiness badge ──────────────────────────────────────── */
function ReadinessBadge({ level }) {
  const map = {
    not_started:  { label:'Not Started',  cls:'bg-gray-100 text-gray-600' },
    beginner:     { label:'Beginner',     cls:'bg-yellow-100 text-yellow-700' },
    intermediate: { label:'Intermediate', cls:'bg-blue-100 text-blue-700' },
    advanced:     { label:'Advanced',     cls:'bg-green-100 text-green-700' },
    expert:       { label:'Expert',       cls:'bg-purple-100 text-purple-700' },
    unknown:      { label:'Analyzing…',  cls:'bg-gray-100 text-gray-400' },
  }
  const { label, cls } = map[level] || map.unknown
  return <span className={`badge ${cls}`}>{label}</span>
}

/* ─── Empty widget ─────────────────────────────────────────── */
function EmptyWidget({ icon: Icon = FiActivity, message, link, linkLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center animate-float">
        <Icon className="w-7 h-7 text-slate-300" />
      </div>
      <p className="text-gray-400 text-sm max-w-[200px]">{message}</p>
      {link && <Link to={link} className="btn-primary text-sm py-1.5 px-4">{linkLabel}</Link>}
    </div>
  )
}

/* ─── Tip card ─────────────────────────────────────────────── */
const TIPS = [
  'Upload your resume to automatically extract and sync your skills.',
  'Set a target role to unlock personalized skill gap analysis.',
  'Use the Career Advisor chat to get real-time career guidance.',
  'Generate a roadmap to get a step-by-step learning plan.',
  'Add at least 5 skills to unlock the Skill Radar chart.',
]
function TipCard() {
  const tip = TIPS[Math.floor(Date.now() / 86400000) % TIPS.length]
  return (
    <div className="rounded-2xl p-4 flex items-start gap-3 animate-fade-in"
      style={{ background: 'linear-gradient(135deg, #0ea5e90d, #8b5cf60d)', border: '1px solid #0ea5e920' }}>
      <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <FiStar className="w-4 h-4 text-primary-600" />
      </div>
      <div>
        <p className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-0.5">Tip of the Day</p>
        <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [stats,   setStats]    = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading]  = useState(true)
  const { user } = useAuthStore()

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    try {
      const statsRes = await dashboardService.getStats()
      setStats(statsRes.data)

      // Activity fetch separately — don't fail dashboard if it errors
      try {
        const activityRes = await dashboardService.getActivity(50)
        const acts = activityRes.data?.activities || []
        const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        const today = new Date()

        const weekData = Array.from({ length: 7 }, (_, i) => {
          const d      = new Date(today)
          d.setDate(today.getDate() - (6 - i))
          const dayStr  = days[d.getDay()]
          const dateStr = d.toDateString()
          const count   = acts.filter(a => {
            const ad = new Date(a.timestamp)
            return ad.toDateString() === dateStr
          }).length
          return { day: dayStr, score: count }
        })
        setActivity(weekData)
      } catch {
        // Fall back to empty chart — don't crash dashboard
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        const today = new Date()
        setActivity(Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today)
          d.setDate(today.getDate() - (6 - i))
          return { day: days[d.getDay()], score: 0 }
        }))
      }
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 skeleton w-64 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_,i)=>(
            <div key={i} className="h-36 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-56 skeleton rounded-2xl" />
          <div className="h-56 skeleton rounded-2xl lg:col-span-2" />
        </div>
      </div>
    )
  }

  const skills  = stats?.skills  || {}
  const career  = stats?.career  || {}
  const profile = stats?.profile || {}
  const learning= stats?.learning|| {}

  const topSkills = skills.top_skills || []
  const profDist  = skills.proficiency_distribution || {}

  /* Chart data */
  const radarData = topSkills.slice(0,6).map(s => ({
    skill: s.name.length > 9 ? s.name.slice(0,9)+'…' : s.name,
    value: profToNum[s.proficiency] || 25,
    fullMark: 100,
  }))

  const pieData = Object.entries(profDist).map(([name, value]) => ({
    name: capitalize(name), value,
  }))

  const barData = [
    { name:'Skills',    value: skills.total_skills || 0      },
    { name:'Roadmaps',  value: learning.total_roadmaps || 0  },
    { name:'Resumes',   value: stats?.total_resumes || 0     },
    { name:'Recs',      value: stats?.total_recommendations || 0 },
  ]

  const hour = new Date().getHours()
  const greeting = hour<12 ? 'Good morning' : hour<18 ? 'Good afternoon' : 'Good evening'
  const completionPct = profile.profile_completion || 0
  const matchPct      = career.skill_match_percentage || 0

  return (
    <div className="space-y-6 max-w-[1400px] animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-slide-up">
        <div>
          <p className="text-sm text-gray-400 font-medium mb-1">
            {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {greeting}, <span className="text-primary-600">{user?.full_name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Your career dashboard is ready</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/profile/edit" className="btn-secondary text-sm">Edit Profile</Link>
          <Link to="/recommendations" className="btn-primary text-sm">
            <FiZap className="w-4 h-4" /> Get Insights
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiAward}      label="Profile"      value={`${Math.round(completionPct)}%`} suffix="%" sub="Completion"
          gradient="linear-gradient(135deg,#0284c7,#0369a1)" link="/profile/edit" linkLabel="Complete" delay="0.05s" />
        <StatCard icon={FiTrendingUp} label="Skills"       value={skills.total_skills || 0}       sub="Added to profile"
          gradient="linear-gradient(135deg,#059669,#047857)" link="/profile/skills" linkLabel="Add more" delay="0.10s" />
        <StatCard icon={FiMap}        label="Roadmaps"     value={learning.active_roadmaps || 0}  sub="Active paths"
          gradient="linear-gradient(135deg,#7c3aed,#6d28d9)" link="/roadmaps" linkLabel="View all" delay="0.15s" />
        <StatCard icon={FiTarget}     label="Career Match" value={`${Math.round(matchPct)}%`} suffix="%" sub={career.target_role || 'No target set'}
          gradient="linear-gradient(135deg,#ea580c,#dc2626)" link="/recommendations" linkLabel="Improve" delay="0.20s" />
      </div>

      {/* ── Tip ── */}
      <div className="animate-slide-up stagger-3"><TipCard /></div>

      {/* ── Progress rings + Area chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress rings */}
        <div className="card animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900">Progress Overview</h2>
            <span className="badge bg-primary-50 text-primary-600">Live</span>
          </div>
          <div className="flex flex-wrap justify-around gap-4">
            <CircleProgress value={completionPct} color="#0ea5e9" label="Profile"      sub="Completion" />
            <CircleProgress value={matchPct}      color="#8b5cf6" label="Career Match" sub={career.target_role ? career.target_role.slice(0,14)+'…' : '—'} />
            <CircleProgress value={Math.min((skills.total_skills||0)*5,100)} color="#10b981" label="Skill Score" sub={`${skills.total_skills||0} skills`} />
          </div>
        </div>

        {/* Real activity area chart */}
        <div className="card lg:col-span-2 animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Weekly Activity</h2>
              <p className="text-xs text-gray-400 mt-0.5">Real events — resumes, roadmaps, recommendations</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
              <FiActivity className="w-3 h-3" /> Live Data
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 8px 32px rgba(0,0,0,0.1)', fontSize:'12px' }}
                formatter={(v) => [v, 'Activities']}
              />
              <Area type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2.5}
                fill="url(#areaGrad)" dot={false}
                activeDot={{ r:4, fill:'#0ea5e9', stroke:'#fff', strokeWidth:2 }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Activity breakdown tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            {[
              { label:'Skills',         value: skills.total_skills || 0,           color:'text-primary-600', bg:'bg-primary-50',  icon:'🎯' },
              { label:'Roadmaps',       value: learning.active_roadmaps || 0,      color:'text-violet-600',  bg:'bg-violet-50',   icon:'🗺️' },
              { label:'Resumes',        value: stats?.total_resumes || 0,          color:'text-emerald-600', bg:'bg-emerald-50',  icon:'📄' },
              { label:'Recommendations',value: stats?.total_recommendations || 0, color:'text-amber-600',   bg:'bg-amber-50',    icon:'💡' },
            ].map(({ label, value, color, bg, icon }) => (
              <div key={label} className={`p-3 rounded-xl ${bg} flex items-center gap-2.5`}>
                <span className="text-lg">{icon}</span>
                <div>
                  <p className={`text-lg font-extrabold ${color} leading-none`}>{value}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bar + Radar + Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="card animate-slide-up stagger-2">
          <h2 className="text-sm font-bold text-gray-900 mb-5">Activity Summary</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 8px 32px rgba(0,0,0,0.1)', fontSize:'12px' }} cursor={{ fill:'#f8fafc' }} />
              {barData.map((_,i) => (
                <Bar key={i} dataKey="value" fill={COLORS[i]} radius={[6,6,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="card animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Skill Radar</h2>
            <Link to="/profile/skills" className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold">Manage →</Link>
          </div>
          {radarData.length >= 3 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize:10, fill:'#64748b' }} />
                <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fontSize:8, fill:'#cbd5e1' }} />
                <Radar name="Proficiency" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.18} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 8px 32px rgba(0,0,0,0.1)', fontSize:'12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyWidget icon={FiCpu} message="Add 3+ skills to see your skill radar" link="/profile/skills" linkLabel="Add Skills" />
          )}
        </div>

        {/* Pie */}
        <div className="card animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Skill Distribution</h2>
            <span className="text-[11px] text-gray-400">{skills.total_skills||0} skills</span>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="42%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 8px 32px rgba(0,0,0,0.1)', fontSize:'12px' }} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize:'11px', paddingTop:'6px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyWidget icon={FiActivity} message="Add skills to see distribution" link="/profile/skills" linkLabel="Add Skills" />
          )}
        </div>
      </div>

      {/* ── Career + Top Skills ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Career Readiness */}
        <div className="card animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900">Career Readiness</h2>
            {career.readiness_level && <ReadinessBadge level={career.readiness_level} />}
          </div>

          {career.target_role ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <FiTarget className="w-4 h-4 text-primary-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Target Role</p>
                  <p className="font-bold text-gray-900 text-sm truncate">{career.target_role}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-500 font-medium">Skill Match</span>
                  <span className="font-bold text-primary-600">{Math.round(matchPct)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width:`${matchPct}%`,
                    background:'linear-gradient(90deg,#0ea5e9,#8b5cf6)',
                  }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <FiCheckCircle className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400">Matched</p>
                    <p className="font-extrabold text-emerald-700 text-lg leading-none">{career.matched_skills||0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-orange-50 rounded-xl border border-orange-100">
                  <FiAlertCircle className="text-orange-500 w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400">To Learn</p>
                    <p className="font-extrabold text-orange-600 text-lg leading-none">{career.missing_skills_count||0}</p>
                  </div>
                </div>
              </div>

              <Link to="/recommendations/careers" className="btn-primary w-full text-sm">
                View Career Path <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <EmptyWidget icon={FiTarget} message="Set a target role to track your career readiness" link="/profile/edit" linkLabel="Set Target Role" />
          )}
        </div>

        {/* Top Skills */}
        <div className="card animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900">Top Skills</h2>
            <Link to="/profile/skills" className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold">Manage →</Link>
          </div>

          {topSkills.length > 0 ? (
            <div className="space-y-3">
              {topSkills.slice(0,5).map((skill, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
                    style={{ background: COLORS[i % COLORS.length] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800 truncate">{skill.name}</span>
                      <span className="text-[10px] text-gray-400 capitalize ml-2 flex-shrink-0 font-medium">{skill.proficiency}</span>
                    </div>
                    <div className="progress-bar" style={{height:'4px'}}>
                      <div className="progress-fill" style={{
                        width:`${profToNum[skill.proficiency]||25}%`,
                        background: COLORS[i % COLORS.length],
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              {topSkills.length > 5 && (
                <Link to="/profile/skills" className="block text-center text-xs text-primary-600 font-semibold pt-1">
                  +{topSkills.length-5} more skills →
                </Link>
              )}
            </div>
          ) : (
            <EmptyWidget icon={FiTrendingUp} message="Add your first skill to get started" link="/profile/skills" linkLabel="Add Skills" />
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="card animate-slide-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
          <span className="text-xs text-gray-400">Shortcuts to key features</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'Upload Resume',    icon:FiFileText,   to:'/resume/upload',     from:'#0284c7', to_c:'#0ea5e9' },
            { label:'Add Skills',       icon:FiTrendingUp, to:'/profile/skills',    from:'#059669', to_c:'#10b981' },
            { label:'Generate Roadmap', icon:FiMap,        to:'/roadmaps',          from:'#7c3aed', to_c:'#8b5cf6' },
            { label:'Career Advisor',   icon:FiZap,        to:'/roadmaps/advisor',  from:'#ea580c', to_c:'#f59e0b' },
          ].map(({ label, icon: Icon, to, from, to_c }, i) => (
            <Link key={to} to={to}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 hover:border-transparent transition-all duration-300 hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay:`${i*0.05}s` }}
              onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg,${from}15,${to_c}10)` }}
              onMouseLeave={e => { e.currentTarget.style.background = '' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                style={{ background:`linear-gradient(135deg,${from},${to_c})` }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
