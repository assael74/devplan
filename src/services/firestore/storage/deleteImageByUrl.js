import { ref, deleteObject } from 'firebase/storage'
import { storage } from '../../firebase/firebase.js'

export async function deleteImageByUrl(url) {
  if (!url) return { ok: true, skipped: true }

  try {
    const r = ref(storage, url)
    await deleteObject(r)
    return { ok: true, skipped: false }
  } catch (err) {
    // לא מפילים מחיקה של ישות אם התמונה לא נמחקה (קובץ כבר לא קיים וכו')
    console.warn('[deleteImageByUrl] failed', err)
    return { ok: false, skipped: false, err: String(err?.message || err) }
  }
}
