import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '…' : str
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    'AI Ads': 'bg-orange-100 text-orange-700',
    'AI Video Editing': 'bg-purple-100 text-purple-700',
    'AI Voiceovers': 'bg-pink-100 text-pink-800',
    'AI Storytelling': 'bg-yellow-100 text-yellow-700',
    Animation: 'bg-blue-100 text-blue-700',
  }
  return map[category] || 'bg-gray-100 text-gray-700'
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function getYouTubeID(url: string): string | null {
  if (!url) return null;
  
  // Revised regex to handle multiple YouTube formats including Shorts and standard watch URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  
  // The ID is usually in the second capture group with this regex
  return (match && match[2]?.length === 11) ? match[2] : null;
}

export function getGoogleDriveID(url: string): string | null {
  if (!url) return null;
  const regExp = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}
