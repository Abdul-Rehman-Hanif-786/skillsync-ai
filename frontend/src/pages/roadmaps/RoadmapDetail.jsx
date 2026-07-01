import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { roadmapService } from '../../services'
import { formatDate } from '../../utils'
import { FiArrowLeft, FiCheckCircle, FiCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function RoadmapDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoadmap()
  }, [id])

  const loadRoadmap = async () => {
    try {
      const res = await roadmapService.getById(id)
      setRoadmap(res.data)
    } catch {
      toast.error('Roadmap not found')
      navigate('/roadmaps')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading roadmap...</div>
      </div>
    )
  }

  const steps = roadmap?.content?.steps || roadmap?.steps || []

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => navigate('/roadmaps')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <FiArrowLeft /> Back to Roadmaps
      </button>

      {/* Header */}
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900">{roadmap?.title || roadmap?.target_role}</h1>
        <p className="text-sm text-gray-500 mt-1">{formatDate(roadmap?.created_at)}</p>
        {roadmap?.content?.summary && (
          <p className="text-gray-700 mt-3">{roadmap.content.summary}</p>
        )}
      </div>

      {/* Steps */}
      {steps.length > 0 ? (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Learning Path</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <h3 className="font-semibold text-gray-900">{step.title || step.skill}</h3>
                  {step.description && (
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  )}
                  {step.duration && (
                    <p className="text-xs text-gray-400 mt-1">⏱ {step.duration}</p>
                  )}
                  {step.resources && step.resources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {step.resources.map((r, j) => (
                        <a
                          key={j}
                          href={r.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline"
                        >
                          📎 {r.name || r}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-10 text-gray-500">
          No steps available for this roadmap.
        </div>
      )}
    </div>
  )
}
