import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import * as api from '../api'
import StatCard from '../components/StatCard'

const STATUS_COLORS = {
  present: '#16a34a',
  absent: '#dc2626',
  late: '#d97706',
  excused: '#2563eb',
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)
  const [courseStats, setCourseStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getDashboardSummary(), api.getCourseStats()])
      .then(([summaryRes, coursesRes]) => {
        setSummary(summaryRes.data)
        setCourseStats(coursesRes.data)
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-slate-500">Loading dashboard…</div>
  if (error) return <div className="text-red-600">{error}</div>

  const todayPieData = [
    { name: 'Present', value: summary.today_present, key: 'present' },
    { name: 'Absent', value: summary.today_absent, key: 'absent' },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of students, courses and attendance</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Students" value={summary.total_students} />
        <StatCard label="Total Courses" value={summary.total_courses} />
        <StatCard label="Marked Today" value={summary.today_total_marked} />
        <StatCard
          label="Overall Attendance Rate"
          value={`${summary.overall_attendance_rate}%`}
          accent="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Attendance by Course
          </h2>
          {courseStats.length === 0 ? (
            <p className="text-sm text-slate-400">No attendance data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={courseStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="course_name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" stackId="a" fill={STATUS_COLORS.present} name="Present" />
                <Bar dataKey="absent" stackId="a" fill={STATUS_COLORS.absent} name="Absent" />
                <Bar dataKey="late" stackId="a" fill={STATUS_COLORS.late} name="Late" />
                <Bar dataKey="excused" stackId="a" fill={STATUS_COLORS.excused} name="Excused" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Today's Attendance</h2>
          {todayPieData.length === 0 ? (
            <p className="text-sm text-slate-400">No attendance marked today</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={todayPieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {todayPieData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
          Course Attendance Rates
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-2">Course</th>
              <th className="px-5 py-2">Present</th>
              <th className="px-5 py-2">Absent</th>
              <th className="px-5 py-2">Late</th>
              <th className="px-5 py-2">Excused</th>
              <th className="px-5 py-2">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courseStats.map((c) => (
              <tr key={c.course_id}>
                <td className="px-5 py-2 font-medium text-slate-800">{c.course_name}</td>
                <td className="px-5 py-2 text-emerald-600">{c.present}</td>
                <td className="px-5 py-2 text-red-600">{c.absent}</td>
                <td className="px-5 py-2 text-amber-600">{c.late}</td>
                <td className="px-5 py-2 text-blue-600">{c.excused}</td>
                <td className="px-5 py-2">{c.attendance_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
