// C:\projects\devplan\functions\src\services\share\buildReportShareOgImage.js

const { escapeHtml } = require('../../shared/escapeHtml')

function clean(value) {
  return String(value ?? '').trim()
}

function getInitials(name = '') {
  const parts = clean(name)
    .split(/\s+/)
    .filter(Boolean)

  const initials = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return initials || 'DP'
}

function normalizeImageUrl(imageUrl = '', origin = '') {
  const safe = clean(imageUrl)
  if (!safe) return ''

  if (/^data:/i.test(safe)) return safe
  if (/^https?:\/\//i.test(safe)) return safe

  const base = clean(origin).replace(/\/$/, '')
  if (!base) return safe

  return `${base}${safe.startsWith('/') ? '' : '/'}${safe}`
}

async function embedImageAsDataUri(imageUrl = '') {
  const safe = clean(imageUrl)
  if (!safe || /^data:/i.test(safe)) return safe

  try {
    const response = await fetch(safe)
    if (!response.ok) return ''

    const contentType = response.headers.get('content-type') || 'image/png'
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('[buildReportShareOgImage] failed to embed image', error)
    return ''
  }
}

function buildMetaRow({ label, value, y }) {
  const safeLabel = escapeHtml(label)
  const safeValue = escapeHtml(value)

  return `
    <text x="996" y="${y}" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-size="23" fill="#475569" font-weight="700">${safeValue}</text>
    <text x="1020" y="${y}" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-size="18" fill="#64748B">${safeLabel}</text>
  `
}

async function buildReportShareOgImage({
  title = 'דוח',
  subtitle = '',
  entityName = '',
  reportDate = '',
  avatarUrl = '',
  origin = '',
  metaItems = [],
  reportTypeLabel = '',
  clubName = '',
  coachName = '',
  teamYear = '',
  season = '',
} = {}) {
  const normalizedAvatarUrl = normalizeImageUrl(avatarUrl, origin)
  const embeddedAvatar = await embedImageAsDataUri(normalizedAvatarUrl)
  const avatarHref = embeddedAvatar || normalizedAvatarUrl
  const initials = getInitials(entityName)

  const rows = [
    clubName ? { label: 'מועדון', value: clubName } : null,
    coachName ? { label: 'מאמן', value: coachName } : null,
    teamYear ? { label: 'שנתון', value: teamYear } : null,
    season ? { label: 'עונה', value: season } : null,
    ...metaItems
      .filter(Boolean)
      .slice(0, 4)
      .map((item) => ({
        label: item.label || item.shortLabel || '',
        value: item.value || item.text || item.count || '',
      })),
  ].filter((item) => item && item.label && item.value)

  const rowsMarkup = rows
    .slice(0, 4)
    .map((row, index) => buildMetaRow({
      label: row.label,
      value: row.value,
      y: 358 + (index * 58),
    }))
    .join('\n')

  const safeTitle = escapeHtml(title)
  const safeSubtitle = escapeHtml(subtitle)
  const safeEntityName = escapeHtml(entityName)
  const safeReportDate = escapeHtml(reportDate)
  const safeReportTypeLabel = escapeHtml(reportTypeLabel)
  const safeInitials = escapeHtml(initials)

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F7FAFC" />
      <stop offset="100%" stop-color="#ECFDF5" />
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#16A34A" />
      <stop offset="100%" stop-color="#0F766E" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#0F172A" flood-opacity="0.12" />
    </filter>
    <clipPath id="avatarClip">
      <circle cx="0" cy="0" r="60" />
    </clipPath>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />

  <g filter="url(#shadow)">
    <rect x="36" y="36" width="1128" height="558" rx="34" fill="#FFFFFF" />
    <rect x="36" y="36" width="1128" height="124" rx="34" fill="url(#accent)" />
    <rect x="36" y="126" width="1128" height="34" fill="#FFFFFF" opacity="0.08" />
  </g>

  ${safeReportTypeLabel ? `<text x="1048" y="96" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-size="22" fill="#FFFFFF" font-weight="700">${safeReportTypeLabel}</text>` : ''}
  <text x="1048" y="128" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-size="42" fill="#FFFFFF" font-weight="800">${safeTitle}</text>
  <text x="1048" y="166" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-size="23" fill="#DCFCE7" font-weight="700">${safeEntityName}</text>

  <g transform="translate(164 98)">
    <circle cx="0" cy="0" r="58" fill="#FFFFFF" opacity="0.2" />
    <circle cx="0" cy="0" r="54" fill="#FFFFFF" />
    ${avatarHref ? `<image href="${escapeHtml(avatarHref)}" x="-54" y="-54" width="108" height="108" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice" />` : ''}
    ${!avatarHref ? `<text x="0" y="10" text-anchor="middle" font-size="34" fill="#14532D" font-weight="800">${safeInitials}</text>` : ''}
  </g>

  <text x="1048" y="206" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-size="21" fill="#E2E8F0">${safeReportDate}</text>

  <text x="1048" y="290" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-size="26" fill="#0F172A" font-weight="800">${safeSubtitle || 'תמונת מצב מקצועית של תכנון הסגל לעונה'}</text>

  ${rowsMarkup}

  ${safeReportTypeLabel ? `<text x="1048" y="548" text-anchor="end" direction="rtl" unicode-bidi="plaintext" font-size="18" fill="#64748B">${safeReportTypeLabel}</text>` : ''}
</svg>`
}

module.exports = { buildReportShareOgImage }
