import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  FiHome, FiUser, FiFileText, FiTrendingUp, FiMap,
  FiSettings, FiLogOut, FiMenu, FiX, FiZap, FiBell,
  FiSearch, FiChevronLeft, FiChevronRight, FiMessageSquare,
  FiAward, FiBookOpen, FiHelpCircle, FiStar, FiCpu,
} from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'

/* ── Nav sections ─────────────────────────────────────────── */
const NAV_MAIN = [
  { path: '/dashboard',         icon: FiHome,          label: 'Dashboard',       badge: null },
  { path: '/profile',           icon: FiUser,          label: 'Profile',          badge: null },
  { path: '/resume/upload',     icon: FiFileText,      label: 'Resume',           badge: null },
]

const NAV_AI = [
  { path: '/recommendations',   icon: FiTrendingUp,    label: 'Recommendations',  badge: 'AI' },
  { path: '/roadmaps',          icon: FiMap,           label: 'Roadmaps',         badge: null },
  { path: '/roadmaps/advisor',  icon: FiMessageSquare, label: 'Career Advisor',   badge: 'AI' },
  { path: '/profile/skills',    icon: FiCpu,           label: 'Skills',           badge: null },
]

const NAV_BOTTOM = [
  { path: '/settings',          icon: FiSettings,      label: 'Settings',         badge: null },
]

const PAGE_TITLES = {
  '/dashboard':                'Dashboard',
  '/profile':                  'My Profile',
  '/profile/edit':             'Edit Profile',
  '/profile/skills':           'Skills',
  '/resume/upload':            'Upload Resume',
  '/recommendations':          'Recommendations',
  '/recommendations/careers':  'Career Suggestions',
  '/roadmaps':                 'My Roadmaps',
  '/roadmaps/advisor':         'Career Advisor',
  '/settings':                 'Settings',
}

/* ── Single nav item ──────────────────────────────────────── */
function NavItem({ item, collapsed, isActive, onClick, delay = '0s' }) {
  const { path, icon: Icon, label, badge } = item
  return (
    <Link
      to={path}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className="group relative flex items-center rounded-xl transition-all duration-200 font-medium text-sm overflow-hidden"
      style={{
        gap: collapsed ? 0 : '10px',
        padding: collapsed ? '10px 12px' : '10px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        animation: `slideInLeft 0.35s ease-out ${delay} both`,
        ...(isActive ? {
          background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(139,92,246,0.15))',
          border: '1px solid rgba(14,165,233,0.25)',
          boxShadow: '0 2px 16px rgba(14,165,233,0.15)',
          color: '#ffffff',
        } : {
          background: 'transparent',
          border: '1px solid transparent',
          color: '#94a3b8',
        }),
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
          e.currentTarget.style.color = '#ffffff'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#94a3b8'
          e.currentTarget.style.borderColor = 'transparent'
        }
      }}
    >
      {/* Active left bar */}
      {isActive && (
        <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-primary-400" />
      )}

      <Icon className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{ width: 17, height: 17 }} />

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
              style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.25)' }}>
              {badge}
            </span>
          )}
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse flex-shrink-0" />}
        </>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap z-50
          opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 translate-x-1 group-hover:translate-x-0"
          style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
          {label}
          {badge && <span className="ml-1.5 text-primary-400">[{badge}]</span>}
        </div>
      )}
    </Link>
  )
}

/* ── Section label ────────────────────────────────────────── */
function SectionLabel({ label, collapsed }) {
  if (collapsed) return <div className="my-1 mx-3 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] px-3 mb-2 mt-5"
      style={{ color: '#475569' }}>
      {label}
    </p>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN LAYOUT
═══════════════════════════════════════════════════════════ */
export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed,  setCollapsed]  = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const navigate   = useNavigate()
  const location   = useLocation()
  const { logout, user } = useAuthStore()

  /* Header shadow on scroll */
  useEffect(() => {
    const el = document.getElementById('main-scroll')
    if (!el) return
    const fn = () => setScrolled(el.scrollTop > 8)
    el.addEventListener('scroll', fn)
    return () => el.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard' || location.pathname === '/'
      : location.pathname.startsWith(path)

  const pageTitle = Object.entries(PAGE_TITLES)
    .reverse()
    .find(([p]) => location.pathname.startsWith(p))?.[1] || 'SkillSync AI'

  const sideW = collapsed ? 72 : 256

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">

      {/* Mobile overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 z-40 lg:hidden transition-all duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
      />

      {/* ════════════════════════════════════
          SIDEBAR — fixed, does NOT scroll
      ════════════════════════════════════ */}
      <aside
        className="fixed top-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0"
        style={{
          width: sideW,
          height: '100vh',         /* full viewport height, never scrolls */
          transform: mobileOpen ? 'translateX(0)' : undefined,
          background: 'linear-gradient(180deg, #060f1e 0%, #0b1a2e 40%, #07101d 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          ...(window.innerWidth < 1024 && !mobileOpen ? { transform: 'translateX(-100%)' } : {}),
        }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center h-16 flex-shrink-0 px-4"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-primary-500 blur-md opacity-40 animate-pulse-soft" />
              <div className="relative w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)' }}>
                <FiZap className="w-4 h-4 text-white" />
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-in">
                <p className="text-white font-extrabold text-sm leading-none tracking-tight">SkillSync</p>
                <p className="text-slate-500 text-[10px] mt-0.5 font-medium tracking-widest uppercase">AI Career</p>
              </div>
            )}
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-500 hover:text-white transition-colors p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Nav — overflows but sidebar itself is fixed ── */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden"
          style={{ padding: collapsed ? '16px 8px' : '16px 10px' }}>

          <SectionLabel label="Main" collapsed={collapsed} />
          {NAV_MAIN.map((item, i) => (
            <NavItem key={item.path} item={item} collapsed={collapsed}
              isActive={isActive(item.path)} onClick={() => setMobileOpen(false)}
              delay={`${i * 0.04}s`} />
          ))}

          <SectionLabel label="AI Features" collapsed={collapsed} />
          {NAV_AI.map((item, i) => (
            <NavItem key={item.path} item={item} collapsed={collapsed}
              isActive={isActive(item.path)} onClick={() => setMobileOpen(false)}
              delay={`${(NAV_MAIN.length + i) * 0.04}s`} />
          ))}

          <SectionLabel label="Account" collapsed={collapsed} />
          {NAV_BOTTOM.map((item, i) => (
            <NavItem key={item.path} item={item} collapsed={collapsed}
              isActive={isActive(item.path)} onClick={() => setMobileOpen(false)}
              delay={`${(NAV_MAIN.length + NAV_AI.length + i) * 0.04}s`} />
          ))}
        </nav>

        {/* ── Collapse toggle (desktop) ── */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="hidden lg:flex items-center justify-center mx-2 mb-2 h-9 rounded-xl transition-all duration-200 flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#64748b',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#64748b' }}
        >
          {collapsed
            ? <FiChevronRight className="w-4 h-4" />
            : <><FiChevronLeft className="w-4 h-4" /><span>Collapse</span></>
          }
        </button>

        {/* ── User card + Sign out ── */}
        <div className="flex-shrink-0 mx-2 mb-3 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {!collapsed ? (
            <div className="p-3">
              {/* Avatar + info */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 blur-sm opacity-40" />
                  <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                    {initials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                    style={{ borderColor: '#060f1e' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate leading-tight">{user?.full_name || 'User'}</p>
                  <p className="text-slate-500 text-[10px] truncate">{user?.email}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                    PRO
                  </span>
                </div>
              </div>

              {/* Sign out button — full width inside card */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.12)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.12)' }}
              >
                <FiLogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          ) : (
            /* Collapsed: just avatar + sign out icon */
            <div className="flex flex-col items-center gap-2 p-2">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-xs"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
                  style={{ borderColor: '#060f1e' }} />
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="w-full flex items-center justify-center p-2 rounded-xl transition-all duration-200"
                style={{ color: '#f87171' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: window.innerWidth >= 1024 ? sideW : 0 }}
      >
        {/* ── Top Bar ── */}
        <header
          className="sticky top-0 z-30 flex items-center h-16 px-4 md:px-6 gap-4 transition-all duration-200"
          style={{
            background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
            boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
          }}
        >
          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl transition-colors flex-shrink-0"
            style={{ color: '#64748b' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2">
            <FiZap className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-xs text-gray-400 font-medium">SkillSync</span>
            <span className="text-gray-300 text-xs">/</span>
            <span className="text-sm font-bold text-gray-800">{pageTitle}</span>
          </div>

          {/* Search */}
          <div
            className="hidden md:flex items-center gap-2 flex-1 max-w-xs ml-2 px-3.5 py-2 rounded-xl transition-all duration-200 group"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.background = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc' }}
          >
            <FiSearch className="text-gray-400 w-4 h-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search skills, roadmaps…"
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
            <kbd className="hidden lg:block text-[10px] text-gray-300 border border-gray-200 rounded px-1.5 font-mono">⌘K</kbd>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Bell */}
            <button className="relative p-2.5 rounded-xl transition-all duration-200 group"
              style={{ color: '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
            >
              <FiBell style={{ width: 18, height: 18 }} className="transition-transform group-hover:rotate-12 duration-300" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            </button>

            <div className="w-px h-6 bg-gray-200 mx-0.5" />

            {/* Profile */}
            <Link to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 group"
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0 transition-transform group-hover:scale-105 duration-200"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{user?.full_name?.split(' ')[0] || 'Profile'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Online</p>
              </div>
            </Link>
          </div>
        </header>

        {/* ── Page content — this scrolls, sidebar does not ── */}
        <main
          id="main-scroll"
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ padding: '24px 24px 40px' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
