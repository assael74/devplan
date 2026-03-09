export function getDrivePreviewLink(link = '') {
  if (!link || typeof link !== 'string') return null;

  const fileMatch = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;

  const idMatch = link.match(/id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;

  return null;
}

export function getDriveFileId(link = '') {
  if (!link || typeof link !== 'string') return null;

  const match = link.match(/(?:\/file\/d\/|id=|\/open\?id=|\/uc\?id=)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
