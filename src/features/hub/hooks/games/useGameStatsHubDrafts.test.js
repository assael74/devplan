// src/features/hub/hooks/games/useGameStatsHubDrafts.test.js

import { act, renderHook } from '@testing-library/react'
import { useGameStatsHubDrafts } from './useGameStatsHubDrafts.js'
import { getGameStatsDraftsKey } from './gameStatsDrafts.storage.js'

let mockUser = { uid: 'u1' }
jest.mock('../../../../application/auth/AuthProvider.js', () => ({ useAuth: () => ({ user: mockUser }) }))

const saveModel = {
  payload: { gameId: 'g1', status: 'draft' },
  draft: { gameId: 'g1', status: 'draft', timeVideoStats: 40, playerStats: [{ playerId: 'p1', ballLoss: 0 }] },
}

beforeEach(() => {
  localStorage.clear()
  mockUser = { uid: 'u1' }
})

test.each(['player:p1', 'privatePlayer:p1', 'team:t1'])('%s: draft survives remount and is removed after official save', profile => {
  const { result: firstResult, unmount: firstUnmount } = renderHook(() => useGameStatsHubDrafts(profile))
  act(() => firstResult.current.saveStatsDraft(saveModel))
  firstUnmount()

  const { result: secondResult, unmount: secondUnmount } = renderHook(() => useGameStatsHubDrafts(profile))
  act(() => secondResult.current.openStatsGame({ id: 'g1' }))
  expect(secondResult.current.activeStatsFormDraft).toEqual(saveModel.draft)
  act(() => secondResult.current.completeStatsFirestoreSave({ payload: { gameId: 'g1', status: 'committed' } }))
  secondUnmount()

  const { result: thirdResult } = renderHook(() => useGameStatsHubDrafts(profile))
  expect(thirdResult.current.statsFormDraftsByGameId).toEqual({})
})

test('drafts stay isolated by user and profile', () => {
  const { result, rerender } = renderHook(({ profile }) => useGameStatsHubDrafts(profile), { initialProps: { profile: 'player:p1' } })
  act(() => result.current.saveStatsDraft(saveModel))
  rerender({ profile: 'privatePlayer:p1' })
  expect(result.current.statsFormDraftsByGameId).toEqual({})
  rerender({ profile: 'player:p1' })
  expect(result.current.statsFormDraftsByGameId.g1).toEqual(saveModel.draft)
  mockUser = { uid: 'u2' }
  rerender({ profile: 'player:p1' })
  expect(result.current.statsFormDraftsByGameId).toEqual({})
})

test('storage failure keeps the open form and exposes an error', () => {
  const { result } = renderHook(() => useGameStatsHubDrafts('player:p1'))
  act(() => result.current.openStatsGame({ id: 'g1' }, saveModel.draft))
  const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
  act(() => { expect(() => result.current.saveStatsDraft(saveModel)).toThrow('full') })
  expect(result.current.editingStatsGame.id).toBe('g1')
  expect(result.current.draftError).toBeTruthy()
  spy.mockRestore()
})

test('corrupt stored draft does not prevent opening a profile', () => {
  localStorage.setItem(getGameStatsDraftsKey('u1', 'player:p1'), '{invalid')
  const { result } = renderHook(() => useGameStatsHubDrafts('player:p1'))
  expect(result.current.statsFormDraftsByGameId).toEqual({})
})
