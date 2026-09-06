import { useEffect, useState } from 'react'
import * as api from '../api'

const STATUSES = ['present', 'absent', 'late', 'excused']

const STATUS_STYLES = {
  present: 'bg-emerald-600 text-white',
  absent: 'bg-red-600 text-white',
  late: 'bg-amber-500 text-white',
  excused: 'bg-blue-600 text-white',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function TakeAttendancePage() {
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [date, setDate] = useState(today())
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.listCourses().then((res) => {
      setCourses(res.data)
      if (res.data.length > 0) setCourseId(String(res.data[0].id))
    })
  }, [])

  useEffect(() => {
    if (!courseId || !date) return
    setLoading(true)
    setMessage('')
    api
      .getRoster(courseId, date)
      .then((res) => setRoster(res.data))
      .catch(() => setError('Failed to load roster'))
      .finally(() => setLoading(false))
  }, [courseId, date])

  function setStatus(studentId, status) {
    setRoster((prev) =>
      prev.map((entry) => (entry.student_id === studentId ? { ...entry, status } : entry)),
    )
  }

  function markAll(status) {
    setRoster((prev) => prev.map((entry) => ({ ...entry, status })))
  }

  async function handleSave() {
    const entries = roster.filter((r) => r.status).map((r) => ({ student_id: r.student_id, status: r.status }))
    if (entries.length === 0) {
      setError('Mark at least one student before saving')
      return
    }
    setSaving(true)
    setError('')
    try {
      await api.markBulkAttendance({ course_id: Number(courseId), date, entries })
      setMessage('Attendance saved successfully')
    } catch {
      setError('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Take Attendance</h1>
        <p className="text-sm text-slate-500">Mark attendance for a course roster on a given date</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div>
          <label className="block text-xs font-medium text-slate-600">Course</label>
          <select
            className="mt-1 w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Date</label>
          <input
            type="date"
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => markAll(status)}
              className={`rounded-md px-3 py-2 text-xs font-medium capitalize ${STATUS_STYLES[status]} opacity-80 hover:opacity-100`}
            >
              Mark all {status}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-emerald-600">{message}</p>}

      {loading ? (
        <p className="text-slate-500">Loading roster…</p>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-2">Roll No.</th>
                <th className="px-5 py-2">Name</th>
                <th className="px-5 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roster.map((entry) => (
                <tr key={entry.student_id}>
                  <td className="px-5 py-2 font-medium text-slate-800">{entry.roll_number}</td>
                  <td className="px-5 py-2">
                    {entry.first_name} {entry.last_name}
                  </td>
                  <td className="px-5 py-2">
                    <div className="flex gap-1.5">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatus(entry.student_id, status)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-opacity ${
                            entry.status === status
                              ? STATUS_STYLES[status]
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {roster.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                    No students enrolled in this course
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {roster.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Attendance'}
        </button>
      )}
    </div>
  )
}
