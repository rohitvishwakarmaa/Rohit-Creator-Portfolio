import api from './api'
import type { LoginCredentials, AuthResponse, Video, VideoUploadPayload } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// Mock credentials (replace with real auth)
const MOCK_ADMIN = { email: 'admin@rohitvishwakarma.com', password: 'admin123' }

export const adminService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
      if (
        credentials.email === MOCK_ADMIN.email &&
        credentials.password === MOCK_ADMIN.password
      ) {
        return {
          token: 'mock_jwt_token_rohit_portfolio',
          user: { id: '1', email: credentials.email, name: 'Rohit Vishwakarma' },
        }
      }
      throw new Error('Invalid credentials')
    }
    const res = await api.post('/api/admin/login', credentials)
    return res.data.data
  },

  async uploadVideo(payload: VideoUploadPayload): Promise<Video> {
    if (USE_MOCK) {
      // Simulate upload delay
      await new Promise((r) => setTimeout(r, 1500))
      const newVideo: Video = {
        id: String(Date.now()),
        title: payload.title,
        description: payload.description,
        video_url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
        tags: payload.tags,
        category: payload.category,
        client_name: payload.client_name,
        created_at: new Date().toISOString(),
        is_featured: payload.is_featured,
      }
      return newVideo
    }
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'tags') {
        formData.append(key, JSON.stringify(value))
      } else if (value instanceof File) {
        formData.append(key, value)
      } else {
        formData.append(key, String(value))
      }
    })
    const res = await api.post('/api/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
  },

  async updateVideo(id: string, payload: Partial<VideoUploadPayload>): Promise<Video> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500))
      return { id } as Video
    }
    const res = await api.put(`/api/admin/video/${id}`, payload)
    return res.data.data
  },

  async deleteVideo(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 500))
      return
    }
    await api.delete(`/api/admin/video/${id}`)
  },
}
