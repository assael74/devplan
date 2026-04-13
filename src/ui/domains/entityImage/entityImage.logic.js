// src/ui/entityImage/entityImage.logic.js

export const ENTITY_LABEL = {
  players: 'שחקן',
  privates: 'שחקן',
  teams: 'קבוצה',
  clubs: 'מועדון',
}

export const DEFAULT_SNACK_ENTITY = {
  players: 'player',
  privates: 'player',
  teams: 'team',
  clubs: 'club',
}

export function safeEntityLabel(entityType) {
  return ENTITY_LABEL[entityType] || 'אובייקט'
}

export function makePreviewUrl(file) {
  if (!file) return null
  return URL.createObjectURL(file)
}

export function revokeUrl(url) {
  try {
    if (url) URL.revokeObjectURL(url)
  } catch {}
}

/**
 * Crop helper (square by default)
 * Uses canvas -> File (jpeg)
 */
export async function cropImageToFile(imageSrc, pixelCrop, outName = 'cropped-image.jpg') {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const w = Math.max(1, Math.round(pixelCrop?.width || 1))
  const h = Math.max(1, Math.round(pixelCrop?.height || 1))
  const x = Math.max(0, Math.round(pixelCrop?.x || 0))
  const y = Math.max(0, Math.round(pixelCrop?.y || 0))

  canvas.width = w
  canvas.height = h

  ctx.drawImage(image, x, y, w, h, 0, 0, w, h)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
  if (!blob) throw new Error('[cropImageToFile] failed to build blob')

  return new File([blob], outName, { type: 'image/jpeg' })
}

export function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (err) => reject(err))
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = url
  })
}

/**
 * Default uploader adapter:
 * You can inject your existing uploadImageOnly via props instead of using this.
 */
export function buildDefaultUploader(uploadImageOnlyFn) {
  if (typeof uploadImageOnlyFn !== 'function') return null

  return async function upload({ entityType, id, file, oldUrl, onProgress }) {
    return uploadImageOnlyFn({
      objectType: entityType,
      objectId: id,
      imageFile: file,
      oldImageUrl: oldUrl || '',
      setLoadingImage: typeof onProgress === 'function' ? onProgress : () => {},
    })
  }
}
