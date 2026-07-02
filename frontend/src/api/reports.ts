import api from './index'

export interface Report {
  id: number
  studentId: number
  caseId: number
  simulationRunId?: number
  content: string
  score?: number
  teacherComment?: string
  status: string
  createdAt: string
  updatedAt: string
  student?: { id: number; displayName: string }
  policyCase?: { id: number; title: string }
}

export async function getReports(caseId?: number): Promise<Report[]> {
  const params = caseId ? { caseId: caseId.toString() } : {}
  const res = await api.get('/reports', { params })
  return res.data
}

export async function getReport(id: number): Promise<Report> {
  const res = await api.get(`/reports/${id}`)
  return res.data
}

export async function createReport(data: Partial<Report>): Promise<Report> {
  const res = await api.post('/reports', data)
  return res.data
}

export async function updateReport(id: number, data: Partial<Report>): Promise<Report> {
  const res = await api.put(`/reports/${id}`, data)
  return res.data
}

export async function gradeReport(id: number, score: number, comment: string): Promise<Report> {
  const res = await api.put(`/reports/${id}/grade`, { score, comment })
  return res.data
}
