// src/features/playersDatabase/ui/pages/clubsPage/hooks/useClubsPage.test.js
import { act, renderHook, waitFor } from '@testing-library/react'
import useClubsPage from './useClubsPage.js'
import useClubPage from '../../clubPage/hooks/useClubPage.js'
import { readClubsPageData, readClubPageData } from '../../../../services/read/index.js'
import { getCachedClubsPageData, getCachedClubPageData } from '../../../../services/read/pages/clubs.read.js'

jest.mock('../../../../services/read/index.js', () => ({
  readClubsPageData: jest.fn(),
  readClubPageData: jest.fn(),
}))
jest.mock('../../../../services/read/pages/clubs.read.js', () => ({
  getCachedClubsPageData: jest.fn(),
  getCachedClubPageData: jest.fn(),
}))

const cachedPage = { directory: { clubsById: {} }, centers: [] }
const clubSource = clubId => ({ ...cachedPage, clubId, profile: null, directoryEntry: null })

beforeEach(() => {
  jest.resetAllMocks()
  getCachedClubsPageData.mockReturnValue(cachedPage)
  getCachedClubPageData.mockReturnValue(null)
})

test('keeps cached rows visible during refresh and after refresh failure', async () => {
  readClubsPageData.mockResolvedValue(cachedPage)
  const { result } = renderHook(() => useClubsPage())
  expect(result.current.loading).toBe(false)
  expect(result.current.clubsPageData).toBe(cachedPage)
  await waitFor(() => expect(result.current.refreshing).toBe(false))
  expect(readClubsPageData).toHaveBeenCalledWith({ refresh: false })

  let rejectRefresh
  readClubsPageData.mockImplementation(() => new Promise((_resolve, reject) => { rejectRefresh = reject }))
  let refresh
  act(() => { refresh = result.current.reload().catch(() => {}) })
  expect(result.current.loading).toBe(false)
  expect(result.current.refreshing).toBe(true)
  expect(result.current.clubsPageData).toBe(cachedPage)
  await act(async () => {
    rejectRefresh(new Error('offline'))
    await refresh
  })
  expect(result.current.clubsPageData).toBe(cachedPage)
  expect(result.current.error).toBe('')
  expect(result.current.refreshError).toBe('offline')
})

test('shows a loading state and error when no snapshot exists', async () => {
  getCachedClubsPageData.mockReturnValue(null)
  readClubsPageData.mockRejectedValue(new Error('offline'))
  const { result } = renderHook(() => useClubsPage())
  expect(result.current.loading).toBe(true)
  await waitFor(() => expect(result.current.error).toBe('offline'))
  expect(result.current.loading).toBe(false)
})

test('ignores late responses from the previous club', async () => {
  const pending = {}
  readClubPageData.mockImplementation(({ clubId }) => new Promise(resolve => { pending[clubId] = resolve }))
  const { result, rerender } = renderHook(({ clubId }) => useClubPage({ clubId }), {
    initialProps: { clubId: 'first' },
  })
  rerender({ clubId: 'second' })
  await act(async () => { pending.second(clubSource('second')) })
  expect(result.current.loading).toBe(false)
  expect(result.current.club.clubId).toBe('second')
  await act(async () => { pending.first(clubSource('first')) })
  expect(result.current.loading).toBe(false)
  expect(result.current.club.clubId).toBe('second')
  expect(result.current.error).toBe('')
})

test('keeps a cached club visible while fetching it again', async () => {
  getCachedClubPageData.mockImplementation(clubId => clubSource(clubId))
  readClubPageData.mockResolvedValue(clubSource('first'))
  const { result } = renderHook(() => useClubPage({ clubId: 'first' }))
  expect(result.current.loading).toBe(false)
  await waitFor(() => expect(result.current.refreshing).toBe(false))
})

test('does not display the previous club while a new club is loading', async () => {
  readClubPageData.mockResolvedValueOnce(clubSource('first'))
  const { result, rerender } = renderHook(({ clubId }) => useClubPage({ clubId }), {
    initialProps: { clubId: 'first' },
  })
  await waitFor(() => expect(result.current.club?.clubId).toBe('first'))
  readClubPageData.mockImplementation(() => new Promise(() => {}))
  rerender({ clubId: 'second' })
  expect(result.current.club).toBeNull()
  expect(result.current.loading).toBe(true)
})
