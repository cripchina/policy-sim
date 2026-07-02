import api from './index'

export interface SimResult {
  indicatorId: string
  label: string
  value: number
  unit: string
  format: string
  higherIsBetter: boolean
}

export interface SimRunResponse {
  id: number
  parameters: Record<string, number>
  results: SimResult[]
  createdAt: string
}

export interface SimHistoryItem {
  id: number
  caseId: number
  caseTitle: string
  parameters: Record<string, number>
  results: SimResult[]
  createdAt: string
}

export async function runSimulation(caseId: number, parameters: Record<string, number>): Promise<SimRunResponse> {
  const res = await api.post('/simulation/run', { caseId, parameters })
  return res.data
}

export async function getHistory(caseId?: number): Promise<SimHistoryItem[]> {
  const params = caseId ? { caseId: caseId.toString() } : {}
  const res = await api.get('/simulation/history', { params })
  return res.data
}
