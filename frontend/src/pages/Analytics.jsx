import { useEffect, useState } from 'react'
import AppLayout from '../components/Layout/AppLayout'
import { analyticsAPI } from '../services/api'
import { BarChart3, Users, TrendingUp, BookOpen, ChevronDown, ChevronRight } from 'lucide-react'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    analyticsAPI.allInstructors()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleInstructor = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) {
    return <AppLayout title="Analytics"><div className="text-center py-16 text-slate-400">Loading analytics...</div></AppLayout>
  }

  const instructors = data?.instructors || []
  const totalStudents = instructors.reduce((s, i) => s + i.total_students, 0)
  const totalParticipating = instructors.reduce((s, i) => s + i.total_participating, 0)
  const overallRate = totalStudents > 0 ? (totalParticipating / totalStudents * 100).toFixed(1) : '0.0'

  return (
    <AppLayout title="Participation Analytics">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total Instructors" value={instructors.length} icon={Users} color="text-indigo-600 bg-indigo-50" />
        <SummaryCard label="Total Students" value={totalStudents} icon={Users} color="text-cyan-600 bg-cyan-50" />
        <SummaryCard label="Participating Students" value={totalParticipating} icon={TrendingUp} color="text-emerald-600 bg-emerald-50" />
        <SummaryCard label="Overall Participation" value={`${overallRate}%`} icon={BarChart3} color="text-violet-600 bg-violet-50" />
      </div>

      {/* Instructors table */}
      {instructors.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <BarChart3 size={40} className="mx-auto mb-3 opacity-30" />
          <p>No analytics data yet</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {instructors.map((instructor) => (
            <div key={instructor.instructor_id}>
              <button
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                onClick={() => toggleInstructor(instructor.instructor_id)}
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{instructor.instructor_name}</p>
                  <p className="text-sm text-slate-500">{instructor.instructor_email}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <Metric label="Lectures" value={instructor.lectures.length} />
                  <Metric label="Students" value={instructor.total_students} />
                  <Metric label="Participating" value={instructor.total_participating} />
                  <div>
                    <p className="text-xs text-slate-400">Rate</p>
                    <p className="font-bold text-lg">
                      <ParticipationRate rate={instructor.overall_participation_rate} />
                    </p>
                  </div>
                </div>
                {expanded[instructor.instructor_id]
                  ? <ChevronDown size={16} className="text-slate-400" />
                  : <ChevronRight size={16} className="text-slate-400" />
                }
              </button>

              {expanded[instructor.instructor_id] && instructor.lectures.length > 0 && (
                <div className="bg-slate-50 border-t border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase tracking-wide">
                        <th className="text-left px-6 py-2">Lecture</th>
                        <th className="text-right px-4 py-2">Students</th>
                        <th className="text-right px-4 py-2">Participating</th>
                        <th className="text-right px-4 py-2">Assignments</th>
                        <th className="text-right px-4 py-2">Submissions</th>
                        <th className="text-right px-6 py-2">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {instructor.lectures.map((lec) => (
                        <tr key={lec.lecture_id} className="hover:bg-white">
                          <td className="px-6 py-3 font-medium text-slate-800">{lec.lecture_title}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{lec.total_students}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{lec.participating_students}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{lec.total_assignments_generated}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{lec.total_submissions}</td>
                          <td className="px-6 py-3 text-right font-bold">
                            <ParticipationRate rate={lec.participation_rate} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-5">
      <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function ParticipationRate({ rate }) {
  const pct = (rate * 100).toFixed(1)
  const color = rate >= 0.7 ? 'text-emerald-600' : rate >= 0.4 ? 'text-amber-600' : 'text-red-500'
  return <span className={color}>{pct}%</span>
}
