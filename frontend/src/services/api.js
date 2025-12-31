import axios from 'axios'

// 1. Create the Axios instance
export const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// 2. EXPORT the helper function (Fixes the build error)
export function getAdminKey() {
  return localStorage.getItem('adminKey')
}

// 3. Attach admin key automatically to every request
api.interceptors.request.use((config) => {
  const key = getAdminKey()
  if (key) {
    config.headers['x-admin-key'] = key
  }
  return config
})

// 4. Handle 401 Unauthorized errors (Logout if key is bad)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('adminKey')
    }
    return Promise.reject(err)
  }
)

// 5. Image Upload Helper
export async function uploadImage(file) {
  const fd = new FormData()
  fd.append('file', file)

  const { data } = await api.post('/uploads/image', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data // returns { url: ... }
}
