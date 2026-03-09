// shared/video/cleanVideoLink.js
export function cleanVideoLink(rawLink = '') {
  if (!rawLink || typeof rawLink !== 'string') return '';

  const trimmedLink = rawLink.trim();
  let videoId = '';

  // === Google Drive ===
  if (trimmedLink.includes('drive.google.com')) {
    const match = trimmedLink.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (match?.[1]) {
      videoId = match[1];
    } else {
      const searchId = new URLSearchParams(new URL(trimmedLink).search).get('id');
      if (searchId) videoId = searchId;
    }

    if (videoId) return `https://drive.google.com/uc?id=${videoId}`;
    return ''; // לא זוהה ID תקף
  }

  // === YouTube רגיל ===
  if (trimmedLink.includes('youtube.com/watch')) {
    const videoId = new URLSearchParams(new URL(trimmedLink).search).get('v');
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    return '';
  }

  // === YouTube קצר ===
  if (trimmedLink.includes('youtu.be')) {
    const id = trimmedLink.split('youtu.be/')[1];
    if (id) return `https://www.youtube.com/embed/${id}`;
    return '';
  }

  // === קישור embed או firebase ===
  if (
    trimmedLink.startsWith('https://') &&
    (trimmedLink.includes('firebasestorage.googleapis.com') ||
     trimmedLink.includes('youtube.com/embed') ||
     trimmedLink.includes('drive.google.com/uc'))
  ) {
    return trimmedLink;
  }

  // קלט לא תקף
  return '';
}
