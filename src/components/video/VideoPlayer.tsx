import { useRef, useState, useCallback, useEffect, type MutableRefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings, Pip, ChevronRight, ChevronLeft } from 'lucide-react'
import { getYouTubeID, getGoogleDriveID } from '@/utils'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  autoPlay?: boolean
  ratio?: '16/9' | '9/16' | '1/1' | 'custom'
}

export const VideoPlayer = ({ src, poster, title, autoPlay = false, ratio = '16/9' }: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(true) // Start muted for better autoplay compatibility
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showCover, setShowCover] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null) as MutableRefObject<ReturnType<typeof setTimeout> | null>
  const lastTapRef = useRef<number>(0)

  const youtubeId = getYouTubeID(src)
  const driveId = getGoogleDriveID(src)
  const isShort = src.includes('shorts')
  const finalRatio = ratio || (isShort ? '9/16' : '16/9')

  // --- Handlers ---

  const navigate = useNavigate()

  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        const elem = containerRef.current as any
        const requestMethod = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen

        if (requestMethod) {
          try {
            await requestMethod.call(elem)
          } catch (e) {
            setIsFullscreen(true)
          }
        } else {
          setIsFullscreen(true)
        }
        
        const screenAny = window.screen as any
        if (screenAny?.orientation?.lock) {
          if (finalRatio === '16/9') {
            await screenAny.orientation.lock('landscape').catch(() => {})
          } else {
            await screenAny.orientation.lock('portrait').catch(() => {})
          }
        }
      } else {
        const exitMethod = (document as any).exitFullscreen || (document as any).webkitFullscreenElement || (document as any).webkitExitFullscreen || (document as any).mozCancelFullScreen || (document as any).msExitFullscreen
        if (exitMethod) {
          try { await exitMethod.call(document) } catch (e) {}
        }
        setIsFullscreen(false)
        const screenAny = window.screen as any
        if (screenAny?.orientation?.unlock) screenAny.orientation.unlock()
      }
    } catch (err) {
      setIsFullscreen(!isFullscreen)
    }
  }, [finalRatio, isFullscreen])

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const v = videoRef.current
    if (!v) return
    
    if (v.paused) { 
      setTimeout(() => v.play().catch(console.error), 50)
      setIsPlaying(true) 
    } else { 
      v.pause()
      setIsPlaying(false) 
    }
  }, [handleFullscreen, isFullscreen])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || isDragging) return
    setCurrentTime(videoRef.current.currentTime)
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
  }, [isDragging])

  const scrub = useCallback((e: MouseEvent | React.MouseEvent | TouchEvent) => {
    if (!progressRef.current || !videoRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const targetTime = pos * videoRef.current.duration
    videoRef.current.currentTime = targetTime
    setProgress(pos * 100)
    setCurrentTime(targetTime)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    scrub(e)
  }

  const handleMouseMoveGlobal = useCallback((e: MouseEvent) => {
    if (isDragging) scrub(e)
  }, [isDragging, scrub])

  const handleMouseUpGlobal = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
    setShowSpeedMenu(false)
  }

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation()
    const isMobile = window.innerWidth < 1024
    if (!isMobile) return

    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      if (x < rect.width / 2) {
        if (videoRef.current) videoRef.current.currentTime -= 10
      } else {
        if (videoRef.current) videoRef.current.currentTime += 10
      }
    }
    lastTapRef.current = now
  }

  // --- Effects ---

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveGlobal)
      window.addEventListener('mouseup', handleMouseUpGlobal)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal)
      window.removeEventListener('mouseup', handleMouseUpGlobal)
    }
  }, [isDragging, handleMouseMoveGlobal, handleMouseUpGlobal])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k': e.preventDefault(); togglePlay(); break;
        case 'm': e.preventDefault(); toggleMute(); break;
        case 'f': e.preventDefault(); handleFullscreen(); break;
        case 'arrowleft': if(videoRef.current) videoRef.current.currentTime -= 5; break;
        case 'arrowright': if(videoRef.current) videoRef.current.currentTime += 5; break;
        case 'j': if(videoRef.current) videoRef.current.currentTime -= 10; break;
        case 'l': if(videoRef.current) videoRef.current.currentTime += 10; break;
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, toggleMute, handleFullscreen])

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement)
      setIsFullscreen(isFs)
      if (!isFs && videoRef.current) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    document.addEventListener('mozfullscreenchange', handleFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
      document.removeEventListener('mozfullscreenchange', handleFsChange)
    }
  }, [])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSpeedMenu) setShowControls(false)
    }, 3000)
  }, [isPlaying, showSpeedMenu])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleStartEmbed = useCallback(() => {
    setShowCover(false)
  }, [])

  // --- Render ---

  if (youtubeId || driveId) {
    const embedUrl = youtubeId 
      ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&color=white&vq=hd1080`
      : `https://drive.google.com/file/d/${driveId}/preview?autoplay=1`;

    const isPortrait = finalRatio === '9/16'
    
    return (
      <div 
        ref={containerRef}
        className={`relative w-full mx-auto transition-all duration-700 rounded-3xl shadow-2xl bg-black ${
          isFullscreen ? 'fixed inset-0 z-[100] rounded-none flex items-center justify-center' : 'overflow-hidden'
        }`}
        style={{ maxWidth: isPortrait && !isFullscreen ? '450px' : '100%' }}
      >
        <div 
          className="relative w-full overflow-hidden" 
          style={{ 
            paddingBottom: isFullscreen ? '0' : (isPortrait ? '177.77%' : '56.25%'),
            height: isFullscreen ? '100%' : 'auto'
          }}
        >
          {showCover ? (
            <div className="absolute inset-0 z-10 cursor-pointer group" onClick={handleStartEmbed}>
              <img src={poster || '/placeholder-thumb.jpg'} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity group-hover:bg-black/20">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                  <Play className="w-10 h-10 text-white fill-white ml-2" />
                </div>
              </div>
            </div>
          ) : (
            <iframe src={embedUrl} title={title} className="absolute top-0 left-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto transition-all duration-700 rounded-3xl shadow-2xl bg-black group select-none ${
        isFullscreen ? 'fixed inset-0 z-[100] rounded-none flex items-center justify-center' : 'w-full overflow-hidden'
      }`}
      style={{ maxWidth: finalRatio === '9/16' && !isFullscreen ? '450px' : '100%' }}
      onMouseMove={handleMouseMove}
      onClick={handleDoubleTap}
    >
      <div 
        className="relative w-full overflow-hidden" 
        style={{ 
          paddingBottom: isFullscreen ? '0' : (finalRatio === '9/16' ? '177.77%' : '56.25%'),
          height: isFullscreen ? '100%' : 'auto'
        }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={isMuted}
          playsInline
          className="absolute top-0 left-0 w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => {
            setIsPlaying(false)
            if (window.innerWidth < 1024) navigate('/')
          }}
          onClick={togglePlay}
        />
      </div>

      {/* Glassmorphism Title */}
      {title && !isPlaying && (
        <div className="absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <h2 className="text-white font-bold text-xl drop-shadow-lg transform translate-y-0 transition-transform duration-500 opacity-90">{title}</h2>
        </div>
      )}

      {/* Control Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Central Play/Pause Toggle */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <button onClick={togglePlay} className="pointer-events-auto w-24 h-24 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 transform transition-all hover:scale-110 hover:bg-white/20 group/play">
              <Play className="w-10 h-10 text-white fill-white ml-2 transition-transform group-hover/play:scale-110" />
            </button>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-6 pt-12 pb-8 pointer-events-auto bg-gradient-to-t from-black/90 via-black/40 to-transparent"
        >
          {/* Seek Bar */}
          <div className="relative mb-6 group/progress">
            <div
              ref={progressRef}
              className="h-1.5 w-full bg-white/20 rounded-full cursor-pointer transition-all hover:h-2"
              onMouseDown={handleMouseDown}
            >
              <div 
                className="h-full bg-gradient-to-r from-brand-orange via-brand-pink to-brand-pink rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-xl opacity-0 scale-50 group-hover/progress:opacity-100 group-hover/progress:scale-100 transition-all cursor-grab active:cursor-grabbing" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-brand-yellow transition-transform hover:scale-110">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
              </button>
              
              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-brand-yellow transition-transform hover:scale-110">
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <span className="text-white/70 text-sm font-mono tracking-tight hidden sm:inline">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 relative">
              {/* Speed Selector */}
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu) }}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-xs font-bold">{playbackSpeed}x</span>
                </button>
                
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-3 w-32 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {[0.5, 1, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`w-full px-4 py-2.5 text-sm text-left hover:bg-white/10 transition-colors ${playbackSpeed === speed ? 'text-brand-orange font-bold' : 'text-white/70'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => { if(document.pictureInPictureEnabled && videoRef.current) videoRef.current.requestPictureInPicture() }}
                className="text-white hidden sm:block opacity-60 hover:opacity-100 transition-all"
              >
                <Pip className="w-5 h-5" />
              </button>

              <button onClick={handleFullscreen} className="text-white bg-white/10 hover:bg-brand-orange/20 p-2 rounded-xl transition-all border border-white/10 hover:border-brand-orange/40">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
