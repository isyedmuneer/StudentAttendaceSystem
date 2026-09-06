import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../api'

export default function CourseDetailPage() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [enrolled, setEnrolled] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [error, setError] = useState('')

  function load() {
    Promise.all([api.getCourse(id), api.listCourseStudents(id), api.listStudents()])
      .then(([courseRes, enrolledRes, studentsRes]) => {
        setCourse(courseRes.data)
        setEnrolled(enrolledRes.data)
        setAllStudents(studentsRes.data)
      })
      .catch(() => setError('Failed to load course'))
  }

  useEffect(load, [id])

  const availableStudents = allStudents.filter((s) => !enrolled.some((e) => e.id === s.id))

  async function handleEnroll(e) {
    e.preventDefault()
    if (!selectedStudent) return
    await api.enrollStudent(id, Number(selectedStudent))
    setSelectedStudent('')
    load()
  }

  async function handleUnenroll(studentId) {
    await api.unenrollStudent(id, studentId)
    load()
  }

  if (error) return <div className="text-red-600">{error}</div>
  if (!course) return <div className="text-slate-500">Loading…</div>

  return (
    <div className="space-y-6">
      <div>
        <Link to="/courses" className="text-sm text-slate-500 hover:underline">
          ← Back to courses
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-800">{course.name}</h1>
        <p className="text-sm text-slate-500">
          {course.code} · Teacher: {course.teacher?.full_name ?? 'Unassigned'}
        </p>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Enroll a student</h2>
        <form className="flex gap-2" onSubmit={handleEnroll}>
          <select
            className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Select student…</option>
            {availableStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name} ({s.roll_number})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Enroll
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
          Enrolled Students ({enrolled.length})
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-2">Roll No.</th>
              <th className="px-5 py-2">Name</th>
              <th className="px-5 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enrolled.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-2 font-medium text-slate-800">{s.roll_number}</td>
                <td className="px-5 py-2">
                  {s.first_name} {s.last_name}
                </td>
                <td className="px-5 py-2 text-right">
                  <button
                    onClick={() => handleUnenroll(s.id)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {enrolled.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-400">
                  No students enrolled yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
