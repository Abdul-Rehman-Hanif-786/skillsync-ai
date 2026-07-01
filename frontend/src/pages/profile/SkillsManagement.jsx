import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSearch, FiPlus, FiTrash2, FiCpu, FiFilter,
  FiArrowLeft, FiCheckCircle, FiX, FiTrendingUp,
  FiZap, FiTarget, FiAward, FiChevronRight, FiRefreshCw,
} from 'react-icons/fi'
import { profileService, skillsService } from '../../services'
import { capitalize, getErrorMessage } from '../../utils'
import { PROFICIENCY_LEVELS } from '../../config'
import toast from 'react-hot-toast'

const PROF_GRADIENT = {
  expert:       'linear-gradient(135deg,#7c3aed,#6d28d9)',
  advanced:     'linear-gradient(135deg,#0284c7,#0369a1)',
  intermediate: 'linear-gradient(135deg,#059669,#047857)',
  beginner:     'linear-gradient(135deg,#d97706,#b45309)',
}
const PROF_BADGE = {
  expert:       'bg-purple-100 text-purple-700 border-purple-200',
  advanced:     'bg-blue-100 text-blue-700 border-blue-200',
  intermediate: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  beginner:     'bg-amber-100 text-amber-700 border-amber-200',
}
const PROF_PCT = { expert: 100, advanced: 75, intermediate: 50, beginner: 25 }

const SUGGESTED_SKILLS = [
  'Python', 'React', 'TypeScript', 'Docker', 'AWS',
  'PostgreSQL', 'Node.js', 'Machine Learning', 'Git', 'Kubernetes',
]

export default function SkillsManagement() {
  const [mySkills,      setMySkills]      = useState([])
  const [searchRes,     setSearchRes]     = useState([])
  const [searchQuery,   setSearchQuery]   = useState('')
  const [proficiency,   setProficiency]   = useState('beginner')
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [adding,        setAdding]        = useState(false)
  const [filterProf,    setFilterProf]    = useState('all')
  const [removing,      setRemoving]      = useState(null)
  const searchRef = useRef(null)

  useEffect(() => { loadSkills() }, [])

  useEffect(() => {
    if (searchQuery.trim().length > 1) searchSkills(searchQuery)
    else setSearchRes([])
  }, [searchQuery])

  const loadSkills = async () => {
    try {
      const res = await profileService.get()
      setMySkills(res.data?.skills || [])
    } catch { setMySkills([]) }
    finally  { setLoading(false) }
  }

  const searchSkills = async q => {
    try {
      const res = await skillsService.search(q)
      setSearchRes(res.data || [])
    } catch { setSearchRes([]) }
  }

  const handleSelect = skill => {
    setSelectedSkill(skill)
    setSearchQuery(skill.name)
    setSearchRes([])
  }

  const handleAdd = async e => {
    e.preventDefault()
    if (!selectedSkill) { toast.error('Select a skill from suggestions'); return }
    setAdding(true)
    try {
      await profileService.addSkill({ skill_id: selectedSkill.id, proficiency })
      toast.success(`${selectedSkill.name} added!`)
      setSelectedSkill(null); setSearchQuery(''); setProficiency('beginner')
      await loadSkills()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setAdding(false) }
  }

  const handleRemove = async (skillId, name) => {
    setRemoving(skillId)
    try {
      await profileService.removeSkill(skillId)
      toast.success(`${name} removed`)
      setMySkills(prev => prev.filter(s => s.id !== skillId))
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setRemoving(null) }
  }

  const filtered = filterProf === 'all'
    ? mySkills
    : mySkills.filter(s => (s.proficiency_level || s.proficiency) === filterProf)

  const profCount = PROFICIENCY_LEVELS.reduce((acc, l) => {
    acc[l.value] = mySkills.filter(s => (s.proficiency_level || s.proficiency) === l.value).length
    return acc
  }, {})

  if (loading) return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 skeleton w-44 rounded-xl" />
          <div className="h-40 skeleton rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_,i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
          </div>
          <div className="h-64 skeleton rounded-2xl" />
        </div>
        <div className="h-80 skeleton rounded-2xl" />
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══════════════════════════════════
            LEFT — Add + Skills list (2/3)
        ══════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/profile" className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-all">
                <FiArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Skills</h1>
                <p className="text-gray-400 text-sm">{mySkills.length} skills in your profile</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
              <FiTrendingUp className="w-4 h-4" />
              {mySkills.length} Total
            </div>
          </div>

          {/* Add Skill */}
          <div className="card animate-slide-up">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
                <FiPlus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Add New Skill</h2>
                <p className="text-xs text-gray-400">Search and add skills to your profile</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="sm:col-span-2 relative" ref={searchRef}>
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setSelectedSkill(null) }}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    placeholder="Search skills — React, Python, AWS…" />
                  {selectedSkill && (
                    <button type="button"
                      onClick={() => { setSelectedSkill(null); setSearchQuery('') }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      <FiX className="w-4 h-4" />
                    </button>
                  )}

                  {/* Dropdown */}
                  {searchRes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 shadow-xl z-20 overflow-hidden max-h-52 overflow-y-auto"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                      {searchRes.map(skill => (
                        <button key={skill.id} type="button" onClick={() => handleSelect(skill)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                            {skill.name.slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{skill.name}</p>
                            {skill.category && <p className="text-xs text-gray-400">{skill.category}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Proficiency */}
                <select value={proficiency} onChange={e => setProficiency(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all">
                  {PROFICIENCY_LEVELS.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Selected preview */}
              {selectedSkill && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-100 animate-scale-in">
                  <FiCheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-primary-800">
                    Adding <strong>{selectedSkill.name}</strong> as <strong>{capitalize(proficiency)}</strong>
                  </p>
                </div>
              )}

              <button type="submit" disabled={adding || !selectedSkill}
                className="btn-primary text-sm disabled:opacity-50 flex items-center gap-2">
                {adding
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <FiPlus className="w-4 h-4" />}
                Add Skill
              </button>
            </form>
          </div>

          {/* Proficiency filter pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up stagger-2">
            {PROFICIENCY_LEVELS.map(({ value, label }) => (
              <div key={value}
                className="p-4 rounded-2xl border text-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background:   filterProf === value ? `${PROF_GRADIENT[value]}18` : 'white',
                  borderColor:  filterProf === value ? 'rgba(14,165,233,0.3)' : '#f1f5f9',
                  boxShadow:    filterProf === value ? '0 2px 16px rgba(14,165,233,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onClick={() => setFilterProf(filterProf === value ? 'all' : value)}
              >
                <p className="text-2xl font-extrabold text-gray-900">{profCount[value] || 0}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Skills grid */}
          <div className="card animate-slide-up stagger-3">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 text-sm">
                {filterProf === 'all' ? 'All Skills' : `${capitalize(filterProf)} Skills`}
                <span className="ml-2 font-normal text-gray-400">({filtered.length})</span>
              </h2>
              {filterProf !== 'all' && (
                <button onClick={() => setFilterProf('all')}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                  <FiX className="w-3 h-3" /> Clear filter
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <FiCpu className="w-12 h-12 text-gray-200 mx-auto mb-3 animate-float" />
                <p className="text-gray-400 font-medium mb-1">
                  {mySkills.length === 0 ? 'No skills yet' : `No ${filterProf} skills`}
                </p>
                <p className="text-gray-400 text-sm">
                  {mySkills.length === 0 ? 'Search and add your first skill above' : 'Try a different filter'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((us, i) => {
                  const name  = us.skill?.name || us.name || '—'
                  const prof  = (us.proficiency_level || us.proficiency || 'beginner').toLowerCase()
                  const pct   = PROF_PCT[prof] || 25
                  const grad  = PROF_GRADIENT[prof]
                  const badge = PROF_BADGE[prof] || PROF_BADGE.beginner
                  const isRemoving = removing === us.id

                  return (
                    <div key={us.id || i}
                      className="group flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-white hover:border-primary-200 hover:shadow-sm transition-all duration-200 animate-scale-in"
                      style={{ animationDelay: `${i * 0.03}s`, opacity: isRemoving ? 0.5 : 1 }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 transition-transform group-hover:scale-105 duration-200"
                        style={{ background: grad }}>
                        {name.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-gray-800 truncate">{name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ml-2 flex-shrink-0 ${badge}`}>
                            {prof}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: grad }} />
                        </div>
                      </div>
                      <button onClick={() => handleRemove(us.id, name)} disabled={isRemoving}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 flex-shrink-0 disabled:opacity-50">
                        {isRemoving
                          ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                          : <FiTrash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════
            RIGHT — Info panel (1/3) sticky
        ══════════════════════════════════ */}
        <div className="animate-slide-up stagger-2">
          <div className="card sticky top-24 space-y-5">

            {/* Skill overview */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-4">Skill Overview</h3>
              <div className="space-y-2.5">
                {[
                  { label:'Total Skills',      value: mySkills.length,                    color:'text-primary-600', bg:'bg-primary-50' },
                  { label:'Expert Level',      value: profCount['expert'] || 0,           color:'text-purple-600',  bg:'bg-purple-50'  },
                  { label:'Advanced Level',    value: profCount['advanced'] || 0,         color:'text-blue-600',    bg:'bg-blue-50'    },
                  { label:'Intermediate',      value: profCount['intermediate'] || 0,     color:'text-emerald-600', bg:'bg-emerald-50' },
                  { label:'Beginner',          value: profCount['beginner'] || 0,         color:'text-amber-600',   bg:'bg-amber-50'   },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`flex items-center justify-between p-3 rounded-xl ${bg}`}>
                    <span className="text-xs font-medium text-gray-600">{label}</span>
                    <span className={`text-sm font-extrabold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested skills */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Suggested Skills</h3>
              <p className="text-xs text-gray-400 mb-3">Popular skills to add to your profile</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS
                  .filter(s => !mySkills.some(ms => (ms.skill?.name || ms.name || '').toLowerCase() === s.toLowerCase()))
                  .slice(0, 8)
                  .map(skill => (
                    <button key={skill}
                      onClick={() => { setSearchQuery(skill); setSelectedSkill({ id: null, name: skill }); searchSkills(skill) }}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all bg-white">
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>

            {/* Proficiency guide */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Proficiency Guide</h3>
              <div className="space-y-2.5">
                {[
                  { level:'Beginner',     desc:'Just starting out, learning basics',          grad: PROF_GRADIENT.beginner },
                  { level:'Intermediate', desc:'Can work independently on tasks',             grad: PROF_GRADIENT.intermediate },
                  { level:'Advanced',     desc:'Strong expertise, mentor others',             grad: PROF_GRADIENT.advanced },
                  { level:'Expert',       desc:'Deep mastery, industry authority',            grad: PROF_GRADIENT.expert },
                ].map(({ level, desc, grad }) => (
                  <div key={level} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0"
                      style={{ background: grad }}>
                      {level.slice(0,1)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{level}</p>
                      <p className="text-[10px] text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label:'View Profile',       icon: FiAward,      to: '/profile',                  color: 'text-primary-600 bg-primary-50 hover:bg-primary-100' },
                  { label:'Skill Gap Analysis', icon: FiTarget,     to: '/recommendations/careers',  color: 'text-violet-600 bg-violet-50 hover:bg-violet-100'   },
                  { label:'Generate Roadmap',   icon: FiZap,        to: '/roadmaps',                 color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
                  { label:'Upload Resume',      icon: FiRefreshCw,  to: '/resume/upload',            color: 'text-amber-600 bg-amber-50 hover:bg-amber-100'      },
                ].map(({ label, icon: Icon, to, color }) => (
                  <Link key={to} to={to}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${color}`}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />{label}
                    <FiChevronRight className="w-3 h-3 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="border-t border-gray-100 pt-4">
              <div className="p-3.5 rounded-2xl border border-primary-100"
                style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.07),rgba(139,92,246,0.04))' }}>
                <p className="text-xs font-bold text-primary-700 mb-1 flex items-center gap-1.5">
                  <FiZap className="w-3 h-3" /> Pro Tip
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Upload your resume to automatically extract and add all your skills at once — saves hours of manual entry!
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
