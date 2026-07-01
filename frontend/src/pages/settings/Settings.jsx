import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FiLogOut, FiUser, FiShield, FiBell, FiEdit,
  FiMail, FiLock, FiGlobe, FiMoon, FiSun,
  FiCheck, FiChevronRight, FiZap, FiMap,
  FiTrendingUp, FiFileText, FiCpu, FiInfo,
  FiGithub, FiLinkedin, FiAlertCircle,
} from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

/* ── Section wrapper ── */
function Section({ icon, color, title, children, delay = '0s' }) {
  return (
    <div className="card animate-slide-up" style={{ animationDelay: delay }}>
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}

/* ── Setting row ── */
function SettingRow({ label, value, action, actionLabel, actionColor = 'text-primary-600 hover:text-primary-700', border = true }) {
  return (
    <div className={`flex items-center justify-between py-3 ${border ? 'border-b border-gray-50' : ''}`}>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {value && <p className="text-xs text-gray-400 mt-0.5">{value}</p>}
      </div>
      {action && (
        <button onClick={action} className={`text-xs font-semibold transition-colors ${actionColor}`}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

/* ── Toggle ── */
function Toggle({ enabled, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
          enabled ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [notifications, setNotifications] = useState({
    email:    true,
    browser:  false,
    weeklyReport: true,
    skillAlerts: true,
  })
  const [appearance, setAppearance] = useState({
    compactMode: false,
    animations:  true,
  })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Signed out successfully')
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'U'

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══════════════════════════════════
            LEFT — settings (2/3)
        ══════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage your account and preferences</p>
          </div>

          {/* Profile card */}
          <div className="rounded-3xl overflow-hidden border border-gray-100 animate-slide-up"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.07)' }}>
            <div className="h-20" style={{ background: 'linear-gradient(135deg,#0a1628,#0d1f3c)' }}>
              {[...Array(5)].map((_,i) => (
                <div key={i} className="absolute rounded-full opacity-15" style={{
                  width:`${6+(i%3)*5}px`, height:`${6+(i%3)*5}px`,
                  background:i%2===0?'#38bdf8':'#818cf8',
                  left:`${(i*22+5)%85}%`, top:`${(i*28+8)%65}%`,
                  animation:`float ${4+(i%3)}s ease-in-out ${i*0.3}s infinite`,
                }} />
              ))}
            </div>
            <div className="bg-white px-6 pb-5 flex items-end gap-4 -mt-8">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl border-4 border-white"
                  style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', boxShadow: '0 4px 16px rgba(14,165,233,0.3)' }}>
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-4 border-white" />
              </div>
              <div className="flex-1 pt-9">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-gray-900">{user?.full_name || 'Your Name'}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <Link to="/profile/edit"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-primary-600 border border-primary-200 hover:bg-primary-50 transition-all">
                    <FiEdit className="w-3.5 h-3.5" /> Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Account info */}
          <Section
            icon={<FiUser className="w-4 h-4 text-white" />}
            color="bg-primary-600"
            title="Account Information"
            delay="0.05s"
          >
            <div className="space-y-1">
              <SettingRow label="Full Name"  value={user?.full_name || '—'} action={() => navigate('/profile/edit')} actionLabel="Edit" />
              <SettingRow label="Email"       value={user?.email || '—'}     action={() => toast('Contact support to change email', { icon: 'ℹ️' })} actionLabel="Change" />
              <SettingRow label="Password"    value="Last changed recently"  action={() => navigate('/forgot-password')} actionLabel="Reset" actionColor="text-violet-600 hover:text-violet-700" border={false} />
            </div>
          </Section>

          {/* Notifications */}
          <Section
            icon={<FiBell className="w-4 h-4 text-white" />}
            color="bg-violet-600"
            title="Notifications"
            delay="0.10s"
          >
            <div className="space-y-1">
              <Toggle label="Email Notifications" desc="Receive updates via email"
                enabled={notifications.email} onChange={v => { setNotifications(n=>({...n,email:v})); toast.success(v?'Email notifications on':'Email notifications off') }} />
              <Toggle label="Browser Notifications" desc="Push notifications in browser"
                enabled={notifications.browser} onChange={v => { setNotifications(n=>({...n,browser:v})); toast.success(v?'Browser notifications on':'Turned off') }} />
              <Toggle label="Weekly Progress Report" desc="Summary of your career progress"
                enabled={notifications.weeklyReport} onChange={v => setNotifications(n=>({...n,weeklyReport:v}))} />
              <Toggle label="Skill Gap Alerts" desc="When new skill gaps are detected"
                enabled={notifications.skillAlerts} onChange={v => setNotifications(n=>({...n,skillAlerts:v}))} />
            </div>
          </Section>

          {/* Appearance */}
          <Section
            icon={<FiSun className="w-4 h-4 text-white" />}
            color="bg-amber-500"
            title="Appearance"
            delay="0.15s"
          >
            <div className="space-y-1">
              <Toggle label="Compact Mode" desc="Reduce spacing for more content"
                enabled={appearance.compactMode} onChange={v => setAppearance(a=>({...a,compactMode:v}))} />
              <Toggle label="Animations" desc="Enable page transitions and effects"
                enabled={appearance.animations} onChange={v => setAppearance(a=>({...a,animations:v}))} />
            </div>
          </Section>

          {/* Privacy */}
          <Section
            icon={<FiShield className="w-4 h-4 text-white" />}
            color="bg-emerald-600"
            title="Privacy & Security"
            delay="0.20s"
          >
            <div className="space-y-1">
              <SettingRow label="Profile Visibility" value="Only you can see your profile"
                action={() => toast('Profile is private by default', { icon: '🔒' })} actionLabel="Manage" />
              <SettingRow label="Data Export" value="Download all your data"
                action={() => toast.success('Data export coming soon!')} actionLabel="Export" />
              <SettingRow label="Two-Factor Auth" value="Not enabled"
                action={() => toast('2FA coming soon!', { icon: '🔐' })} actionLabel="Enable"
                actionColor="text-emerald-600 hover:text-emerald-700" border={false} />
            </div>
          </Section>

          {/* Danger zone */}
          <div className="card border border-red-100 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-red-50">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
                <FiAlertCircle className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-bold text-red-700 text-sm">Danger Zone</h2>
            </div>

            {!showLogoutConfirm ? (
              <button onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all">
                <FiLogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 animate-scale-in">
                <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium flex-1">Are you sure you want to sign out?</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowLogoutConfirm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-white transition-all">
                    Cancel
                  </button>
                  <button onClick={handleLogout}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════
            RIGHT — info panel (1/3) sticky
        ══════════════════════════════════ */}
        <div className="animate-slide-up stagger-2">
          <div className="card sticky top-24 space-y-5">

            {/* Account status */}
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-4">Account Status</h3>
              <div className="space-y-2.5">
                {[
                  { label:'Plan',         value:'Free',     icon:'🎯', color:'text-primary-600 bg-primary-50' },
                  { label:'Status',       value:'Active',   icon:'✅', color:'text-emerald-600 bg-emerald-50' },
                  { label:'Member Since', value:'2025',     icon:'📅', color:'text-violet-600 bg-violet-50'   },
                  { label:'AI Credits',   value:'Unlimited',icon:'⚡', color:'text-amber-600 bg-amber-50'     },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className={`flex items-center justify-between p-3 rounded-xl ${color.split(' ')[1]}`}>
                    <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                      <span>{icon}</span>{label}
                    </span>
                    <span className={`text-xs font-extrabold ${color.split(' ')[0]}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick navigation */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Quick Navigation</h3>
              <div className="space-y-2">
                {[
                  { label:'Edit Profile',    icon:FiUser,       to:'/profile/edit',            color:'text-primary-600 bg-primary-50 hover:bg-primary-100' },
                  { label:'Manage Skills',   icon:FiCpu,        to:'/profile/skills',          color:'text-violet-600 bg-violet-50 hover:bg-violet-100'   },
                  { label:'Career Advisor',  icon:FiZap,        to:'/roadmaps/advisor',        color:'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
                  { label:'My Roadmaps',     icon:FiMap,        to:'/roadmaps',                color:'text-amber-600 bg-amber-50 hover:bg-amber-100'      },
                  { label:'Recommendations', icon:FiTrendingUp, to:'/recommendations',         color:'text-rose-600 bg-rose-50 hover:bg-rose-100'         },
                ].map(({ label, icon: Icon, to, color }) => (
                  <Link key={to} to={to}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${color}`}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />{label}
                    <FiChevronRight className="w-3 h-3 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* App info */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3">App Info</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Version</span>
                  <span className="font-semibold text-gray-700">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Model</span>
                  <span className="font-semibold text-gray-700">Groq LLaMA</span>
                </div>
                <div className="flex justify-between">
                  <span>Backend</span>
                  <span className="font-semibold text-gray-700">FastAPI</span>
                </div>
                <div className="flex justify-between">
                  <span>Database</span>
                  <span className="font-semibold text-gray-700">PostgreSQL</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="border-t border-gray-100 pt-4">
              <div className="p-3.5 rounded-2xl border border-primary-100"
                style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.07),rgba(139,92,246,0.04))' }}>
                <p className="text-xs font-bold text-primary-700 mb-1 flex items-center gap-1.5">
                  <FiInfo className="w-3 h-3" /> Need Help?
                </p>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  Use the Career Advisor AI to get instant help with career questions.
                </p>
                <Link to="/roadmaps/advisor"
                  className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                  Open Career Advisor <FiChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
