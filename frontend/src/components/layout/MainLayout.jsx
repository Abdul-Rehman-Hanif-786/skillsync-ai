import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  FiHome, FiUser, FiFileText, FiTrendingUp, FiMap,
  FiSettings, FiLogOut, FiMenu, FiX, FiZap, FiBell,
  FiSearch, FiChevronLeft, FiChevronRight, FiMessageSquare,
} from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { path: '/dashboard',           icon: FiHome,         label: 'Dashboard',       badge: null },
  { path: '/profile',             icon: FiUser,         label: 'Profile',          badge: null },
  { path: '/resume/upload',       icon: FiFileText,     label: 'Resume',           badge: null },
  { path: '/recommendations',     icon: FiTrendingUp,   label: 'Recommendations',  badge: 'AI' },
  { path: '/roadmaps',            icon: FiMap,          label: 'Roadmaps',         badge: null },
  { path: '/roadmaps/advisor',    icon: FiMessageSquare,label: 'Career Advisor',   badge: 'AI' },
  { path: '/settings',            icon: FiSettings,     label: 'Settings',         badge: null },
]

// Page titles for breadcrumb
const PAGE_TITLES = {
  '/dashboard':         'Dashboard',
  '/profile':           'My Profile',
  '/profile/edit':      'Edit Profile',
  '/profile/skills':    'Skills',
  '/resume/upload':     'Upload Resume',
  '/recommendations':   'Recommendations',
  '/recommendations/careers': 'Career Suggestions',
  '/roadmaps':          'My Roadmaps',
  '/roadmaps/advisor':  'Career Advisor',
  '/settings':          'Settings',
}

function NavItem({ item, collapsed, isActive, onClick }) {
  const { path, icon: Icon, label, badge } = item

  return (
    <Link
      to={path}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
        group relative flex items-center gap-3 rounded-xl
        transition-all duration-200 font-medium text-sm
        ${collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5'}
        ${isActive ? 'sidebar-link-active' : 'sidebar-link'}
      `}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" />

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary-500/30 text-primary-300 border border-primary-500/30">
              {badge}
            </span>
          )}
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse-soft flex-shrink-0" />
          )}
        </>
      )}

      {/* Collapsed tooltip */}
      {collapsed && (
        <span className="
          tooltip -right-2 translate-x-full top-1/2 -translate-y-1/2
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150
        ">
          {label}
          {badge && <span className="ml-1 text-primary-300">[{badge}]</span>}
        </span>
      )}
    </Link>
  )
}

export default function MainLayout() {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [collapsed, setCollapsed]     = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const navigate    = useNavigate()
  const location    = useLocation()
  const { logout, user } = useAuthStore()

  // Header shadow on scroll
  useEffect(() => {
    const main = document.getElementById('main-scroll')
    if (!main) return
    const onScroll = () => setScrolled(main.scrollTop > 8)
    main.addEventListener('scroll', onScroll)
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const pageTitle = Object.entries(PAGE_TITLES)
    .reverse()
    .find(([p]) => location.pathname.startsWith(p))?.[1] || 'SkillSync AI'

  const sidebarW = collapsed ? 'w-[72px]' : 'w-64'

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">

      {/* ── Mobile overlay ── */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden
          transition-opacity duration-300
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setMobileOpen(false)}
      />

      {/* ══════════════════════════════════
          SIDEBAR
      ══════════════════════════════════ */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarW}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0a1628 0%, #0f1f3d 40%, #0a1628 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* ── Logo ── */}
        <div className={`
          flex items-center justify-between h-16 border-b border-white/[0.07]
          ${collapsed ? 'px-3' : 'px-5'}
        `}>
          <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'justify-center w-full' : ''}`}>
            {/* Logo icon with glow */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-primary-500 blur-md opacity-40" />
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <FiZap className="w-4 h-4 text-white" />
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0 animate-fade-in">
                <p className="text-white font-bold text-sm leading-none">SkillSync</p>
                <p className="text-slate-500 text-[10px] mt-0.5 font-medium tracking-wide uppercase">
                  AI Career
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-500 hover:text-white transition-colors p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {/* Section label */}
          {!collapsed && (
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3">
              Main Menu
            </p>
          )}

          {NAV.map((item, i) => {
            const isActive = item.path === '/dashboard'
              ? location.pathname === '/dashboard' || location.pathname === '/'
              : location.pathname.startsWith(item.path)

            return (
              <div
                key={item.path}
                className="animate-slide-in-left"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <NavItem
                  item={item}
                  collapsed={collapsed}
                  isActive={isActive}
                  onClick={() => setMobileOpen(false)}
                />
              </div>
            )
          })}
        </nav>

        {/* ── Collapse toggle (desktop) ── */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="
            hidden lg:flex items-center justify-center mx-3 mb-3
            h-8 rounded-xl text-slate-500 hover:text-white
            transition-all duration-200 text-xs font-medium gap-2
          "
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {collapsed
            ? <FiChevronRight className="w-4 h-4" />
            : <><FiChevronLeft className="w-4 h-4" /><span>Collapse</span></>
          }
        </button>

        {/* ── User card ── */}
        <div className={`border-t border-white/[0.07] ${collapsed ? 'px-2 py-3' : 'px-3 py-4'}`}>
          {collapsed ? (
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-red-400 hover:text-red-300 transition-colors"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          ) : (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 p-2.5 rounded-xl mb-2"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                {/* Avatar with ring */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 blur-sm opacity-50" />
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {initials}
                  </div>
                  {/* Online dot */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate leading-tight">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 transition-all duration-200 text-sm font-medium"
                style={{ background: 'rgba(239,68,68,0)', ':hover': { background: 'rgba(239,68,68,0.1)' } }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FiLogOut className="w-4 h-4 flex-shrink-0" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top Bar ── */}
        <header
          className={`
            bg-white/80 backdrop-blur-md sticky top-0 z-30 h-16
            flex items-center px-4 md:px-6 gap-4
            transition-shadow duration-200
            ${scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-transparent'}
          `}
        >
          {/* Mobile menu btn */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
          >
            <FiMenu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">SkillSync</span>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-800">{pageTitle}</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-gray-200/80 rounded-xl px-3.5 py-2 flex-1 max-w-xs ml-2 group transition-all duration-200 focus-within:border-primary-300 focus-within:bg-white">
            <FiSearch className="text-gray-400 w-4 h-4 flex-shrink-0 transition-colors group-focus-within:text-primary-500" />
            <input
              type="text"
              placeholder="Search skills, roadmaps…"
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
            <kbd className="hidden lg:block text-[10px] text-gray-300 border border-gray-200 rounded px-1 font-mono">⌘K</kbd>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Notification bell */}
            <button className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-all duration-200 group">
              <FiBell className="w-4.5 h-4.5 transition-transform group-hover:rotate-12 duration-300" style={{width:'18px',height:'18px'}} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Profile */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">
                  {user?.full_name?.split(' ')[0] || 'Profile'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Online</p>
              </div>
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          id="main-scroll"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
