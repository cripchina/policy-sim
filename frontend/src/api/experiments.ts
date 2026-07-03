import api from './index'
import type { Class } from './classes'
import type { PolicyCase } from './cases'

export interface Experiment {
  id: number
  title: string
  description?: string
  classId: number
  class: Class
  caseId: number
  policyCase: PolicyCase
  teacherId: number
  teacher: any
  startDate?: string
  endDate?: string
  status: 'pending' | 'active' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface ExperimentResult {
  studentId: number
  studentName: string
  runId: number
  parameters: any
  indicators: any
  submittedAt: string
}

/** Get all experiments */
export async function getExperiments(): Promise<Experiment[]> {
  const res = await api.get('/experiments')
  return res.data
}

/** Get experiment by ID */
export async function getExperiment(id: number): Promise<Experiment> {
  const res = await api.get(`/experiments/${id}`)
  return res.data
}

/** Create experiment */
export async function createExperiment(data: {
  title: string
  description?: string
  classId: number
  caseId: number
  startDate?: string
  endDate?: string
}): Promise<Experiment> {
  const res = await api.post('/experiments', data)
  return res.data
}

/** Update experiment */
export async function updateExperiment(
  id: number,
  data: Partial<{
    title: string
    description: string
    startDate: string
    endDate: string
    status: string
  }>,
): Promise<Experiment> {
  const res = await api.put(`/experiments/${id}`, data)
  return res.data
}

/** Delete experiment */
export async function deleteExperiment(id: number): Promise<void> {
  await api.delete(`/experiments/${id}`)
}

/** Get experiment results */
export async function getExperimentResults(id: number): Promise<ExperimentResult[]> {
  const res = await api.get(`/experiments/${id}/results`)
  return res.data
}
