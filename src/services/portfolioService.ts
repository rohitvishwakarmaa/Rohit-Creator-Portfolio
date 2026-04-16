import type { Video, PaginatedResponse, PortfolioFilters } from '@/types'

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_VIDEOS: Video[] = [
  {
    id: 'premium-service-ad',
    title: 'Corporate Excellence — Premium Business Service Ad',
    description: 'A high-impact, professional service advertisement designed for modern businesses. Combining sleek motion graphics with AI-assisted editing to deliver a premium brand message.',
    video_url: 'https://youtu.be/1gYgxtwF0GU',
    thumbnail: 'https://img.youtube.com/vi/1gYgxtwF0GU/maxresdefault.jpg',
    tags: ['Business', 'Corporate', 'Professional'],
    category: 'AI Ads',
    client_name: 'Business Strategy Group',
    created_at: '2024-04-15',
    is_featured: true,
  },
  {
    id: 'velora-perfume',
    title: 'Velora — Luxury Brand Perfume Film',
    description: 'A cinematic brand film for Velora Perfumes. Evoking elegance and sophistication through fluid transitions, soft lighting, and high-end visual storytelling.',
    video_url: 'https://youtube.com/shorts/RHxWMF3nbEc',
    thumbnail: 'https://img.youtube.com/vi/RHxWMF3nbEc/maxresdefault.jpg',
    tags: ['Brand Film', 'Luxury', 'Product'],
    category: 'AI Ads',
    client_name: 'Velora Paris',
    created_at: '2024-04-10',
    is_featured: true,
  },
  {
    id: 'akshaya-tritiya',
    title: 'Akshaya Tritiya — Digital Storytelling Heritage Animation',
    description: 'A vibrant storytelling animation celebrating the heritage of Akshaya Tritiya. Rich in cultural motifs and festive colors, crafted with modern animation techniques.',
    video_url: 'https://youtu.be/vZiOvg8QBDc',
    thumbnail: 'https://img.youtube.com/vi/vZiOvg8QBDc/maxresdefault.jpg',
    tags: ['Storytelling', 'Heritage', 'Culture'],
    category: 'Animation',
    client_name: 'Cultural Arts Foundation',
    created_at: '2024-04-16',
    is_featured: true,
  },
]

// ─── Service functions (swap out mock for real API later) ─────────────────────
import api from './api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const portfolioService = {
  async getPortfolio(
    filters?: PortfolioFilters,
    page = 1,
    limit = 8
  ): Promise<PaginatedResponse<Video>> {
    if (USE_MOCK) {
      let filtered = [...MOCK_VIDEOS]
      if (filters?.category && filters.category !== 'All') {
        filtered = filtered.filter((v) => v.category === filters.category)
      }
      if (filters?.tags && filters.tags.length > 0) {
        filtered = filtered.filter((v) =>
          filters.tags!.some((t) => v.tags.includes(t))
        )
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        filtered = filtered.filter(
          (v) =>
            v.title.toLowerCase().includes(q) ||
            v.description.toLowerCase().includes(q)
        )
      }
      const start = (page - 1) * limit
      const paginated = filtered.slice(start, start + limit)
      return {
        data: paginated,
        total: filtered.length,
        page,
        limit,
        has_more: start + limit < filtered.length,
      }
    }

    const params = new URLSearchParams()
    if (filters?.category && filters.category !== 'All')
      params.set('category', filters.category)
    if (filters?.search) params.set('search', filters.search)
    params.set('page', String(page))
    params.set('limit', String(limit))

    const res = await api.get(`/api/portfolio?${params}`)
    return res.data
  },

  async getVideoById(id: string): Promise<Video> {
    if (USE_MOCK) {
      const video = MOCK_VIDEOS.find((v) => v.id === id)
      if (!video) throw new Error('Video not found')
      return video
    }
    const res = await api.get(`/api/portfolio/${id}`)
    return res.data.data
  },
}
