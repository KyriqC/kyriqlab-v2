import axios from 'axios'
import { getAdminKey, clearAdminKey } from './auth'

export const api = axios.create({
  baseURL: '/api',
  timeout: 10 * 60 * 1000,
})

// Attach admin key automatically (for protected routes)
api.interceptors.request.use((config) => {
  const key =
    localStorage.getItem("adminKey") ||            // recommended
    localStorage.getItem("kyriqlab_admin_key") ||  // fallback if you used this earlier
                // dev-only fallback
    "";

  if (key) {
    config.headers = config.headers || {};
    config.headers["x-admin-key"] = key;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      // key missing/wrong — clear it so UI updates
      clearAdminKey()
    }
    return Promise.reject(err)
  }
)

export async function uploadImage(file) {
  const fd = new FormData()
  fd.append('file', file)

  const { data } = await api.post('/uploads/image', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data // { url }
}
