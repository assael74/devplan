// src/features/hub/playerProfile/sharedModules/performance/PlayerPerformanceModule.test.js

import React from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import PlayerPerformanceModule from './PlayerPerformanceModule.js'
import { usePlayerPerformanceData } from '../../sharedLogic/performance/usePlayerPerformanceData.js'
import { usePlayerGamesStatsActions } from '../games/model/usePlayerGamesStatsActions.js'
import { createPerformanceImage, downloadPerformanceImage } from './performance.image.js'
import { getPerformanceGapBackground } from './performanceShare.sx.js'

jest.mock('../../../../../ui/core/icons/iconUi.js', () => ({ iconUi: () => null }))
jest.mock('../../../../../shared/performance/filters/statsFilterGroups.js', () => ({ statsFilterGroups: [] }))
jest.mock('../../sharedLogic/performance/usePlayerPerformanceData.js', () => ({ usePlayerPerformanceData: jest.fn() }))
jest.mock('../games/model/usePlayerGamesStatsActions.js', () => ({ usePlayerGamesStatsActions: jest.fn() }))
jest.mock('./components/PerformanceTrend.js', () => () => null)
jest.mock('./performance.image.js', () => ({
  ...jest.requireActual('./performance.image.js'),
  createPerformanceImage: jest.fn(),
  downloadPerformanceImage: jest.fn(),
}))

let onEdit
let writeText
let writeImage
let imageBlob
const makePlayer = (kind = 'regular') => ({
  id: 'p1', playerFullName: 'שי רוזן', primaryPosition: 'DCR',
  type: kind, isPrivatePlayer: kind === 'private', playerSource: kind === 'private' ? 'private' : 'club',
  playerGames: [{
    id: 'g1', type: 'cup', rivel: 'בני סכנין', gameDate: '2026-10-28', gameDuration: 90,
    playerStats: [{ playerId: 'p1', timePlayed: 65, timeVideoStats: 60, passesTotal: 30, passesSuccess: 24 }],
  }],
})

beforeEach(() => {
  onEdit = jest.fn()
  writeText = jest.fn().mockResolvedValue(undefined)
  writeImage = jest.fn().mockResolvedValue(undefined)
  imageBlob = new Blob(['png'], { type: 'image/png' })
  createPerformanceImage.mockResolvedValue(imageBlob)
  downloadPerformanceImage.mockReset()
  window.ClipboardItem = class ClipboardItem {
    constructor(data) { this.data = data }
  }
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText, write: writeImage } })
  usePlayerPerformanceData.mockImplementation(entity => ({ player: entity, loading: false, refreshing: false, error: null, refresh: jest.fn() }))
  usePlayerGamesStatsActions.mockImplementation(() => ({ editingStatsGame: null, handleOpenStatsGame: onEdit, statsSavePending: false }))
})

test.each(['regular', 'project', 'private'])('%s: game data opens the existing stats editor', kind => {
  render(<PlayerPerformanceModule entity={makePlayer(kind)} />)
  expect(screen.getByRole('table', { name: 'משחקי השחקן לביצועים' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'עריכת סטטיסטיקה נגד בני סכנין' }))
  expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'g1', type: 'cup' }))
})

test('switches to normalized and position views with 80 or 90 minute controls', () => {
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'נרמול' }))
  expect(screen.getByText('ממוצע מנורמל למשך המשחק בקבוצת הגיל')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('combobox', { name: 'בסיס הנרמול' }))
  fireEvent.click(screen.getByRole('option', { name: 'נרמול ל־80 דקות' }))
  expect(screen.getByText('ממוצע מנורמל ל־80 דקות')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'השוואה לעמדה' }))
  const table = screen.getByRole('table', { name: 'השוואת השחקן לתקן העמדה' })
  expect(within(table).getByText('מסירות')).toBeInTheDocument()
  expect(within(table).getByText('40')).toBeInTheDocument()
})

test('WhatsApp preview is editable and copying uses the visible message', async () => {
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  fireEvent.click(screen.getByRole('button', { name: 'טקסט לעריכה' }))
  const text = screen.getByRole('textbox', { name: 'נוסח ההודעה לשחקן' })
  expect(text.value).toContain('בני סכנין')
  expect(text.value).toContain('30 סה״כ')
  fireEvent.change(text, { target: { value: 'שי, הנה נתוני המשחק שלך' } })
  const dialog = screen.getByRole('dialog')
  fireEvent.click(within(dialog).getByRole('button', { name: 'העתקת טקסט לוואטסאפ' }))
  expect(await screen.findByRole('status')).toHaveTextContent('ההודעה הועתקה')
  expect(writeText).toHaveBeenCalledWith('שי, הנה נתוני המשחק שלך')
})

test('failed clipboard access retains a selectable message for manual copying', async () => {
  writeText.mockRejectedValue(new Error('clipboard blocked'))
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  fireEvent.click(screen.getByRole('button', { name: 'טקסט לעריכה' }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'העתקת טקסט לוואטסאפ' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('אפשר להעתיק את הטקסט המסומן ידנית')
  const text = screen.getByRole('textbox', { name: 'נוסח ההודעה לשחקן' })
  expect(text.value).toContain('בני סכנין')
  expect(text.selectionStart).toBe(0)
  expect(text.selectionEnd).toBe(text.value.length)
})

test('the default share table copies a PNG with the same selected game data', async () => {
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  const table = screen.getByRole('table', { name: 'טבלת הביצועים להעתקה' })
  const passes = within(table).getByRole('row', { name: /סה.*מסירות/ })
  expect(within(passes).getByText('30')).toBeInTheDocument()
  expect(within(passes).getByText('24')).toBeInTheDocument()
  expect(within(passes).getByText('80%')).toBeInTheDocument()
  const copy = screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })
  await waitFor(() => expect(copy).toBeEnabled())
  fireEvent.click(copy)
  expect(await screen.findByRole('status')).toHaveTextContent('התמונה הועתקה')
  expect(writeImage.mock.calls[0][0][0].data['image/png']).toBe(imageBlob)
  expect(writeText).not.toHaveBeenCalled()
  expect(createPerformanceImage).toHaveBeenCalledWith(expect.objectContaining({ heading: expect.stringContaining('בני סכנין') }))
})

test('sharing shows a compact player avatar and includes it in the PNG report', async () => {
  const player = { ...makePlayer(), photo: 'https://example.com/player.jpg' }
  render(<PlayerPerformanceModule entity={player} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  expect(within(screen.getByRole('dialog')).getByRole('img', { name: 'תמונת שי רוזן' })).toHaveAttribute('src', player.photo)
  await waitFor(() => expect(screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })).toBeEnabled())
  expect(createPerformanceImage).toHaveBeenLastCalledWith(expect.objectContaining({ playerAvatar: expect.objectContaining({ src: player.photo, fallback: expect.any(String) }) }))
})

test('image clipboard denial leaves PNG download and text copying available', async () => {
  writeImage.mockRejectedValue(new Error('image clipboard blocked'))
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  const copy = screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })
  await waitFor(() => expect(copy).toBeEnabled())
  fireEvent.click(copy)
  expect(await screen.findByRole('alert')).toHaveTextContent('אפשר להוריד PNG')
  fireEvent.click(screen.getByRole('button', { name: 'הורדת PNG' }))
  expect(downloadPerformanceImage).toHaveBeenCalledWith(imageBlob)
  fireEvent.click(screen.getByRole('button', { name: 'טקסט לעריכה' }))
  expect(screen.getByRole('button', { name: 'העתקת טקסט לוואטסאפ' })).toBeEnabled()
})

test('image generation failure still allows sharing editable text', async () => {
  createPerformanceImage.mockRejectedValue(new Error('canvas unavailable'))
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('אפשר לעבור להעתקת טקסט')
  expect(screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'טקסט לעריכה' }))
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'טבלה כתמונה' }))
  expect(screen.getByRole('alert')).toHaveTextContent('אפשר לעבור להעתקת טקסט')
  fireEvent.click(screen.getByRole('button', { name: 'טקסט לעריכה' }))
  fireEvent.click(screen.getByRole('button', { name: 'העתקת טקסט לוואטסאפ' }))
  expect(await screen.findByRole('status')).toHaveTextContent('ההודעה הועתקה')
})

test('a report prepared without a usable player photo can still be copied without an avatar warning', async () => {
  render(<PlayerPerformanceModule entity={{ ...makePlayer(), photo: 'https://example.com/player.jpg' }} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  const copy = screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })
  await waitFor(() => expect(copy).toBeEnabled())
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'נסה להכין שוב' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'הורדת PNG' })).toBeEnabled()
  fireEvent.click(copy)
  expect(await screen.findByRole('status')).toHaveTextContent('התמונה הועתקה')
  expect(writeImage.mock.calls[0][0][0].data['image/png']).toBe(imageBlob)
})

test('the generic share modal closes with Escape and reopening uses the current view', async () => {
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  fireEvent.click(screen.getByRole('button', { name: 'נרמול' }))
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  const table = screen.getByRole('table', { name: 'טבלת הביצועים להעתקה' })
  expect(within(table).getByRole('row', { name: /סה.*מסירות/ })).toHaveTextContent('45')
  expect(within(screen.getByRole('dialog')).getByText('ממוצע מנורמל למשך המשחק בקבוצת הגיל')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })).toBeEnabled())
})

test('normalized sharing allows choosing a benchmark position and never copies the previous image', async () => {
  let finishImage
  const updatedBlob = new Blob(['updated position'], { type: 'image/png' })
  createPerformanceImage.mockResolvedValueOnce(imageBlob).mockImplementationOnce(() => new Promise(resolve => { finishImage = resolve }))
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'נרמול' }))
  fireEvent.click(screen.getByRole('combobox', { name: 'בסיס הנרמול' }))
  fireEvent.click(screen.getByRole('option', { name: 'נרמול ל־80 דקות' }))
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  const copy = screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })
  await waitFor(() => expect(copy).toBeEnabled())
  const table = screen.getByRole('table', { name: 'טבלת הביצועים להעתקה' })
  expect(within(table).getByRole('columnheader', { name: 'תקן — כמות' })).toBeInTheDocument()
  expect(within(table).getByRole('columnheader', { name: 'תקן — אחוז הצלחה' })).toBeInTheDocument()
  expect(within(table).getByRole('columnheader', { name: 'הצלחות' })).toBeInTheDocument()
  expect(within(table).getByText('42')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('combobox', { name: 'עמדה לתקן בדוח' }))
  fireEvent.click(screen.getByRole('option', { name: 'קשר אחורי' }))
  expect(copy).toBeDisabled()
  expect(within(screen.getByRole('dialog')).getByText('תקן לעמדה: קשר אחורי · P50')).toBeInTheDocument()
  expect(createPerformanceImage).toHaveBeenLastCalledWith(expect.objectContaining({ benchmark: expect.objectContaining({ positionId: 'DM' }) }))
  await act(async () => finishImage(updatedBlob))
  await waitFor(() => expect(copy).toBeEnabled())
  fireEvent.click(copy)
  expect(await screen.findByRole('status')).toHaveTextContent('התמונה הועתקה')
  expect(writeImage.mock.calls[0][0][0].data['image/png']).toBe(updatedBlob)
})

test('the shared table colors player cell backgrounds and preserves dark text', async () => {
  const player = makePlayer()
  player.playerGames[0].playerStats[0] = {
    playerId: 'p1', timeVideoStats: 60, passesTotal: 27, passesSuccess: 21, ballLoss: 3,
  }
  render(<PlayerPerformanceModule entity={player} />)
  fireEvent.click(screen.getByRole('button', { name: 'נרמול' }))
  fireEvent.click(screen.getByRole('combobox', { name: 'בסיס הנרמול' }))
  fireEvent.click(screen.getByRole('option', { name: 'נרמול ל־80 דקות' }))
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  const table = screen.getByRole('table', { name: 'טבלת הביצועים להעתקה' })
  const passes = within(table).getByRole('row', { name: /סה.*מסירות/ })
  const loss = within(table).getByRole('row', { name: /איבודי כדור/ })
  const count = within(passes).getByText('36')
  const rate = within(passes).getByText('78%')
  const lossCount = within(loss).getByText('4')
  expect(count).toHaveStyle({ backgroundColor: getPerformanceGapBackground('warning') })
  expect(rate).toHaveStyle({ backgroundColor: getPerformanceGapBackground('warning') })
  expect(lossCount).toHaveStyle({ backgroundColor: getPerformanceGapBackground('danger') })
  expect(getComputedStyle(count).getPropertyValue('--TableCell-dataBackground').trim()).toBe(getPerformanceGapBackground('warning'))
  expect(getComputedStyle(lossCount).getPropertyValue('--TableCell-dataBackground').trim()).toBe(getPerformanceGapBackground('danger'))
  expect(getComputedStyle(count).color).toBe(getComputedStyle(lossCount).color)
  await waitFor(() => expect(screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })).toBeEnabled())
})

test('rows and columns can be hidden and restored in the same share modal', async () => {
  const player = makePlayer()
  player.playerGames[0].playerStats[0].ballLoss = 3
  render(<PlayerPerformanceModule entity={player} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  fireEvent.click(screen.getByRole('button', { name: 'שורות ועמודות' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'הצגת שורה איבודי כדור' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'הצגת עמודה הצלחות' }))
  const toggle = screen.getByRole('button', { name: 'שורות ועמודות' })
  const selection = screen.getByRole('region', { name: 'התאמת שורות ועמודות' })
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(selection).toHaveAttribute('inert')
  expect(screen.queryByRole('checkbox', { name: 'הצגת עמודה הצלחות' })).not.toBeInTheDocument()
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('checkbox', { name: 'הצגת עמודה הצלחות' })).not.toBeChecked()
  const table = screen.getByRole('table', { name: 'טבלת הביצועים להעתקה' })
  expect(within(table).queryByRole('row', { name: /איבודי כדור/ })).not.toBeInTheDocument()
  expect(within(table).queryByRole('columnheader', { name: 'הצלחות' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'טקסט לעריכה' }))
  const text = screen.getByRole('textbox', { name: 'נוסח ההודעה לשחקן' })
  expect(text.value).not.toContain('איבודי כדור')
  expect(text.value).not.toContain('24 הצלחות')
  fireEvent.click(screen.getByRole('checkbox', { name: 'הצגת שורה איבודי כדור' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'הצגת עמודה הצלחות' }))
  expect(text.value).toContain('איבודי כדור')
  expect(text.value).toContain('24 הצלחות')
  fireEvent.click(screen.getByRole('button', { name: 'טבלה כתמונה' }))
  await waitFor(() => expect(screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })).toBeEnabled())
})

test('all columns including the metric name can be hidden and restored without exporting an empty table', async () => {
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  fireEvent.click(screen.getByRole('button', { name: 'שורות ועמודות' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'הצגת עמודה מדד' }))
  let table = screen.getByRole('table', { name: 'טבלת הביצועים להעתקה' })
  expect(within(table).queryByRole('columnheader', { name: 'מדד' })).not.toBeInTheDocument()
  expect(within(table).queryByRole('rowheader')).not.toBeInTheDocument()
  for (const label of ['סה״כ', 'הצלחות', 'אחוז הצלחה']) {
    fireEvent.click(screen.getByRole('checkbox', { name: `הצגת עמודה ${label}` }))
  }
  expect(screen.queryByRole('table', { name: 'טבלת הביצועים להעתקה' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'הצג הכול' }))
  table = screen.getByRole('table', { name: 'טבלת הביצועים להעתקה' })
  expect(within(table).getAllByRole('columnheader')).toHaveLength(4)
  await waitFor(() => expect(screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })).toBeEnabled())
})

test('passing counts are whole numbers in normalized cards, comparison and sharing', async () => {
  const player = makePlayer()
  player.playerGames[0].playerStats[0] = { playerId: 'p1', passesTotal: 14, passesSuccess: 12, progressivePassesTotal: 2, progressivePassesSuccess: 1, timeVideoStats: 60 }
  render(<PlayerPerformanceModule entity={player} />)
  fireEvent.click(screen.getByRole('button', { name: 'נרמול' }))
  fireEvent.click(screen.getByRole('combobox', { name: 'בסיס הנרמול' }))
  fireEvent.click(screen.getByRole('option', { name: 'נרמול ל־80 דקות' }))
  expect(screen.getByText('19')).toBeInTheDocument()
  expect(screen.queryByText('18.7')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'העתקה לוואטסאפ' }))
  const table = screen.getByRole('table', { name: 'טבלת הביצועים להעתקה' })
  expect(within(table).getByText('19')).toBeInTheDocument()
  expect(within(table).getByText('42')).toBeInTheDocument()
  expect(within(table).queryByText('42.1')).not.toBeInTheDocument()
  expect(screen.queryByText(/מקור ההשוואה:/)).not.toBeInTheDocument()
  expect(screen.queryByText(/רקע כתום:/)).not.toBeInTheDocument()
  await waitFor(() => expect(screen.getByRole('button', { name: 'העתקת תמונה לוואטסאפ' })).toBeEnabled())
})

test('an individual game can be selected in the normalized view', () => {
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'נרמול' }))
  fireEvent.click(screen.getByRole('combobox', { name: 'משחק לנרמול' }))
  fireEvent.click(screen.getByRole('option', { name: /בני סכנין/ }))
  expect(screen.getByText('נרמול נגד בני סכנין למשך המשחק בקבוצת הגיל')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'עריכת נתוני המשחק' })).not.toBeInTheDocument()
})

function playerWithTwoGames() {
  const player = makePlayer()
  return {
    ...player,
    playerGames: [...player.playerGames, {
      ...player.playerGames[0], id: 'g2', rivel: 'מכבי תא', gameDate: '2026-10-31',
    }],
  }
}

test('the entire game row is selectable by mouse and keyboard', () => {
  render(<PlayerPerformanceModule entity={playerWithTwoGames()} />)
  const first = screen.getByRole('row', { name: /בני סכנין/ })
  const second = screen.getByRole('row', { name: /מכבי תא/ })
  expect(second).toHaveAttribute('aria-selected', 'true')
  fireEvent.click(within(first).getByText('65'))
  expect(first).toHaveAttribute('aria-selected', 'true')
  const detail = screen.getByRole('region', { name: 'נתוני המשחק שנבחר' })
  expect(within(detail).getByText('בני סכנין')).toBeInTheDocument()
  expect(within(detail).queryByRole('button', { name: /עריכ/ })).not.toBeInTheDocument()
  fireEvent.keyDown(second, { key: ' ' })
  expect(second).toHaveAttribute('aria-selected', 'true')
  expect(within(detail).getByText('מכבי תא')).toBeInTheDocument()
})

test('editing a game does not change the selected row', () => {
  render(<PlayerPerformanceModule entity={playerWithTwoGames()} />)
  const first = screen.getByRole('row', { name: /בני סכנין/ })
  const second = screen.getByRole('row', { name: /מכבי תא/ })
  const edit = within(first).getByRole('button', { name: 'עריכת סטטיסטיקה נגד בני סכנין' })
  fireEvent.keyDown(edit, { key: 'Enter' })
  fireEvent.click(edit)
  expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'g1' }))
  expect(first).toHaveAttribute('aria-selected', 'false')
  expect(second).toHaveAttribute('aria-selected', 'true')
})

test('loading or incomplete data cannot be exported as a complete report', () => {
  usePlayerPerformanceData.mockImplementation(entity => ({ player: entity, loading: true, refreshing: false, error: null }))
  render(<PlayerPerformanceModule entity={makePlayer()} />)
  expect(screen.getByRole('button', { name: 'העתקה לוואטסאפ' })).toBeDisabled()
  expect(screen.getByRole('status')).toHaveTextContent('טוען סטטיסטיקה שמורה')
})

test('changing players resets the selected view and never retains the previous message', () => {
  const { rerender } = render(<PlayerPerformanceModule entity={makePlayer()} />)
  fireEvent.click(screen.getByRole('button', { name: 'סיכום' }))
  const second = { ...makePlayer('private'), id: 'p2', playerGames: [] }
  rerender(<PlayerPerformanceModule entity={second} />)
  expect(screen.getByRole('button', { name: 'לפי משחק' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('לא נמצאו משחקים לתצוגה')).toBeInTheDocument()
  expect(screen.queryByRole('textbox', { name: 'נוסח ההודעה לשחקן' })).not.toBeInTheDocument()
})
