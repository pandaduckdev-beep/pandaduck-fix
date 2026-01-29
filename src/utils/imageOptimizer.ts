/**
 * Image optimization utilities for better performance
 * Handles WebP conversion, lazy loading, and responsive images
 */

export interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpg' | 'png'
}

/**
 * Get optimized image URL with format conversion and size parameters
 * For Supabase Storage, this would add transformation parameters
 * Currently returns original URL as Supabase doesn't support automatic transformations
 *
 * @param url Original image URL
 * @param options Optimization options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  url: string,
  options?: ImageOptimizationOptions
): string {
  if (!url) return ''

  // For future implementation with image CDN or Supabase Image Transformation API
  // Example: return `${url}?width=${options?.width}&format=${options?.format}`

  return url
}

/**
 * Check if the browser supports WebP format
 * @returns Promise that resolves to true if WebP is supported
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

/**
 * Preload an image
 * @param url Image URL to preload
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

/**
 * Get srcset for responsive images
 * @param url Base image URL
 * @param sizes Array of widths for responsive images
 * @returns srcset string
 */
export function getResponsiveSrcSet(url: string, sizes: number[]): string {
  return sizes
    .map((size) => {
      const optimizedUrl = getOptimizedImageUrl(url, { width: size })
      return `${optimizedUrl} ${size}w`
    })
    .join(', ')
}

/**
 * Convert file to WebP format (client-side)
 * Note: This requires canvas API and may not work for all image formats
 *
 * @param file Original image file
 * @param quality Quality (0-1)
 * @returns Promise that resolves to WebP blob
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert to WebP'))
            }
          },
          'image/webp',
          quality
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get image dimensions from a URL
 * @param url Image URL
 * @returns Promise with width and height
 */
export function getImageDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Generate a low-quality image placeholder (LQIP) data URL
 * @param url Image URL
 * @param targetWidth Target width for placeholder (default: 20px)
 * @returns Promise with data URL
 */
export async function generatePlaceholder(
  url: string,
  targetWidth: number = 20
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const aspectRatio = img.height / img.width
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetWidth * aspectRatio
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.1))
    }
    img.onerror = reject
    img.src = url
  })
}
