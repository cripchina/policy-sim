import api from './index'

export interface PolicyCase {
  id: number
  title: string
  description: string
  category: string
  background: string
  coverImage?: string
  config: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SimConfig {
  parameters: SimParameter[]
  indicators: SimIndicator[]
  formulas: SimFormula[]
}

export interface SimParameter {
  id: string
  name: string
  label: string
  type: 'slider' | 'select' | 'number'
  min?: number
  max?: number
  step?: number
  default: number
  unit: string
  options?: { label: string; value: number }[]
}

export interface SimIndicator {
  id: string
  name: string
  label: string
  unit: string
  format: 'number' | 'percent' | 'currency'
  higherIsBetter: boolean
}

export interface SimFormula {
  indicatorId: string
  expression: string
  description?: string
}

export async function getCases(): Promise<PolicyCase[]> {
  const res = await api.get('/cases')
  return res.data
}

export async function getCase(id: number): Promise<PolicyCase> {
  const res = await api.get(`/cases/${id}`)
  return res.data
}
