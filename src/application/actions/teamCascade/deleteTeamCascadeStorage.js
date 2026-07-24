// src/application/actions/teamCascade/deleteTeamCascadeStorage.js

import { deleteImageByUrl } from '../../../services/firestore/storage/deleteImageByUrl.js'

const uniq = values => Array.from(new Set((values || []).filter(Boolean)))

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

  const items = await Promise.all(
    urls.map(async url => {
      const result = await deleteImageByUrl(url)

      return {
        url,
        ok: result?.ok !== false,
        skipped: result?.skipped === true,
        result,
      }
    })
  )

  return {
    label: 'storage',
    skipped: false,
    total: urls.length,
    deleted: items.filter(item => item.ok && !item.skipped).length,
    failed: items.filter(item => !item.ok).length,
    items,
  }
}
