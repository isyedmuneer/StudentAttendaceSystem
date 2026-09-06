import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api'
import Modal from '../components/Modal'

const emptyForm = { name: '', code: '', description: '' }

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  function load() {
    setLoading(true)
    api
      .listCourses()
      .then((res) => setCourses(res.data))
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(course) {
    setEditingId(course.id)
    setForm({ name: course.name, code: course.code, description: course.description ?? '' })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    const payload = { ...form, description: form.description || null }
    try {
      if (editingId) {
        await api.updateCourse(editingId, payload)
      } else {
        await api.createCourse(payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.detail ?? 'Save failed')
    }
  }

  async function handleDelete(course) {
    if (!confirm(`Delete ${course.name}?`)) return
    await api.deleteCourse(course.id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Courses</h1>
          <p className="text-sm text-slate-500">Manage courses and enrollment</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Course
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/courses/${c.id}`} className="font-semibold text-slate-800 hover:underline">
                    {c.name}
                  </Link>
                  <div className="text-xs text-slate-400">{c.code}</div>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {c.student_count} students
                </span>
              </div>
              {c.description && <p className="mt-2 text-sm text-slate-500">{c.description}</p>}
              <div className="mt-3 text-xs text-slate-400">
                Teacher: {c.teacher?.full_name ?? 'Unassigned'}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => openEdit(c)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && <p className="text-slate-400">No courses yet</p>}
        </div>
      )}

      {modalOpen && (
        <Modal title={editingId ? 'Edit Course' : 'Add Course'} onClose={() => setModalOpen(false)}>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-600">Name</label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Code</label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Description</label>
              <textarea
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
