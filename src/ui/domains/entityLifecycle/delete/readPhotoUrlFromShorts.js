import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../../services/firebase/firebase.js'
import { shortsRefs } from '../../../../services/firestore/shorts/shorts.refs.js'

export async function readPhotoUrlFromShorts({ shortKey, id }) {
  if (!shortKey || !id) return ''

  const [group, docName] = String(shortKey).split('.')
  const meta = shortsRefs?.[group]?.[docName]
  if (!meta?.collection || !meta?.docId) return ''

  const refDoc = doc(db, meta.collection, meta.docId)
  const snap = await getDoc(refDoc)
  if (!snap.exists()) return ''

  const data = snap.data() || {}
  const list = Array.isArray(data?.list) ? data.list : []
  const item = list.find((x) => x?.id === id) || null
  return String(item?.photo || '')
}
