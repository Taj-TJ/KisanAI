import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

export async function fetchRecommendations({ soil, season, water, lat, lon }) {
  const response = await api.post('/recommend', { soil, season, water, lat, lon })
  return response.data
}
