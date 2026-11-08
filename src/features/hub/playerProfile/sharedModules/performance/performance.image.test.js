// src/features/hub/playerProfile/sharedModules/performance/performance.image.test.js

import { createImage } from '../../../../../ui/domains/entityImage/entityImage.logic.js'
import { createPerformanceImage } from './performance.image.js'

jest.mock('../../../../../ui/domains/entityImage/entityImage.logic.js', () => ({ createImage: jest.fn() }))

const photo = { naturalWidth: 48, naturalHeight: 48 }
const reportWith = avatar => ({
  title: 'שחקן · דוח ביצועים', team: '', heading: 'סיכום', details: [],
  columns: ['מדד', 'סה״כ', 'הצלחות', 'אחוז הצלחה'],
  rows: [{ id: 'passes', label: 'מסירות', values: ['20', '15', '75%'] }],
  playerAvatar: avatar,
})

let context
let imageBlob
let fetchBefore
let createUrlBefore
let revokeUrlBefore

beforeAll(() => {
  fetchBefore = global.fetch
  createUrlBefore = URL.createObjectURL
  revokeUrlBefore = URL.revokeObjectURL
})

beforeEach(() => {
  imageBlob = new Blob(['image'], { type: 'image/png' })
  global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => imageBlob })
  URL.createObjectURL = jest.fn(() => 'blob:export-avatar')
  URL.revokeObjectURL = jest.fn()
  createImage.mockReset().mockResolvedValue(photo)
  context = Object.fromEntries(['scale', 'fillRect', 'save', 'restore', 'beginPath', 'arc', 'fill', 'clip', 'drawImage', 'fillText'].map(key => [key, jest.fn()]))
  context.measureText = value => ({ width: String(value).length * 8 })
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context)
  jest.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(imageBlob))
})

afterEach(() => jest.restoreAllMocks())

afterAll(() => {
  global.fetch = fetchBefore
  URL.createObjectURL = createUrlBefore
  URL.revokeObjectURL = revokeUrlBefore
})

test('exports the actual photo from a freshly fetched blob and reuses it while changing table selection', async () => {
  const report = reportWith({ src: 'https://photos.example/player.jpg', fallback: '/default.jpg' })
  expect(await createPerformanceImage(report)).toBe(imageBlob)
  expect(fetch).toHaveBeenCalledWith(report.playerAvatar.src, { mode: 'cors', cache: 'reload' })
  expect(createImage).toHaveBeenCalledWith('blob:export-avatar')
  expect(createImage).not.toHaveBeenCalledWith('/default.jpg')
  expect(context.drawImage).toHaveBeenCalledWith(photo, 0, 0, 48, 48, expect.any(Number), 10, 30, 30)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:export-avatar')
  await createPerformanceImage({ ...report, columnIndices: [0, 1], sourceColumnCount: 4, columns: ['מדד', 'סה״כ'] })
  expect(fetch).toHaveBeenCalledTimes(1)
})

test('can use the original CORS image when fetching a blob is unavailable', async () => {
  fetch.mockRejectedValue(new Error('fetch blocked'))
  const report = reportWith({ src: 'https://photos.example/player.jpg', fallback: '/default.jpg' })
  await createPerformanceImage(report)
  expect(createImage).toHaveBeenCalledWith(report.playerAvatar.src)
  expect(createImage).not.toHaveBeenCalledWith('/default.jpg')
})

test('an unavailable player photo falls back without blocking export', async () => {
  fetch.mockRejectedValue(new Error('CORS blocked'))
  createImage.mockImplementation(source => source === '/default.jpg' ? Promise.resolve(photo) : Promise.reject(new Error('image blocked')))
  const report = reportWith({ src: 'https://photos.example/player.jpg', fallback: '/default.jpg' })
  await expect(createPerformanceImage(report)).resolves.toBe(imageBlob)
  expect(createImage).toHaveBeenCalledWith('/default.jpg')
  expect(context.drawImage).toHaveBeenCalled()
  expect(fetch).toHaveBeenCalledTimes(2)
})

test('both photo and fallback can fail without blocking the exported table', async () => {
  fetch.mockRejectedValue(new Error('image unavailable'))
  createImage.mockRejectedValue(new Error('image unavailable'))
  const report = reportWith({ src: 'https://photos.example/player.jpg', fallback: '/default.jpg' })
  await expect(createPerformanceImage(report)).resolves.toBe(imageBlob)
  expect(context.drawImage).not.toHaveBeenCalled()
  expect(context.fillText).toHaveBeenCalledWith('מסירות', expect.any(Number), expect.any(Number))
})

test('uses the canonical default when the player has no photo', async () => {
  const report = reportWith({ src: '/default.jpg', fallback: '/default.jpg' })
  await expect(createPerformanceImage(report)).resolves.toBe(imageBlob)
  expect(fetch).toHaveBeenCalledWith('/default.jpg', { mode: 'cors', cache: 'reload' })
})

test('revokes temporary URLs even when decoding fails', async () => {
  createImage.mockRejectedValue(new Error('invalid image'))
  const report = reportWith({ src: 'https://photos.example/player.jpg', fallback: '/default.jpg' })
  await expect(createPerformanceImage(report)).resolves.toBe(imageBlob)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:export-avatar')
})
