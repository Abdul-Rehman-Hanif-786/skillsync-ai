import { useState, useEffect } from 'react'
import { profileService, skillsService } from '../../services'
import { proficiencyColor, capitalize, getErrorMessage } from '../../utils'
import { PROFICIENCY_LEVELS } from '../../config'
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function SkillsManagement() {
  const [mySkills, setMySkills] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [addForm, setAddForm] = useState({ skill_id: null, proficiency: 'beginner', skill_name: '' })

  useEffect(() => {
    loadSkills()
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      searchSkills(searchQuery)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const loadSkills = async () => {
    try {
      const res = await profileService.get()
      setMySkills(res.data?.skills || [])
    } catch {
      setMySkills([])
    } finally {
      setLoading(false)
    }
  }

  const searchSkills = async (q) => {
    try {
      const res = await skillsService.search(q)
      setSearchResults(res.data || [])
    } catch {
      setSearchResults([])
    }
  }

  const handleSelectSkill = (skill) => {
    setAddForm({ skill_id: skill.id, proficiency: 'beginner', skill_name: skill.name })
    setSearchQuery(skill.name)
    setSearchResults([])
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!addForm.skill_id) {
      toast.error('Please select a skill from the suggestions')
      return
    }
    try {
      await profileService.addSkill({
        skill_id: addForm.skill_id,
        proficiency: addForm.proficiency,
      })
      toast.success(`${addForm.skill_name} added!`)
      setAddForm({ skill_id: null, proficiency: 'beginner', skill_name: '' })
      setSearchQuery('')
      loadSkills()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleRemoveSkill = async (skillId, skillName) => {
    try {
      await profileService.removeSkill(skillId)
      toast.success(`${skillName} removed`)
      loadSkills()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading skills...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>

      {/* Add Skill Form */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Add a Skill</h2>
        <form onSubmit={handleAddSkill} className="space-y-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setAddForm({ ...addForm, skill_id: null, skill_name: '' })
              }}
              className="input-field pl-10"
              placeholder="Search for a skill (e.g. Python, React)"
            />
            {/* Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSelectSkill(skill)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium">{skill.name}</span>
                    {skill.category && (
                      <span className="text-xs text-gray-500 ml-2">{skill.category}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Proficiency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency Level</label>
            <select
              value={addForm.proficiency}
              onChange={(e) => setAddForm({ ...addForm, proficiency: e.target.value })}
              className="input-field"
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Add Skill
          </button>
        </form>
      </div>

      {/* My Skills List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          My Skills
          <span className="ml-2 text-sm text-gray-500 font-normal">({mySkills.length})</span>
        </h2>

        {mySkills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No skills added yet. Search for a skill above to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {mySkills.map((userSkill) => (
              <div
                key={userSkill.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{userSkill.skill?.name || userSkill.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${proficiencyColor(userSkill.proficiency)}`}>
                    {userSkill.proficiency}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveSkill(userSkill.id, userSkill.skill?.name || userSkill.name)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove skill"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
