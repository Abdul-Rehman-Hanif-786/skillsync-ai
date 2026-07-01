import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeService } from '../../services'
import { getErrorMessage } from '../../utils'
import { FiUpload, FiFileText, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ResumeUpload() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') {
      toast.error('Only PDF files are supported')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await resumeService.upload(formData)
      toast.success('Resume uploaded successfully!')
      navigate(`/resume/${res.data.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Upload Resume</h1>
      <p className="text-gray-600">Upload your CV/resume in PDF format and we'll extract your skills automatically.</p>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-700 font-medium">Drag & drop your PDF here, or click to browse</p>
        <p className="text-sm text-gray-500 mt-1">Max 5MB · PDF only</p>
      </div>

      {/* Selected File */}
      {file && (
        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-100">
          <div className="flex items-center gap-3">
            <FiFileText className="w-6 h-6 text-primary-600" />
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null) }}
            className="p-1 hover:bg-white rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </div>
  )
}
