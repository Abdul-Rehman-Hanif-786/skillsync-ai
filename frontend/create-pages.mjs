import fs from 'fs'
import path from 'path'

const pages = [
  'src/pages/dashboard/Dashboard',
  'src/pages/profile/ProfileView',
  'src/pages/profile/ProfileEdit',
  'src/pages/profile/SkillsManagement',
  'src/pages/resume/ResumeUpload',
  'src/pages/resume/ResumeInsights',
  'src/pages/recommendations/RecommendationsList',
  'src/pages/recommendations/CareerSuggestions',
  'src/pages/roadmaps/MyRoadmaps',
  'src/pages/roadmaps/RoadmapDetail',
  'src/pages/roadmaps/CareerAdvisor',
  'src/pages/settings/Settings',
  'src/components/layout/MainLayout',
  'src/components/layout/AuthLayout',
]

pages.forEach(pagePath => {
  const componentName = pagePath.split('/').pop()
  const content = `export default function ${componentName}() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card">
        <h1 className="text-2xl font-bold">${componentName}</h1>
        <p className="text-gray-600">Page coming soon...</p>
      </div>
    </div>
  )
}
`
  
  fs.writeFileSync(pagePath + '.jsx', content)
  console.log(`✓ Created ${pagePath}.jsx`)
})

console.log('\n✅ All placeholder pages created!')
