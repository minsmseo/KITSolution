import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Lectures
export const lectureAPI = {
  list: () => api.get('/lectures'),
  create: (data) => api.post('/lectures', data),
  get: (id) => api.get(`/lectures/${id}`),
  uploadText: (id, text) => api.post(`/lectures/${id}/upload-text`, { text }),
  enrollSelf: (id) => api.post(`/lectures/${id}/enroll-self`),
  enroll: (id, studentId) => api.post(`/lectures/${id}/enroll`, { student_id: studentId }),
  students: (id) => api.get(`/lectures/${id}/students`),
}

// Graph
export const graphAPI = {
  generate: (lectureId) => api.post(`/lectures/${lectureId}/generate-graph`),
  get: (lectureId) => api.get(`/lectures/${lectureId}/graph`),
}

// Assignments
export const assignmentAPI = {
  generate: (lectureId, data) => api.post(`/lectures/${lectureId}/assignments/generate`, data),
  list: (lectureId) => api.get(`/lectures/${lectureId}/assignments`),
  submit: (assignmentId, answerText) => api.post(`/assignments/${assignmentId}/submit`, { answer_text: answerText }),
}

// Analytics
export const analyticsAPI = {
  allInstructors: () => api.get('/analytics/instructors'),
  instructor: (id) => api.get(`/analytics/instructors/${id}`),
  lecture: (id) => api.get(`/analytics/lectures/${id}`),
}

export default api
