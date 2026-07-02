import api from './index'

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    username: string
    displayName: string
    role: string
  }
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/login', { username, password })
  return res.data
}

export async function register(username: string, password: string, displayName: string, role: string) {
  const res = await api.post('/auth/register', { username, password, displayName, role })
  return res.data
}
