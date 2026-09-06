import { useEffect, useState } from 'react'
import * as api from '../api'
import Modal from '../components/Modal'

const emptyForm = { first_name: '', last_name: '', roll_number: '', email: '', phone: '' }

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  function load(searchTerm = search) {
    setLoading(true)
    api
      .listStudents(searchTerm ? { search: searchTerm } : {})
      .then((res) => setStudents(res.data))
      .catch(() => setError('Failed to load students'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(student) {
    setEditingId(student.id)
    setForm({
      first_name: student.first_name,
      last_name: student.last_name,
      roll_number: student.roll_number,
      email: student.email ?? '',
      phone: student.phone ?? '',
    })
    setFormError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    const payload = { ...form, email: form.email || null, phone: form.phone || null }
    try {
      if (editingId) {
        await api.updateStudent(editingId, payload)
      } else {
        await api.createStudent(payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setFormError(err.response?.data?.detail ?? 'Save failed')
    }
  }

  async function handleDelete(student) {
    if (!confirm(`Delete ${student.first_name} ${student.last_name}?`)) return
    await api.deleteStudent(student.id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500">Manage student records</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Student
        </button>
      </div>

      <div className="flex gap-2">
        <input
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          placeholder="Search by name or roll number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button
          onClick={() => load()}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-2">Roll No.</th>
                <th className="px-5 py-2">Name</th>
                <th className="px-5 py-2">Email</th>
                <th className="px-5 py-2">Phone</th>
                <th className="px-5 py-2">Status</th>
                <th className="px-5 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-2 font-medium text-slate-800">{s.roll_number}</td>
                  <td className="px-5 py-2">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="px-5 py-2 text-slate-500">{s.email ?? '—'}</td>
                  <td className="px-5 py-2 text-slate-500">{s.phone ?? '—'}</td>
                  <td className="px-5 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="space-x-3 px-5 py-2 text-right">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title={editingId ? 'Edit Student' : 'Add Student'} onClose={() => setModalOpen(false)}>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">First name</label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Last name</label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Roll number</label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                value={form.roll_number}
                onChange={(e) => setForm({ ...form, roll_number: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Phone</label>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
