// src/services/firestore/storage/uploadImageOnly.js
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../../firebase/firebase.js'

function extractStoragePathFromUrl(url) {
  if (!url || typeof url !== 'string') return ''

  const idx = url.indexOf('/o/')
  if (idx === -1) return ''

  const after = url.substring(idx + 3)
  const q = after.indexOf('?')
  const encodedPath = q === -1 ? after : after.substring(0, q)

  try {
    return decodeURIComponent(encodedPath)
  } catch {
    return encodedPath
  }
}

async function safeDeleteByUrl(oldImageUrl) {
  if (!oldImageUrl) return

  try {
    const looksLikePath = oldImageUrl.startsWith('images/')
    const path = looksLikePath ? oldImageUrl : extractStoragePathFromUrl(oldImageUrl)
    if (!path) return

    await deleteObject(ref(storage, path))
  } catch (e) {
    console.warn('[uploadImageOnly] delete old failed', e)
  }
}

export async function uploadImageOnly({
  objectType,
  objectId,
  imageFile,
  oldImageUrl = '',
  setLoadingImage = () => {},
}) {
  if (!objectType) throw new Error('uploadImageOnly: objectType missing')
  if (!objectId) throw new Error('uploadImageOnly: objectId missing')
  if (!imageFile) throw new Error('uploadImageOnly: imageFile missing')

  await safeDeleteByUrl(oldImageUrl)

  const imagePath = `images/${objectType}/${objectId}/${Date.now()}_${imageFile.name}`
  const imageRef = ref(storage, imagePath)

  const uploadTask = uploadBytesResumable(imageRef, imageFile)

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setLoadingImage(Math.round(progress))
      },
      (err) => {
        console.error('[uploadImageOnly] upload failed', err)
        reject(err)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        } catch (e) {
          reject(e)
        }
      }
    )
  })
}
