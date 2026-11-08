// src/features/hub/playerProfile/sharedLogic/performance/usePlayerPerformanceData.test.js

import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { loadGameStats } from '../../../../../application/actions/gameStats/loadGameStats.action.js'
import { usePlayerPerformanceData } from './usePlayerPerformanceData.js'
import { buildPlayerPerformanceRows } from './performance.domain.logic.js'

jest.mock('../../../../../application/auth/AuthProvider.js', () => ({ useAuth: () => ({ user: { uid: 'u1' } }) }))
jest.mock('../../../../../application/actions/gameStats/loadGameStats.action.js', () => ({ loadGameStats: jest.fn() }))
jest.mock('../../../../../shared/performance/filters/statsFilterGroups.js', () => ({ statsFilterGroups: [] }))

let client
const wrapper = ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
const statsDoc = (id, gameId, playerId, passesTotal = 20) => ({
  id, gameId, playerStats: [{ playerId, timePlayed: 65, timeVideoStats: 40, passesTotal }],
})

beforeEach(() => {
  jest.clearAllMocks()
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})
afterEach(() => client.clear())

test.each(['regular', 'project', 'private'])('%s: loads linked details and refreshes after a save', async kind => {
  let doc = statsDoc('s1', 'g1', 'p1', 0)
  loadGameStats.mockImplementation(async () => ({ ok: true, data: doc }))
  const entity = {
    id: 'p1', type: kind, isPrivatePlayer: kind === 'private',
    playerGames: [{ id: 'g1', statsDocId: 's1', gameDuration: 90 }],
    advancedStats: { statsGameRefs: [{ gameId: 'g1', gameStatsDocId: 's1' }] },
  }
  const { result } = renderHook(() => usePlayerPerformanceData(entity), { wrapper })
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(loadGameStats).toHaveBeenCalledTimes(1)
  expect(buildPlayerPerformanceRows(result.current.player)[0].stats).toMatchObject({ passesTotal: 0, timeVideoStats: 40 })

  doc = statsDoc('s1', 'g1', 'p1', 25)
  await act(async () => { await client.invalidateQueries({ queryKey: ['game-stats'] }) })
  await waitFor(() => expect(buildPlayerPerformanceRows(result.current.player)[0].stats.passesTotal).toBe(25))
})

test('switching players does not expose the previous player details', async () => {
  loadGameStats.mockImplementation(async ({ gameStatsDocId }) => ({
    ok: true, data: gameStatsDocId === 's1' ? statsDoc('s1', 'g1', 'p1') : statsDoc('s2', 'g2', 'p2'),
  }))
  const first = { id: 'p1', playerGames: [{ id: 'g1', statsDocId: 's1' }] }
  const second = { id: 'p2', playerGames: [{ id: 'g2', statsDocId: 's2' }] }
  const { result, rerender } = renderHook(({ entity }) => usePlayerPerformanceData(entity), { wrapper, initialProps: { entity: first } })
  await waitFor(() => expect(result.current.loading).toBe(false))
  rerender({ entity: second })
  expect(result.current.player.id).toBe('p2')
  expect(result.current.loading).toBe(true)
  expect(buildPlayerPerformanceRows(result.current.player)).toEqual([])
  await waitFor(() => expect(result.current.loading).toBe(false))
  expect(buildPlayerPerformanceRows(result.current.player)[0].gameId).toBe('g2')
})

test('missing linked document remains an explicit load error', async () => {
  loadGameStats.mockResolvedValue({ ok: true, data: null })
  const entity = { id: 'p1', playerGames: [{ id: 'g1', statsDocId: 'missing' }] }
  const { result } = renderHook(() => usePlayerPerformanceData(entity), { wrapper })
  await waitFor(() => expect(result.current.error).toBeTruthy())
  expect(buildPlayerPerformanceRows(result.current.player)).toEqual([])
})
