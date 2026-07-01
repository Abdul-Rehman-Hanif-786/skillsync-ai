// App-wide configuration constants

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const APP_NAME = 'SkillSync AI'

export const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
]

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (2-5 years)' },
  { value: 'senior', label: 'Senior Level (5-10 years)' },
  { value: 'lead', label: 'Lead / Principal (10+ years)' },
]

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  SKILLS: '/profile/skills',
  RESUME_UPLOAD: '/resume/upload',
  RECOMMENDATIONS: '/recommendations',
  CAREER_SUGGESTIONS: '/recommendations/careers',
  ROADMAPS: '/roadmaps',
  CAREER_ADVISOR: '/roadmaps/advisor',
  SETTINGS: '/settings',
}
