import { useEffect, useState } from 'react'
import * as api from '../api'

const STATUS_BADGE = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
  excused: 'bg-blue-100 text-blue-700',
}

export default function AttendanceHistoryPage() {
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [filters, setFilters] = useState({ course_id: '', student_id: '', date_from: '', date_to: '' })
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.listCourses(), api.listStudents()]).then(([coursesRes, studentsRes]) => {
      setCourses(coursesRes.data)
      setStudents(studentsRes.data)
    })
  }, [])

  function load() {
    setLoading(true)
    setError('')
    const params = {}
    if (filters.course_id) params.course_id = filters.course_id
    if (filters.student_id) params.student_id = filters.student_id
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    api
      .listAttendance(params)
      .then((res) => setRecords(res.data))
      .catch(() => setError('Failed to load attendance history'))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]))
  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Attendance History</h1>
        <p className="text-sm text-slate-500">Filter and review past attendance records</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div>
          <label className="block text-xs font-medium text-slate-600">Course</label>
          <select
            className="mt-1 w-48 rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={filters.course_id}
            onChange={(e) => setFilters({ ...filters, course_id: e.target.value })}
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Student</label>
          <select
            className="mt-1 w-48 rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={filters.student_id}
            onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
          >
            <option value="">All students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">From</label>
          <input
            type="date"
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">To</label>
          <input
            type="date"
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          />
        </div>
        <button
          onClick={load}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Apply Filters
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
                <th className="px-5 py-2">Date</th>
                <th className="px-5 py-2">Student</th>
                <th className="px-5 py-2">Course</th>
                <th className="px-5 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-2">{r.date}</td>
                  <td className="px-5 py-2">
                    {studentMap[r.student_id]
                      ? `${studentMap[r.student_id].first_name} ${studentMap[r.student_id].last_name}`
                      : `#${r.student_id}`}
                  </td>
                  <td className="px-5 py-2">{courseMap[r.course_id]?.name ?? `#${r.course_id}`}</td>
                  <td className="px-5 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
