import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export async function sendQuery(text, language = 'en') {
  const response = await api.post('/query', { text, language })
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
