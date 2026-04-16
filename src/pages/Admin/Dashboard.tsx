import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Upload, List, LogOut, Sparkles,
  Plus, Trash2, Pencil, Eye, X, CheckCircle, Film,
  Video as VideoIcon, Star, Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { adminService } from '@/services/adminService'
import { MOCK_VIDEOS } from '@/services/portfolioService'
import { formatDate, truncate } from '@/utils'
import type { Video, VideoCategory, VideoUploadPayload } from '@/types'

const CATEGORIES: VideoCategory[] = [
  'AI Ads', 'AI Video Editing', 'AI Voiceovers', 'AI Storytelling', 'Animation',
]

const NAV = [
  { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
  { icon: Upload, label: 'Upload', id: 'upload' },
  { icon: List, label: 'Videos', id: 'videos' },
]

// ─── OVERVIEW stats ────────────────────────────────────────────────────────
const OVERVIEW_STATS = [
  { label: 'Total Videos', value: '8', icon: Film, color: '#F77F00', bg: '#FFF3E0' },
  { label: 'Featured', value: '4', icon: Star, color: '#FFD166', bg: '#FFFDE7' },
  { label: 'Categories', value: '5', icon: VideoIcon, color: '#7B2CBF', bg: '#F3E5F5' },
  { label: 'Total Views', value: '2M+', icon: Zap, color: '#FF4D6D', bg: '#FCE4EC' },
]

// ─── Upload form initial state ─────────────────────────────────────────────
const EMPTY_FORM: VideoUploadPayload = {
  title: '',
  description: '',
  tags: [],
  category: 'AI Ads',
  client_name: '',
  is_featured: false,
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, handleLogout } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'videos'>('overview')
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS)
  const [form, setForm] = useState<VideoUploadPayload>(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editVideo, setEditVideo] = useState<Video | null>(null)
  const [previewFile, setPreviewFile] = useState<string | null>(null)
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null)

  const onLogout = () => { handleLogout(); navigate('/admin/login') }

  const handleFormChange = (field: keyof VideoUploadPayload, value: unknown) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t: string) => t !== tag) }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFormChange('video_file', file)
      setPreviewFile(URL.createObjectURL(file))
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFormChange('thumbnail_file', file)
      setPreviewThumbnail(URL.createObjectURL(file))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    try {
      const newVideo = await adminService.uploadVideo(form)
      setVideos((v) => [newVideo, ...v])
      setForm(EMPTY_FORM)
      setPreviewFile(null)
      setPreviewThumbnail(null)
      setTagInput('')
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
      setActiveTab('videos')
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await adminService.deleteVideo(id)
    setVideos((v) => v.filter((vid) => vid.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ─── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-gray-900 text-sm leading-none">Rohit</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={activeTab === id ? { background: 'linear-gradient(135deg, #F77F00, #FF4D6D)' } : {}}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #7B2CBF, #FF4D6D)' }}>
              {user?.name?.charAt(0) || 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Rohit'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────────────────────── */}
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 capitalize">{activeTab}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {activeTab === 'overview' && 'Your portfolio at a glance'}
              {activeTab === 'upload' && 'Add a new video project'}
              {activeTab === 'videos' && `${videos.length} total videos`}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setActiveTab('upload')}
          >
            Upload New
          </Button>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {OVERVIEW_STATS.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <p className="font-display font-black text-3xl text-gray-900 mb-1">{value}</p>
                  <p className="text-gray-500 text-sm">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent videos table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Recent Videos</h2>
                <button onClick={() => setActiveTab('videos')} className="text-brand-orange text-sm font-medium">See all →</button>
              </div>
              <div className="divide-y divide-gray-50">
                {videos.slice(0, 5).map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <img src={video.thumbnail} alt={video.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{video.title}</p>
                      <p className="text-gray-400 text-xs">{video.client_name}</p>
                    </div>
                    <Badge label={video.category} variant="category" />
                    {video.is_featured && <Badge label="Featured" variant="featured" />}
                    <p className="text-gray-400 text-xs hidden sm:block">{formatDate(video.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── UPLOAD ── */}
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl"
          >
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700 font-medium text-sm">Video uploaded successfully!</p>
              </motion.div>
            )}

            <form onSubmit={handleUpload} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Project title"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                  />
                </div>

                {/* Client */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={form.client_name}
                    onChange={(e) => handleFormChange('client_name', e.target.value)}
                    placeholder="Client company"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value as VideoCategory)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm bg-white"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Tags */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {form.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-medium">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                      placeholder="Add tag and press Enter"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={addTag}>Add</Button>
                  </div>
                </div>

                {/* Featured */}
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={form.is_featured}
                    onChange={(e) => handleFormChange('is_featured', e.target.checked)}
                    className="w-4 h-4 rounded accent-brand-orange"
                  />
                  <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Mark as Featured
                  </label>
                </div>

                {/* Featured Image (Thumbnail) */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                    <span className="ml-1 text-xs text-gray-400 font-normal">(thumbnail)</span>
                  </label>
                  <div
                    className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-purple transition-colors cursor-pointer overflow-hidden"
                    onClick={() => document.getElementById('thumbnail-upload')?.click()}
                  >
                    {previewThumbnail ? (
                      <div className="relative group">
                        <img
                          src={previewThumbnail}
                          alt="Thumbnail preview"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-sm font-medium">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-2">
                          <svg className="w-5 h-5 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 text-sm">Click to upload featured image</p>
                        <p className="text-gray-300 text-xs mt-1">JPG, PNG, WebP (recommended: 1280×720)</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>

                {/* Video file */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                  <div
                    className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-orange transition-colors cursor-pointer"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    {previewFile ? (
                      <video src={previewFile} controls className="w-full rounded-xl max-h-48 object-cover" />
                    ) : (
                      <div className="p-8 text-center">
                        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Click to upload video file</p>
                        <p className="text-gray-300 text-xs mt-1">MP4, MOV, WebM (max 2GB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" loading={isUploading} className="flex-1 justify-center">
                  {isUploading ? 'Uploading…' : 'Upload Video'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setForm(EMPTY_FORM)}>
                  Reset
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── VIDEOS TABLE ── */}
        {activeTab === 'videos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Video</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Client</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                      <th className="text-left p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                      <th className="text-right p-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-14 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[200px]">{truncate(video.title, 40)}</p>
                              <div className="flex gap-1 mt-0.5">
                                {video.tags.slice(0, 2).map((t) => (
                                  <span key={t} className="text-xs text-gray-400">#{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <Badge label={video.category} variant="category" />
                        </td>
                        <td className="p-4 text-gray-500 hidden lg:table-cell">{video.client_name}</td>
                        <td className="p-4 text-gray-400 text-xs hidden sm:table-cell">{formatDate(video.created_at)}</td>
                        <td className="p-4">
                          {video.is_featured ? (
                            <Badge label="Featured" variant="featured" />
                          ) : (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Regular</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/portfolio/${video.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg text-gray-400 hover:text-brand-purple hover:bg-purple-50 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => setEditVideo(video)}
                              className="p-2 rounded-lg text-gray-400 hover:text-brand-orange hover:bg-orange-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(video.id)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ─── DELETE CONFIRM MODAL ─────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-5">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-xl mb-2">Delete Video?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The video will be permanently removed.</p>
            <div className="flex gap-3">
              <Button variant="danger" className="flex-1 justify-center" onClick={() => handleDelete(deleteId)}>
                Delete
              </Button>
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── EDIT MODAL (simplified) ─────────────────────────────────────── */}
      {editVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-gray-900 text-xl">Edit Video</h3>
              <button onClick={() => setEditVideo(null)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editVideo.title}
                  onChange={(e) => setEditVideo({ ...editVideo, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:border-brand-orange transition-colors text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={editVideo.is_featured}
                  onChange={(e) => setEditVideo({ ...editVideo, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded accent-brand-orange"
                />
                <label htmlFor="edit-featured" className="text-sm font-medium text-gray-700">Featured</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                className="flex-1 justify-center"
                onClick={async () => {
                  await adminService.updateVideo(editVideo.id, editVideo)
                  setVideos((v) => v.map((vid) => (vid.id === editVideo.id ? editVideo : vid)))
                  setEditVideo(null)
                }}
              >
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setEditVideo(null)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
