import { api } from './api'

// list posts (public)
export async function fetchPosts({ page = 1, limit = 10, status } = {}) {
  const params = { page, limit }
  if (status) params.status = status
  const { data } = await api.get('/posts', { params })
  return data
}

// single post by slug (public)
export async function fetchPostBySlug(slug) {
  const { data } = await api.get(`/posts/${encodeURIComponent(slug)}`)
  return data
}
