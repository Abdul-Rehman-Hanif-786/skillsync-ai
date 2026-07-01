import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { recommendationService } from '../../services'
import { formatDate, getErrorMessage } from '../../utils'
import { FiTrendingUp, FiTrash2, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function RecommendationsList() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      const res = await recommendationService.getAll()
      setRecommendations(res.data || [])
    } catch {
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await recommendationService.generate({})
      toast.success('Recommendations generated!')
      loadRecommendations()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await recommendationService.delete(id)
      toast.success('Removed')
      setRecommendations((prev) => prev.filter((r) => r.id !== id))
    } catch {
      toast.error('Failed to remove')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading recommendations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Recommendations</h1>
        <div className="flex gap-3">
          <Link to="/recommendations/careers" className="btn-secondary">
            Career Paths
          </Link>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="card text-center py-10">
          <FiTrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No recommendations yet</h3>
          <p className="text-gray-500 mb-4">Complete your profile and skills, then generate recommendations</p>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary disabled:opacity-50">
            {generating ? 'Generating...' : 'Generate Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="card flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full capitalize">
                    {rec.recommendation_type || 'skill'}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(rec.created_at)}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{rec.title || rec.content?.title || 'Recommendation'}</h3>
                <p className="text-sm text-gray-600 mt-1">{rec.description || rec.content?.description}</p>
              </div>
              <button
                onClick={() => handleDelete(rec.id)}
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
