import { useState, useEffect } from 'react'
import { recommendationService } from '../../services'
import { getErrorMessage } from '../../utils'
import { FiBriefcase, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function CareerSuggestions() {
  const [suggestions, setSuggestions] = useState([])
  const [skillGap, setSkillGap] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      const res = await recommendationService.getCareerSuggestions()
      setSuggestions(res.data || [])
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSkillGapAnalysis = async (e) => {
    e.preventDefault()
    if (!targetRole.trim()) return
    setAnalyzing(true)
    try {
      const res = await recommendationService.getSkillGap(targetRole)
      setSkillGap(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading career suggestions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900">Career Suggestions</h1>

      {/* Skill Gap Analysis */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Skill Gap Analysis</h2>
        <form onSubmit={handleSkillGapAnalysis} className="flex gap-3">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Enter target role (e.g. Data Scientist)"
            className="input-field flex-1"
          />
          <button type="submit" disabled={analyzing} className="btn-primary disabled:opacity-50 whitespace-nowrap">
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>

        {skillGap && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Match Score</span>
              <span className="text-2xl font-bold text-primary-600">{skillGap.match_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${skillGap.match_percentage}%` }}
              />
            </div>

            {skillGap.matched_skills?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-green-700 flex items-center gap-1 mb-2">
                  <FiCheckCircle /> Matched Skills ({skillGap.matched_skills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillGap.matched_skills.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {skillGap.missing_skills?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-orange-700 flex items-center gap-1 mb-2">
                  <FiAlertCircle /> Skills to Learn ({skillGap.missing_skills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillGap.missing_skills.map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 text-sm rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Career Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Suggested Career Paths</h2>
          {suggestions.map((s, i) => (
            <div key={i} className="card flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FiBriefcase className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{s.role || s.title}</h3>
                {s.description && <p className="text-sm text-gray-600 mt-1">{s.description}</p>}
                {s.match_score != null && (
                  <p className="text-sm text-primary-600 mt-2">{s.match_score}% match</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
