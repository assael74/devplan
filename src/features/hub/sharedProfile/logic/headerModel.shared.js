// src/features/hub/sharedProfile/logic/headerModel.shared.js

export const countHeaderItems = items => {
  return Array.isArray(items) ? items.length : 0
}

export const appendImageCacheVersion = url => {
  if (!url) return ''

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${Date.now()}`
}

export const openProfileExternalLink = url => {
  if (!url || typeof window === 'undefined') return false

  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
