import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, User, Tag, ArrowUpRight } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { VideoCard } from '@/components/video/VideoCard'
import { Badge } from '@/components/ui/Badge'
import { VideoCardSkeleton } from '@/components/ui/Skeleton'
import { portfolioService, MOCK_VIDEOS } from '@/services/portfolioService'
import { formatDate, getYouTubeID, getGoogleDriveID } from '@/utils'
import type { Video } from '@/types'

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [video, setVideo] = useState<Video | null>(null)
  const [related, setRelated] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetch = async () => {
      setIsLoading(true)
      try {
        const data = await portfolioService.getVideoById(id!)
        setVideo(data)
        // Related: same category, exclude current
        const rel = MOCK_VIDEOS.filter(
          (v) => v.id !== id && v.category === data.category
        ).slice(0, 3)
        setRelated(rel)
      } catch {
        navigate('/portfolio')
      } finally {
        setIsLoading(false)
      }
    }
    if (id) fetch()
  }, [id, navigate])

  useEffect(() => {
    const isMobile = window.innerWidth < 1024
    if (!isMobile) return

    const handlePopState = () => {
      navigate('/')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [navigate])

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="pt-28 section-padding container-xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-100 rounded-lg w-40 mb-8" />
            <div className="aspect-video bg-gray-100 rounded-2xl mb-8" />
            <div className="h-10 bg-gray-100 rounded-lg w-2/3 mb-4" />
            <div className="h-4 bg-gray-100 rounded-lg w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!video) return null

  return (
    <PageWrapper>
      <div className="pt-28 md:pt-32 pb-20">
        <div className="container-xl max-w-5xl px-0 sm:px-6">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 px-4 sm:px-0"
          >
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  navigate('/')
                } else {
                  navigate(-1)
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors group text-xs font-bold uppercase tracking-widest border border-gray-100"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-brand-orange" />
              Back to Portfolio
            </button>
          </motion.div>

          {/* Video player */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 sm:mb-16 px-0 sm:px-0"
          >
            <div className="sm:rounded-2xl overflow-hidden shadow-2xl">
              <VideoPlayer
                src={video.video_url}
                poster={video.thumbnail}
                title={video.title}
                autoPlay={false}
                ratio={video.aspect_ratio}
              />
            </div>
          </motion.div>

          {/* Meta info & Content */}
          <div className="flex flex-col lg:flex-row gap-12 sm:gap-16 pt-4">
            {/* Main content: Title + Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 px-4 sm:px-0"
            >
              <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
                {video.is_featured && <Badge label="Featured" variant="featured" />}
                <Badge label={video.category} variant="category" />
              </div>

              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight text-center lg:text-left">
                {video.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
                {video.tags.map((tag) => (
                  <Badge key={tag} label={tag} />
                ))}
              </div>

              <div className="w-12 h-1 bg-gradient-to-r from-brand-orange to-brand-pink mb-8 mx-auto lg:mx-0 rounded-full" />

              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-0 text-center lg:text-left">
                {video.description}
              </p>
            </motion.div>

            {/* Sidebar: Details card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full lg:w-80 px-4 sm:px-0"
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                
                <h3 className="font-display font-bold text-gray-900 text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                  Project Info
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100/50">
                      <User className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Client</p>
                      <p className="text-gray-900 font-semibold text-sm">{video.client_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100/50">
                      <Tag className="w-5 h-5 text-brand-purple" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Strategy</p>
                      <p className="text-gray-900 font-semibold text-sm">{video.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-pink-50 flex items-center justify-center border border-pink-100/50">
                      <Calendar className="w-5 h-5 text-brand-pink" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Launch</p>
                      <p className="text-gray-900 font-semibold text-sm">{formatDate(video.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <a 
                    href="https://wa.me/917987252289"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-brand-orange transition-colors flex items-center justify-center gap-2 group/btn"
                  >
                    Let's Work Together
                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related videos */}
          {related.length > 0 && (
            <div className="mt-16 px-4 sm:px-0">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-2xl text-gray-900">
                  More <span className="gradient-text">{video.category}</span>
                </h2>
                <Link
                  to="/portfolio"
                  className="text-brand-orange text-sm font-semibold hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => <VideoCardSkeleton key={i} />)
                  : related.map((v, i) => <VideoCard key={v.id} video={v} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
