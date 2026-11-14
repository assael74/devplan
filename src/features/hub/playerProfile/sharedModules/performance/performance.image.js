// src/features/hub/playerProfile/sharedModules/performance/performance.image.js

import { devPlanColors as colors } from '../../../../../ui/core/theme/Colors.js'
import { getParamFamilyTone } from '../../../../../ui/forms/gameStats/sx/paramFamilies.sx.js'
import { createImage } from '../../../../../ui/domains/entityImage/entityImage.logic.js'
import { getPerformanceGapBackground, getPerformanceShareColumnWidths } from './performanceShare.sx.js'

const WIDTH = 960
const PADDING = 32
const CONTENT = WIDTH - PADDING * 2
const AVATAR_SIZE = 30
const avatarImages = new WeakMap()

async function loadAvatarSource(source) {
  try {
    // Reload with CORS before decoding, rather than reusing a normal <img> cache entry.
    const response = await fetch(source, { mode: 'cors', cache: 'reload' })
    if (!response.ok) throw new Error('avatar response failed')
    const url = URL.createObjectURL(await response.blob())
    try { return await createImage(url) } finally { URL.revokeObjectURL(url) }
  } catch (_) {
    return createImage(source)
  }
}

async function loadReportAvatar(avatar) {
  if (!avatar) return null
  if (avatarImages.has(avatar)) return avatarImages.get(avatar)
  const source = avatar.src || avatar.fallback
  const loading = loadAvatarSource(source).catch(async () => {
    if (avatar.fallback && avatar.fallback !== source) {
      try { return await loadAvatarSource(avatar.fallback) } catch (_) { /* Export the table without an avatar. */ }
    }
    return null
  })
  avatarImages.set(avatar, loading)
  return loading
}

function drawReportAvatar(context, image, rtl) {
  const x = rtl ? WIDTH - PADDING - AVATAR_SIZE : PADDING
  const y = 10
  context.save()
  context.beginPath()
  context.arc(x + AVATAR_SIZE / 2, y + AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2)
  context.fillStyle = colors.primaryLight
  context.fill()
  context.clip()
  if (image) {
    const side = Math.min(image.naturalWidth, image.naturalHeight)
    context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, x, y, AVATAR_SIZE, AVATAR_SIZE)
  }
  context.restore()
}

function wrapText(context, text, width) {
  const lines = []
  let line = ''
  for (const paragraph of String(text || '').split('\n')) {
    line = ''
    for (const word of paragraph.split(/\s+/)) {
      const next = line ? `${line} ${word}` : word
      if (line && context.measureText(next).width > width) {
        lines.push(line)
        line = word
      } else line = next
    }
    if (line) lines.push(line)
  }
  return lines
}

function layoutHeader(context, report, font) {
  const groups = [
    [
      { text: report.title, size: 22, weight: 700, color: colors.surface },
      { text: report.team, size: 15, color: colors.primaryLight },
      { text: report.heading, size: 17, weight: 600, color: colors.surface, alignEnd: true },
    ],
    report.details.map(text => ({ text, size: 14, color: colors.primaryLight })),
  ]
  const placements = []
  let y = 25
  groups.forEach((items, groupIndex) => {
    const lineStart = groupIndex === 0 && report.playerAvatar ? AVATAR_SIZE + 12 : 0
    let used = lineStart
    const lineHeight = groupIndex === 0 ? 30 : 22
    for (const item of items) {
      context.font = `${item.weight || 400} ${item.size}px ${font}`
      for (const line of wrapText(context, item.text, CONTENT - lineStart)) {
        const width = context.measureText(line).width
        if (used > lineStart && used + width > CONTENT) { used = lineStart; y += lineHeight }
        placements.push({ ...item, text: line, offset: item.alignEnd ? CONTENT - width : used, y })
        used += width + 22
      }
    }
    if (used) y += lineHeight
  })
  return { placements, height: y + 3 }
}

export async function createPerformanceImage(report) {
  let font = getComputedStyle(document.body).fontFamily || 'Arial, sans-serif'
  // A canvas alone may not trigger webfont loading before its first measurement.
  if (document.fonts?.load) {
    try {
      await Promise.all([400, 600, 700].map(weight => document.fonts.load(`${weight} 18px ${font}`, 'ביצועים')))
    } catch (_) { font = 'Arial, sans-serif' }
  }
  const avatarImage = await loadReportAvatar(report.playerAvatar)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas unavailable')
  const rtl = getComputedStyle(document.documentElement).direction === 'rtl'
  const indices = report.columnIndices || report.columns.map((_, index) => index)
  const columnWidths = getPerformanceShareColumnWidths(report.sourceColumnCount || report.columns.length, indices).map(part => part * CONTENT)
  const benchmarkStart = report.benchmark ? report.benchmark.columnStart : Infinity
  const setFont = (size, weight = 400) => { context.font = `${weight} ${size}px ${font}` }
  const rows = report.rows.map(row => {
    const cells = indices.map((sourceIndex, index) => {
      const isLabel = sourceIndex === 0
      const size = isLabel ? 18 : sourceIndex >= benchmarkStart ? 16 : 21
      setFont(size, 600)
      const lines = wrapText(context, isLabel ? row.label : row.values[sourceIndex - 1], columnWidths[index] - 32)
      setFont(14)
      const notes = isLabel ? wrapText(context, row.note, columnWidths[index] - 32) : []
      return { sourceIndex, isLabel, size, lines, notes }
    })
    const height = Math.max(50, ...cells.map(cell => cell.lines.length * 24 + cell.notes.length * 19 + 18))
    return { ...row, cells, height }
  })
  setFont(16, 600)
  const columnLines = report.columns.map((label, index) => wrapText(context, label, columnWidths[index] - 24))
  const tableHeaderHeight = Math.max(42, ...columnLines.map(lines => lines.length * 20 + 16))
  const header = layoutHeader(context, avatarImage ? report : { ...report, playerAvatar: null }, font)
  const headerHeight = header.height
  const tableY = headerHeight
  const height = tableY + tableHeaderHeight + rows.reduce((sum, row) => sum + row.height, 0)
  canvas.width = WIDTH * 2
  canvas.height = height * 2
  context.scale(2, 2)
  context.direction = rtl ? 'rtl' : 'ltr'
  context.textBaseline = 'middle'
  context.fillStyle = colors.surface
  context.fillRect(0, 0, WIDTH, height)

  const start = rtl ? WIDTH - PADDING : PADDING
  const drawLine = (
    text,
    y,
    size,
    color,
    weight = 400,
    offset = 0,
  ) => {
    setFont(size, weight)
    context.textAlign = rtl ? 'right' : 'left'
    context.fillStyle = color
    context.fillText(text, rtl ? start - offset : start + offset, y)
  }
  context.fillStyle = colors.primaryDark
  context.fillRect(0, 0, WIDTH, headerHeight)
  context.fillStyle = colors.petrol
  context.fillRect(0, headerHeight - 4, WIDTH, 4)
  if (avatarImage) drawReportAvatar(context, avatarImage, rtl)
  header.placements.forEach(item => drawLine(item.text, item.y, item.size, item.color, item.weight || 400, item.offset))

  const cellCenter = index => {
    const offset = columnWidths.slice(0, index).reduce((sum, width) => sum + width, 0) + columnWidths[index] / 2
    return rtl ? WIDTH - PADDING - offset : PADDING + offset
  }
  context.fillStyle = colors.petrol
  context.fillRect(PADDING, tableY, CONTENT, tableHeaderHeight)
  setFont(16, 600)
  context.textAlign = 'center'
  context.fillStyle = colors.surface
  columnLines.forEach((lines, index) => lines.forEach((line, lineIndex) => {
    context.fillText(line, cellCenter(index), tableY + tableHeaderHeight / 2 + (lineIndex - (lines.length - 1) / 2) * 20)
  }))
  let rowTop = tableY + tableHeaderHeight
  for (const row of rows) {
    const y = rowTop
    context.fillStyle = getParamFamilyTone(row.id).selectedBg
    context.fillRect(PADDING, y, CONTENT, row.height)
    row.cells.forEach((cell, index) => {
      if (cell.sourceIndex >= benchmarkStart) {
        context.fillStyle = colors.primaryLight
        context.fillRect(cellCenter(index) - columnWidths[index] / 2, y, columnWidths[index], row.height)
      }
      const background = getPerformanceGapBackground(row.cellTones?.[cell.sourceIndex - 1])
      if (!background) return
      context.fillStyle = background
      context.fillRect(cellCenter(index) - columnWidths[index] / 2, y, columnWidths[index], row.height)
    })
    context.fillStyle = colors.border
    context.fillRect(PADDING, y + row.height - 1, CONTENT, 1)
    row.cells.forEach((cell, index) => {
      setFont(cell.size, 600)
      context.fillStyle = colors.text
      context.textAlign = cell.isLabel ? rtl ? 'right' : 'left' : 'center'
      const x = cell.isLabel
        ? cellCenter(index) + (rtl ? 1 : -1) * (columnWidths[index] / 2 - 16)
        : cellCenter(index)
      cell.lines.forEach((line, lineIndex) => context.fillText(line, x, cell.isLabel ? y + 23 + lineIndex * 24 : y + row.height / 2 + (lineIndex - (cell.lines.length - 1) / 2) * 24))
      setFont(14)
      context.fillStyle = colors.subText
      cell.notes.forEach((line, lineIndex) => context.fillText(line, x, y + 22 + cell.lines.length * 24 + lineIndex * 19))
    })
    rowTop += row.height
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('image export failed')), 'image/png')
  })
}

export function copyPerformanceImage(blob) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    return Promise.reject(new Error('image clipboard unavailable'))
  }
  return navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}

export function downloadPerformanceImage(blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'DevPlan-performance.png'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
