import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  FiZap, FiTarget, FiTrendingUp, FiMap, FiMessageSquare,
  FiFileText, FiStar, FiArrowDown, FiMail, FiGithub,
  FiTwitter, FiLinkedin, FiChevronUp,
} from 'react-icons/fi'

/* ── Floating particles background ── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(18)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width:  `${6 + (i % 4) * 6}px`,
            height: `${6 + (i % 4) * 6}px`,
            background: i % 3 === 0 ? '#0ea5e9' : i % 3 === 1 ? '#8b5cf6' : '#10b981',
            left:   `${(i * 17 + 5) % 90}%`,
            top:    `${(i * 23 + 10) % 85}%`,
            animation: `float ${4 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ── Feature card ── */
function FeatureCard({ icon: Icon, title, desc, color, delay }) {
  return (
    <div
      className="flex items-start gap-4 p-5 rounded-2xl border border-white/10 backdrop-blur-sm"
      style={{
        background: 'rgba(255,255,255,0.04)',
        animation: `slideUp 0.6s ease-out ${delay} both`,
      }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-white font-semibold text-sm mb-1">{title}</p>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

/* ── Stat pill ── */
function StatPill({ value, label }) {
  return (
    <div className="text-center px-6 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
    </div>
  )
}

export default function AuthLayout() {
  const [scrollY,    setScrollY]    = useState(0)
  const [showTop,    setShowTop]    = useState(false)
  const containerRef = useRef(null)
  const location = useLocation()

  const pageTitle = location.pathname === '/register'
    ? 'Create Account' : location.pathname === '/forgot-password'
    ? 'Reset Password' : location.pathname === '/reset-password'
    ? 'New Password' : 'Welcome Back'

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      setScrollY(el.scrollTop)
      setShowTop(el.scrollTop > 300)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })

  // Hero visible when scrollY < 80vh
  const heroVisible = scrollY < (window.innerHeight * 0.6)

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-auto overflow-x-hidden"
      style={{ scrollBehavior: 'smooth', background: '#020b18', overscrollBehavior: 'none' }}
    >

      {/* ════════════════════════════════════════
          SECTION 1 — HERO (sticky split layout)
      ════════════════════════════════════════ */}
      <section className="relative min-h-screen flex">

        {/* Left panel — description (hides on scroll) */}
        <div
          className="hidden lg:flex flex-col w-1/2 relative overflow-y-auto p-12 transition-all duration-700"
          style={{
            background: 'linear-gradient(160deg, #050e1f 0%, #0d1f3c 40%, #0a1628 100%)',
            opacity:    heroVisible ? 1 : 0,
            transform:  heroVisible ? 'translateX(0)' : 'translateX(-40px)',
            pointerEvents: heroVisible ? 'auto' : 'none',
          }}
        >
          <Particles />

          {/* Logo */}
          <div className="relative flex items-center gap-3 z-10" style={{ animation: 'slideInLeft 0.6s ease-out both' }}>
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-primary-500 blur-lg opacity-50" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
                <FiZap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-white font-extrabold text-lg">SkillSync AI</p>
              <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">Career Intelligence</p>
            </div>
          </div>

          {/* Headline */}
          <div className="relative z-10 space-y-6" style={{ animation: 'slideUp 0.7s ease-out 0.1s both' }}>
            <div>
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight">
                Build Your Dream
                <span className="block text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #38bdf8, #818cf8, #34d399)' }}>
                  Career with AI
                </span>
              </h1>
              <p className="text-slate-300 mt-4 text-base leading-relaxed">
                SkillSync AI analyzes your skills, identifies gaps, and creates personalized roadmaps to help you reach your career goals faster.
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-3">
              <FeatureCard icon={FiTarget}       title="Smart Skill Gap Analysis"      desc="AI compares your skills with your target role requirements" color="bg-primary-600"  delay="0.2s" />
              <FeatureCard icon={FiMap}          title="Personalized Learning Roadmaps" desc="Step-by-step paths generated specifically for your goals"    color="bg-violet-600"  delay="0.3s" />
              <FeatureCard icon={FiMessageSquare}title="AI Career Advisor Chat"         desc="Get real-time career guidance from your AI mentor"          color="bg-emerald-600" delay="0.4s" />
              <FeatureCard icon={FiFileText}     title="Resume Skill Extraction"        desc="Upload your CV and we auto-detect all your skills"          color="bg-amber-600"   delay="0.5s" />
            </div>

            {/* Stats — moved inside content block, below cards */}
            <div className="flex items-center gap-3 flex-wrap pt-2" style={{ animation: 'slideUp 0.7s ease-out 0.5s both' }}>
              <StatPill value="10K+"  label="Active Users"   />
              <StatPill value="500+"  label="Skills Tracked" />
              <StatPill value="98%"   label="Satisfaction"   />
            </div>
          </div>

          {/* Scroll hint */}
          <div className="relative z-10 flex flex-col items-center gap-1 mt-6 opacity-50"
            style={{ animation: 'bounce 2s infinite' }}>
            <p className="text-slate-400 text-xs">Scroll to explore</p>
            <FiArrowDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Right panel — form (always visible, sticky) */}
        <div
          className="flex-1 flex items-center justify-center p-6 relative transition-all duration-700 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f5f3ff 100%)',
          }}
        >
          {/* ── Animated orbs ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Large slow orb — top left */}
            <div style={{
              position: 'absolute', top: '-10%', left: '-10%',
              width: '55%', height: '55%', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)',
              animation: 'orbFloat1 8s ease-in-out infinite',
            }} />
            {/* Medium orb — bottom right */}
            <div style={{
              position: 'absolute', bottom: '-15%', right: '-10%',
              width: '60%', height: '60%', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
              animation: 'orbFloat2 10s ease-in-out infinite',
            }} />
            {/* Small orb — center right */}
            <div style={{
              position: 'absolute', top: '35%', right: '5%',
              width: '30%', height: '30%', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
              animation: 'orbFloat3 7s ease-in-out infinite',
            }} />
            {/* Tiny accent orb — top right */}
            <div style={{
              position: 'absolute', top: '10%', right: '15%',
              width: '18%', height: '18%', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)',
              animation: 'orbFloat1 5s ease-in-out 1s infinite',
            }} />

            {/* Grid dot pattern overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(14,165,233,0.08) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }} />
          </div>
          {/* Mobile logo */}
          <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
              <FiZap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">SkillSync AI</span>
          </div>

          <div className="w-full max-w-md" style={{ animation: 'scaleIn 0.5s ease-out both' }}>
            {/* Page title */}
            <div className="text-center mb-6 lg:hidden">
              <h2 className="text-2xl font-extrabold text-gray-900">{pageTitle}</h2>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100"
              style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)' }}>
              <Outlet />
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-5 flex-wrap">
              {['🔒 Secure', '⚡ AI Powered', '🚀 Free to start'].map(b => (
                <span key={b} className="text-xs text-gray-400 font-medium">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — FEATURES (full width)
      ════════════════════════════════════════ */}
      <section className="relative py-24 px-6" style={{ background: 'linear-gradient(180deg, #050e1f 0%, #0d1f3c 100%)' }}>
        <Particles />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16" style={{ animation: 'slideUp 0.6s ease-out both' }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-primary-400 uppercase tracking-widest mb-4"
              style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
              Why SkillSync AI?
            </span>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Everything you need to
              <span className="block text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #38bdf8, #818cf8)' }}>
                advance your career
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Our AI-powered platform gives you the tools, insights, and guidance to reach your career goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FiTarget,        color:'from-blue-500 to-cyan-500',    title:'Skill Gap Analysis',      desc:'Instantly know what skills you need to land your dream job. Our AI compares your profile with thousands of job requirements.' },
              { icon: FiTrendingUp,    color:'from-violet-500 to-purple-600',title:'Career Growth Tracking',  desc:'Monitor your progress over time. See how your skill set grows and track your journey toward your target role.' },
              { icon: FiMap,           color:'from-emerald-500 to-teal-600', title:'Personalized Roadmaps',   desc:'Get a step-by-step learning plan tailored to your current skills and target role. No generic advice.' },
              { icon: FiFileText,      color:'from-amber-500 to-orange-600', title:'Resume Intelligence',     desc:'Upload your CV and our AI extracts all your skills automatically. Save hours of manual profile setup.' },
              { icon: FiMessageSquare, color:'from-rose-500 to-pink-600',    title:'AI Career Chat',          desc:'Chat with your personal AI career advisor anytime. Get instant answers to your career questions.' },
              { icon: FiStar,          color:'from-cyan-500 to-blue-600',    title:'Smart Recommendations',   desc:'Receive personalized course, job, and skill recommendations based on your unique career profile.' },
            ].map(({ icon: Icon, color, title, desc }, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3 — HOW IT WORKS
      ════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">How it works</h2>
          <p className="text-gray-500 text-lg">Get started in under 5 minutes</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step:'01', title:'Create Account',    desc:'Sign up free in seconds',                  color:'bg-primary-600' },
            { step:'02', title:'Build Your Profile',desc:'Add skills or upload your resume',          color:'bg-violet-600' },
            { step:'03', title:'Get Your Analysis', desc:'AI identifies your skill gaps instantly',   color:'bg-emerald-600' },
            { step:'04', title:'Follow Your Path',  desc:'Execute your personalized roadmap',         color:'bg-amber-600' },
          ].map(({ step, title, desc, color }, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white font-extrabold text-lg mb-4`}>{step}</div>
              {i < 3 && <div className="hidden md:block absolute mt-7 ml-48 w-16 h-0.5 bg-gray-200" />}
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 — TESTIMONIALS
      ════════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #0d1f3c 0%, #050e1f 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-4">What our users say</h2>
            <p className="text-slate-400">Join thousands of professionals growing with SkillSync AI</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name:'Ahmed R.',     role:'Software Engineer',   text:'SkillSync helped me identify my exact skill gaps for a senior role. Got promoted in 4 months!',        stars:5 },
              { name:'Sarah K.',     role:'Product Manager',     text:'The AI roadmap feature is incredible. It gave me a clear path to transition from dev to PM.',           stars:5 },
              { name:'Muhammad T.',  role:'Data Scientist',      text:'Uploaded my resume and instantly saw all my skills mapped. The recommendations were spot on.',           stars:5 },
            ].map(({ name, role, text, stars }, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(stars)].map((_,j) => <FiStar key={j} className="w-4 h-4 text-amber-400 fill-current" style={{ fill:'#fbbf24' }} />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-slate-500 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer style={{ background: '#020b18', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: 0 }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
                  <FiZap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-extrabold">SkillSync AI</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                AI-powered career intelligence platform helping professionals reach their goals faster.
              </p>
              <div className="flex items-center gap-3">
                {[FiTwitter, FiLinkedin, FiGithub].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Product</p>
              <div className="space-y-2.5">
                {['Features','Roadmap','Changelog','Pricing'].map(l => (
                  <a key={l} href="#" className="block text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Company</p>
              <div className="space-y-2.5">
                {['About Us','Blog','Careers','Press Kit'].map(l => (
                  <a key={l} href="#" className="block text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">Contact</p>
              <div className="space-y-3">
                <a href="mailto:hello@skillsync.ai" className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                  <FiMail className="w-4 h-4" /> hello@skillsync.ai
                </a>
                <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.15)' }}>
                  <p className="text-xs text-primary-400 font-semibold mb-2">Get early access</p>
                  <div className="flex gap-2">
                    <input type="email" placeholder="your@email.com"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-primary-500 transition-colors" />
                    <button className="bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-shrink-0">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-xs">© 2025 SkillSync AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {['Privacy Policy','Terms of Service','Cookie Policy'].map(l => (
                <a key={l} href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Scroll to top button ── */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
          opacity: showTop ? 1 : 0,
          transform: showTop ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
          pointerEvents: showTop ? 'auto' : 'none',
          boxShadow: '0 4px 20px rgba(14,165,233,0.4)',
        }}
      >
        <FiChevronUp className="w-5 h-5" />
      </button>

    </div>
  )
}
