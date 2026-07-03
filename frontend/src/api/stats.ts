import api from './index'

export interface StudentStats {
  totalCases: number
  totalSims: number
  totalReports: number
  gradedReports: number
  pendingReports: number
  totalClasses: number
  totalExperiments: number
  simulatedCases: number
  myClasses: { id: number; name: string }[]
  recentExperiments: {
    id: number
    title: string
    status: string
    caseTitle: string
    className: string
    teacherName: string
    startDate: string
    endDate: string
  }[]
  recentSims: {
    id: number
    caseId: number
    caseTitle: string
    createdAt: string
    results: string
  }[]
  recentReports: {
    id: number
    caseId: number
    caseTitle: string
    score: number | null
    status: string
    createdAt: string
  }[]
}

export interface TeacherStats {
  totalClasses: number
  totalStudents: number
  totalExperiments: number
  totalSubmissions: number
  totalReports: number
  classList: {
    id: number
    name: string
    studentCount: number
    createdAt: string
  }[]
  recentExperiments: {
    id: number
    title: string
    status: string
    className: string
    caseTitle: string
    startDate: string
    endDate: string
  }[]
}

export async function getStudentStats(): Promise<StudentStats> {
  const res = await api.get('/stats/student')
  return res.data
}

export async function getTeacherStats(): Promise<TeacherStats> {
  const res = await api.get('/stats/teacher')
  return res.data
}
