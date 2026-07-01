import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeService } from '../../services'
import { formatDate, proficiencyColor } from '../../utils'
import { FiFileText, FiTrash2, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ResumeInsights() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResume()
  }, [id])

  const loadResume = async () => {
    try {
      const res = await resumeService.getById(id)
      setResume(res.data)
    } catch {
      toast.error('Resume not found')
      navigate('/resume/upload')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this resume?')) return
    try {
      await resumeService.delete(id)
      toast.success('Resume deleted')
      navigate('/resume/upload')
    } catch {
      toast.error('Failed to delete resume')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading resume insights...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <FiArrowLeft /> Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiFileText className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{resume?.filename || 'Resume'}</h1>
            <p className="text-sm text-gray-500">{formatDate(resume?.created_at)}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <FiTrash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* Extracted Skills */}
      {resume?.parsed_data?.skills?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Extracted Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resume.parsed_data.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Parsed Content */}
      {resume?.parsed_data?.text && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Parsed Content</h2>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            {resume.parsed_data.text}
          </pre>
        </div>
      )}

      {!resume?.parsed_data && (
        <div className="card text-center py-10 text-gray-500">
          No insights extracted from this resume yet.
        </div>
      )}
    </div>
  )
}
