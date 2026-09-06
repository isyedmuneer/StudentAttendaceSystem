import client from './client'

// ---- Auth ----
export const login = (username, password) => {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  return client.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
export const register = (payload) => client.post('/auth/register', payload)
export const getMe = () => client.get('/auth/me')

// ---- Students ----
export const listStudents = (params) => client.get('/students', { params })
export const getStudent = (id) => client.get(`/students/${id}`)
export const createStudent = (payload) => client.post('/students', payload)
export const updateStudent = (id, payload) => client.put(`/students/${id}`, payload)
export const deleteStudent = (id) => client.delete(`/students/${id}`)

// ---- Courses ----
export const listCourses = () => client.get('/courses')
export const getCourse = (id) => client.get(`/courses/${id}`)
export const createCourse = (payload) => client.post('/courses', payload)
export const updateCourse = (id, payload) => client.put(`/courses/${id}`, payload)
export const deleteCourse = (id) => client.delete(`/courses/${id}`)
export const listCourseStudents = (id) => client.get(`/courses/${id}/students`)
export const enrollStudent = (courseId, studentId) =>
  client.post(`/courses/${courseId}/enroll`, { student_id: studentId })
export const unenrollStudent = (courseId, studentId) =>
  client.delete(`/courses/${courseId}/enroll/${studentId}`)

// ---- Attendance ----
export const listAttendance = (params) => client.get('/attendance', { params })
export const getRoster = (courseId, date) =>
  client.get('/attendance/roster', { params: { course_id: courseId, date } })
export const markBulkAttendance = (payload) => client.post('/attendance/bulk', payload)
export const updateAttendance = (id, status) => client.put(`/attendance/${id}`, { status })
export const deleteAttendance = (id) => client.delete(`/attendance/${id}`)

// ---- Dashboard ----
export const getDashboardSummary = () => client.get('/dashboard/summary')
export const getCourseStats = () => client.get('/dashboard/courses')
export const getStudentStats = (studentId) => client.get(`/dashboard/student/${studentId}`)
