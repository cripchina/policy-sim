import api from './index'
import type { User } from './auth'

export interface Class {
  id: number
  name: string
  description?: string
  teacherId: number
  teacher: User
  createdAt: string
  updatedAt: string
}

export interface ClassStudent {
  id: number
  classId: number
  studentId: number
  student: User
  createdAt: string
}

/** Get all classes */
export async function getClasses(): Promise<Class[]> {
  const res = await api.get('/classes')
  return res.data
}

/** Get class by ID */
export async function getClass(id: number): Promise<Class> {
  const res = await api.get(`/classes/${id}`)
  return res.data
}

/** Create class */
export async function createClass(data: { name: string; description?: string }): Promise<Class> {
  const res = await api.post('/classes', data)
  return res.data
}

/** Update class */
export async function updateClass(id: number, data: { name: string; description?: string }): Promise<Class> {
  const res = await api.put(`/classes/${id}`, data)
  return res.data
}

/** Delete class */
export async function deleteClass(id: number): Promise<void> {
  await api.delete(`/classes/${id}`)
}

/** Get students in a class */
export async function getClassStudents(classId: number): Promise<ClassStudent[]> {
  const res = await api.get(`/classes/${classId}/students`)
  return res.data
}

/** Add student to class */
export async function addStudentToClass(classId: number, studentId: number): Promise<ClassStudent> {
  const res = await api.post(`/classes/${classId}/students`, { studentId })
  return res.data
}

/** Remove student from class */
export async function removeStudentFromClass(classId: number, studentId: number): Promise<void> {
  await api.delete(`/classes/${classId}/students/${studentId}`)
}

/** Batch import students */
export async function batchImportStudents(
  classId: number,
  students: { username: string; displayName: string }[],
): Promise<{ created: number; skipped: number; errors: string[] }> {
  const res = await api.post(`/classes/${classId}/students/batch`, { students })
  return res.data
}
