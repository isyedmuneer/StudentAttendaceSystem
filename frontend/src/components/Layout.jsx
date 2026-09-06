import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/students', label: 'Students' },
  { to: '/courses', label: 'Courses' },
  { to: '/attendance/take', label: 'Take Attendance' },
  { to: '/attendance/history', label: 'History' },
]

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-slate-100">
        <div className="px-6 py-5 text-lg font-semibold tracking-tight">
          Student Attendance
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 px-6 py-4 text-sm">
          <div className="font-medium">{user?.full_name}</div>
          <div className="text-slate-400">{user?.role}</div>
          <button
            onClick={signOut}
            className="mt-3 w-full rounded-md bg-slate-800 px-3 py-1.5 text-left text-sm text-slate-200 hover:bg-slate-700"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-100 p-8">
        <Outlet />
      </main>
    </div>
  )
}
