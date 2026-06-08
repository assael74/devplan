// src/shared/entityLifecycle/cascade/team/deleteTeamCascadeStorage.js

import { ref, deleteObject } from 'firebase/storage'
import { storage } from '../../../../services/firebase/firebase.js'

const uniq = arr => Array.from(new Set((arr || []).filter(Boolean)))

const deleteStorageUrl = async url => {
  try {
    const storageRef = ref(storage, url)
    await deleteObject(storageRef)
    return { url, ok: true }
  } catch (error) {
    console.warn('[teamCascadeDelete] delete storage failed', { url, error })
    return { url, ok: false, error }
  }
}

export async function deleteTeamCascadeStorage({ plan }) {
  const urls = uniq([
    plan?.photoUrls?.team,
    ...(plan?.photoUrls?.players || []),
  ])

  if (!urls.length) {
    return {
      label: 'storage',
      skipped: true,
      total: 0,
      deleted: 0,
      failed: 0,
      items: [],
    }
  }

  const items = await Promise.all(urls.map(deleteStorageUrl))
  const deleted = items.filter(x => x.ok).length
  const failed = items.filter(x => !x.ok).length

  return {
    label: 'storage',
    skipped: false,
    total: urls.length,
    deleted,
    failed,
    items,
  }
}
