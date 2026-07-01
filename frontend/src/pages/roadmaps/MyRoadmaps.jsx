import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { roadmapService } from '../../services'
import { formatDate, getErrorMessage } from '../../utils'
import { FiMap, FiPlus, FiTrash2, FiChevronRight } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function MyRoadmaps() {
  const navigate = useNavigate()
  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [targetRole, setTargetRole] = useState('')

  useEffect(() => {
    loadRoadmaps()
  }, [])

  const loadRoadmaps = async () => {
    try {
      const res = await roadmapService.getAll()
      setRoadmaps(res.data || [])
    } catch {
      setRoadmaps([])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!targetRole.trim()) return
    setGenerating(true)
    try {
      const res = await roadmapService.generate({ target_role: targetRole })
      toast.success('Roadmap generated!')
      navigate(`/roadmaps/${res.data.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Delete this roadmap?')) return
    try {
      await roadmapService.delete(id)
      setRoadmaps((prev) => prev.filter((r) => r.id !== id))
      toast.success('Roadmap deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading roadmaps...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Roadmaps</h1>
        <Link to="/roadmaps/advisor" className="btn-secondary">
          Career Advisor
        </Link>
      </div>

      {/* Generate Form */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Generate New Roadmap</h2>
        <form onSubmit={handleGenerate} className="flex gap-3">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target role (e.g. Backend Engineer)"
            className="input-field flex-1"
          />
          <button type="submit" disabled={generating} className="btn-primary disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
            <FiPlus className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </div>

      {/* Roadmaps List */}
      {roadmaps.length === 0 ? (
        <div className="card text-center py-10">
          <FiMap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No roadmaps yet</h3>
          <p className="text-gray-500">Generate a learning roadmap for your target role above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {roadmaps.map((roadmap) => (
            <Link
              key={roadmap.id}
              to={`/roadmaps/${roadmap.id}`}
              className="card flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiMap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{roadmap.title || roadmap.target_role}</h3>
                  <p className="text-sm text-gray-500">{formatDate(roadmap.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(roadmap.id, e)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <FiChevronRight className="text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
