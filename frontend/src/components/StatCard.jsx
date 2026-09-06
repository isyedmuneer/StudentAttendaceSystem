export default function StatCard({ label, value, accent = 'text-slate-900' }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${accent}`}>{value}</div>
    </div>
  )
}
