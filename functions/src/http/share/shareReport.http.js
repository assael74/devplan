// C:\projects\devplan\functions\src\http\share\shareReport.http.js

const { onRequest } = require('firebase-functions/v2/https')

const { db } = require('../../config/admin')
const { clean } = require('../../shared/clean')
const { buildAppUrl } = require('../../shared/buildAppUrl')

const { buildReportShareOgHtml } = require('../../services/share/buildReportShareOgHtml')
const { buildReportShareOgImage } = require('../../services/share/buildReportShareOgImage')

const PUBLIC_REPORTS_COLLECTION = 'publicReports'

function parseSharePath(path = '') {
  const parts = String(path)
    .split('/')
    .map((part) => clean(part))
    .filter(Boolean)

  const reportIndex = parts.indexOf('reports')
  if (reportIndex < 0) {
    return {
      reportId: '',
      versionId: '',
      isImage: false,
    }
  }

  const tail = parts.slice(reportIndex + 1)
  const reportId = tail[0] || ''
  const rest = tail.slice(1)
  const isImage = rest.length > 0 && rest[rest.length - 1] === 'image'
  const versionId = isImage ? (rest.length > 1 ? rest[0] : '') : (rest[0] || '')

  return {
    reportId,
    versionId: versionId === 'image' ? '' : versionId,
    isImage,
  }
}

function pickReportContent(report = {}) {
  return report?.reportContent || {}
}

function pickEntity(reportContent = {}) {
  return reportContent?.entity || {}
}

function pickTitle(report = {}) {
  const reportContent = pickReportContent(report)
  const meta = reportContent?.meta || {}

  return clean(meta.title || reportContent.title || report.reportType || 'דוח')
}

function pickSubtitle(report = {}) {
  const reportContent = pickReportContent(report)
  const meta = reportContent?.meta || {}

  return clean(meta.subtitle || reportContent.subtitle || '')
}

function pickReportDate(report = {}) {
  const reportContent = pickReportContent(report)
  const meta = reportContent?.meta || {}

  return clean(meta.reportDate || reportContent.reportDate || '')
}

function pickMetaItems(report = {}) {
  const reportContent = pickReportContent(report)
  const meta = reportContent?.meta || {}

  return Array.isArray(meta.items) ? meta.items : []
}

function buildRedirectUrl({ reportId, versionId = '' }) {
  return versionId
    ? buildAppUrl(`/r/${reportId}/${versionId}`)
    : buildAppUrl(`/r/${reportId}`)
}

function buildPageUrl({ reportId, versionId = '' }) {
  return versionId
    ? buildAppUrl(`/share/reports/${reportId}/${versionId}`)
    : buildAppUrl(`/share/reports/${reportId}`)
}

function buildImageUrl({ reportId, versionId = '' }) {
  return versionId
    ? buildAppUrl(`/share/reports/${reportId}/${versionId}/image`)
    : buildAppUrl(`/share/reports/${reportId}/image`)
}

async function loadCurrentReport(reportId) {
  const snap = await db.collection(PUBLIC_REPORTS_COLLECTION).doc(reportId).get()
  if (!snap.exists) return null

  const data = snap.data() || {}

  return {
    id: snap.id,
    reportId: snap.id,
    ...data,
  }
}

async function loadVersionReport(reportId, versionId) {
  const [versionSnap, currentSnap] = await Promise.all([
    db.collection(PUBLIC_REPORTS_COLLECTION)
      .doc(reportId)
      .collection('versions')
      .doc(versionId)
      .get(),
    db.collection(PUBLIC_REPORTS_COLLECTION).doc(reportId).get(),
  ])

  const currentData = currentSnap.exists ? (currentSnap.data() || {}) : {}

  if (currentSnap.exists && currentData.currentVersionId === versionId) {
    return {
      id: currentSnap.id,
      reportId: currentSnap.id,
      versionId,
      ...currentData,
      reportContent: {
        ...(currentData.reportContent || {}),
      },
    }
  }

  if (!versionSnap.exists) return null

  const versionData = versionSnap.data() || {}

  return {
    id: versionSnap.id,
    reportId,
    versionId,
    ...currentData,
    ...versionData,
    reportContent: {
      ...(currentData.reportContent || {}),
      ...(versionData.reportContent || {}),
    },
  }
}

async function loadReport({ reportId, versionId = '' }) {
  if (!reportId) return null

  if (versionId) {
    return loadVersionReport(reportId, versionId)
  }

  return loadCurrentReport(reportId)
}

function buildDefaultHtml({ reportId, versionId = '' }) {
  const pageUrl = buildPageUrl({ reportId, versionId })
  const redirectUrl = buildRedirectUrl({ reportId, versionId })
  const imageUrl = buildImageUrl({ reportId, versionId })

  return buildReportShareOgHtml({
    title: 'דוח',
    description: 'שיתוף דוח DevPlan',
    image: imageUrl,
    pageUrl,
    redirectUrl,
  })
}

function buildReportShareDescription(report = {}) {
  const reportContent = pickReportContent(report)
  const entity = pickEntity(reportContent)
  const metaItems = pickMetaItems(report)
  const subtitle = pickSubtitle(report)
  const reportDate = pickReportDate(report)
  const pieces = []

  if (subtitle) {
    pieces.push(subtitle)
  }

  if (entity?.name) {
    pieces.push(`קבוצה: ${clean(entity.name)}`)
  }

  if (reportDate) {
    pieces.push(`תאריך: ${reportDate}`)
  }

  metaItems.slice(0, 2).forEach((item) => {
    const label = clean(item?.label || item?.shortLabel)
    const value = clean(item?.value || item?.text || item?.count)
    if (label && value) {
      pieces.push(`${label}: ${value}`)
    }
  })

  return pieces.join(' · ')
}

async function buildFallbackImage() {
  return buildReportShareOgImage({
    title: 'דוח',
    subtitle: 'תמונת מצב מקצועית של תכנון הסגל לעונה',
    entityName: '',
    reportDate: '',
    avatarUrl: '',
    origin: 'https://devplan-b4454.web.app',
    metaItems: [],
    reportTypeLabel: '',
  })
}

const shareReport = onRequest({ region: 'europe-west1' }, async (req, res) => {
  try {
    const { reportId, versionId, isImage } = parseSharePath(req.path)

    if (!reportId) {
      return res.status(400).send('missing report id')
    }

    const report = await loadReport({
      reportId,
      versionId,
    })

    const pageUrl = buildPageUrl({ reportId, versionId })
    const redirectUrl = buildRedirectUrl({ reportId, versionId })
    const imageUrl = buildImageUrl({ reportId, versionId })

    if (isImage) {
      if (!report) {
        const fallbackImage = await buildFallbackImage()
        res.set('Content-Type', 'image/svg+xml; charset=utf-8')
        res.set('Cache-Control', 'public, max-age=300')
        return res.status(200).send(fallbackImage)
      }

      const reportContent = pickReportContent(report)
      const entity = pickEntity(reportContent)
      const meta = reportContent?.meta || {}
      const metaItems = Array.isArray(meta.items) ? meta.items : []
      const avatarUrl = clean(entity?.avatarUrl || entity?.imageUrl || entity?.logo || '')

      const image = await buildReportShareOgImage({
        title: pickTitle(report),
        subtitle: pickSubtitle(report),
        entityName: clean(entity?.name || entity?.teamName || ''),
        reportDate: pickReportDate(report),
        avatarUrl,
        origin: 'https://devplan-b4454.web.app',
        metaItems,
        reportTypeLabel: '',
        clubName: clean(
          metaItems.find((item) => clean(item?.label) === 'מועדון')?.value || ''
        ),
        coachName: clean(
          metaItems.find((item) => clean(item?.label) === 'מאמן')?.value || ''
        ),
        teamYear: clean(
          metaItems.find((item) => clean(item?.label) === 'שנתון')?.value || ''
        ),
        season: clean(
          metaItems.find((item) => clean(item?.label) === 'עונה')?.value || ''
        ),
      })

      res.set('Content-Type', 'image/svg+xml; charset=utf-8')
      res.set('Cache-Control', 'public, max-age=3600')
      return res.status(200).send(image)
    }

    if (!report) {
      const fallback = buildDefaultHtml({ reportId, versionId })
      res.set('Cache-Control', 'public, max-age=60')
      return res.status(200).send(fallback)
    }

    const description = buildReportShareDescription(report)

    const html = buildReportShareOgHtml({
      title: pickTitle(report),
      description,
      image: imageUrl,
      pageUrl,
      redirectUrl,
    })

    res.set('Cache-Control', 'public, max-age=300')
    return res.status(200).send(html)
  } catch (error) {
    console.error('shareReport failed', error)
    return res.status(500).send('internal error')
  }
})

module.exports = { shareReport }
