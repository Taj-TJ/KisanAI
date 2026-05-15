import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kisanai_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function sendQuery(text, language = 'en', threadId = 'default', threadTitle = null) {
  const response = await api.post('/query', { text, language, threadId, threadTitle })
  return response.data
}

export async function checkHealth() {
  const response = await api.get('/health')
  return response.data
}

export async function fetchWeather(lat, lon) {
  const response = await api.get('/weather', { params: { lat, lon } })
  return response.data
}

export async function fetchPrices() {
  const response = await api.get('/prices')
  return response.data
}

export async function fetchPriceAnalysis() {
  const response = await api.get('/prices/analysis')
  return response.data
}

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function signup(email, password, name) {
  const response = await api.post('/auth/signup', { email, password, name })
  return response.data
}

export async function fetchRecommendations({ soil, season, water, lat, lon }) {
  const response = await api.post('/recommend', { soil, season, water, lat, lon })
  return response.data
}

export async function detectDisease(image) {
  const response = await api.post('/detect', { image })
  return response.data
}

export async function fetchChatHistory(threadId = 'default') {
  const response = await api.get('/history/chats', { params: { threadId } })
  return response.data
}

export async function fetchThreads() {
  const response = await api.get('/history/threads')
  return response.data
}

export async function clearChatHistory() {
  const response = await api.delete('/history/chats')
  return response.data
}

export async function fetchRecHistory() {
  const response = await api.get('/history/recommendations')
  return response.data
}

export async function fetchAnalysisHistory() {
  const response = await api.get('/history/analyses')
  return response.data
}

export async function fetchDashboardStats() {
  const response = await api.get('/dashboard/stats')
  return response.data
}

export async function fetchDashboardAlerts() {
  const response = await api.get('/dashboard/alerts')
  return response.data
}

export async function fetchDashboardTips() {
  const response = await api.get('/dashboard/tips')
  return response.data
}
