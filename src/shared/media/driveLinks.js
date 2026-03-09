// src/shared/media/driveLinks.js
export function getDriveFileId(link = '') {
  if (!link || typeof link !== 'string') return null

  // תומך בכמה פורמטים נפוצים
  const match =
    link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
    link.match(/\/d\/([a-zA-Z0-9_-]{10,})/)?.[1] ||
    link.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1] ||
    link.match(/\/open\?id=([a-zA-Z0-9_-]+)/)?.[1] ||
    link.match(/\/uc\?id=([a-zA-Z0-9_-]+)/)?.[1]

  return match || null
}

export function getDrivePreviewUrl(link = '') {
  const id = getDriveFileId(link)
  return id ? `https://drive.google.com/file/d/${id}/preview` : null
}

export function getDriveDownloadUrl(link = '') {
  const id = getDriveFileId(link)
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : link || null
}

export function getDriveThumbUrl(link = '') {
  const id = getDriveFileId(link)
  return id ? `https://drive.google.com/thumbnail?sz=w640-h360&id=${id}` : null
}
