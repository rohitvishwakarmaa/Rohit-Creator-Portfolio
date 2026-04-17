import type { Video, PaginatedResponse, PortfolioFilters } from '@/types'

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_VIDEOS: Video[] = [
  {
    id: 'premium-service-ad',
    title: 'Corporate Excellence — Premium Business Service Ad',
    description: 'A high-impact, professional service advertisement designed for modern businesses. Combining sleek motion graphics with AI-assisted editing to deliver a premium brand message.',
    video_url: 'https://youtu.be/1gYgxtwF0GU',
    thumbnail: '/thumbnails/corporate-excellence.jpg',
    tags: ['Business', 'Corporate', 'Professional'],
    category: 'AI Ads',
    client_name: 'Business Strategy Group',
    created_at: '2024-04-15',
    is_featured: true,
  },
  {
    id: 'akshaya-tritiya-celebration',
    title: 'Akshaya Tritiya — Digital Storytelling Heritage Animation',
    description: 'A vibrant storytelling animation celebrating the heritage of Akshaya Tritiya. Rich in cultural motifs and festive colors, crafted with modern animation techniques.',
    video_url: 'https://drive.google.com/file/d/1d3jb0VIUUWoR625neLolqW4lpI2Vltcl/view?usp=sharing',
    thumbnail: '/thumbnails/akshaya-tritiya-celebration.jpg',
    tags: ['Storytelling', 'Heritage', 'Culture'],
    category: 'Animation',
    client_name: 'Cultural Arts Foundation',
    created_at: '2024-04-17',
    is_featured: true,
  },
  {
    id: 'bhakti-sanga-intro',
    title: 'Divine Resonance — Premium Cinematic Intro for Bhakti Sanga',
    description: 'A sacred and visually stunning cinematic introduction for Bhakti Sanga. Combining spiritual motifs with premium motion graphics to create a divine atmosphere.',
    video_url: 'https://dai.ly/k6tto53crPKfgOFzLj8',
    thumbnail: '/thumbnails/bhakti-sanga-intro.jpg',
    tags: ['Spiritual', 'Cinematic', 'Introduction'],
    category: 'AI Ads',
    client_name: 'Bhakti Sanga Foundation',
    created_at: '2024-04-17',
    is_featured: true,
  },
  {
    id: 'bhakti-sanga-outro',
    title: 'Divine Blessings — Premium Cinematic Outro for Bhakti Sanga',
    description: 'A sacred and visually stunning cinematic outro for Bhakti Sanga. Designed to leave a lasting spiritual impression with elegant calls to action and divine visuals.',
    video_url: 'https://drive.google.com/file/d/19S2ssIBHJnnlIokxK5neSsbd-6ZbdqHJ/view?usp=sharing',
    thumbnail: '/thumbnails/bhakti-sanga-outro.jpg',
    tags: ['Spiritual', 'Cinematic', 'Outro'],
    category: 'AI Ads',
    client_name: 'Bhakti Sanga Foundation',
    created_at: '2024-04-17',
    is_featured: true,
  },
  {
    id: 'velora-character',
    title: 'Velora — Cinematic Brand Film: The Essence of Sophistication',
    description: 'A striking product showcase for Velora. "Confidence begins with a single moment." This ad highlights the premium craftsmanship and character of the fragrance.',
    video_url: 'https://drive.google.com/file/d/1hiFhv0-H-o_9rVTv14ia9sUMc4vsGWNI/view?usp=sharing',
    thumbnail: '/thumbnails/velora-character.jpg',
    tags: ['Product Showcase', 'Luxury', 'Cinematic'],
    category: 'AI Ads',
    client_name: 'Velora Paris',
    created_at: '2024-04-17',
    is_featured: true,
  },
  {
    id: 'floral-fusion',
    title: 'Floral Fusion — Premium Berry & Botanical Ad',
    description: 'A masterpiece of liquid art. This 10-second cinematic showcase captures the vibrant energy of a signature berry smoothie, accented by botanical elements and high-speed motion.',
    video_url: 'https://drive.google.com/file/d/1RF_qVf7r0b-mC5Pesffx0l2Wyh5ovdaU/view?usp=sharing',
    thumbnail: '/thumbnails/floral-fusion.jpg',
    tags: ['Product Ad', 'Cinematic', 'Liquid Motion'],
    category: 'AI Ads',
    client_name: 'Velora Paris',
    created_at: '2024-04-17',
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
