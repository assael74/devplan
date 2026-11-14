// src/services/firestore/shorts/gameStats/gameStats.persistence.test.js

import { saveGameStats } from '../../../../application/actions/gameStats/saveGameStats.action.js'
import { loadGameStats } from '../../../../application/actions/gameStats/loadGameStats.action.js'
import { deleteGameStats } from '../../../../application/actions/gameStats/deleteGameStats.action.js'
import {
  collectTeamCascadeDeletePlan,
} from '../../../../application/actions/teamCascade/collectTeamCascadeDeletePlan.js'
import {
  executeTeamCascadeDelete,
} from '../../../../application/actions/teamCascade/executeTeamCascadeDelete.action.js'
import { buildGameStatsPayload } from '../../../../ui/forms/gameStats/logic/save/payload.logic.js'
import { buildGameStatsSavePreview } from '../../../../ui/forms/gameStats/logic/save/savePreview.logic.js'
import { patchGameStatsDraft } from '../../../../ui/forms/gameStats/logic/draft/draft.logic.js'
import { createGameStatsDraftFromDoc } from '../../../../ui/forms/gameStats/logic/draft/draft.fromDoc.js'
import {
  buildPlayerStatsFormGame,
  createScopedInitialDraft,
  lockDraftToPlayer,
} from '../../../../features/hub/playerProfile/sharedModules/games/model/playerGamesStatsForm.helpers.js'
import {
  buildPlayerPerformanceRows,
  hydratePlayerPerformanceGames,
  resolvePlayerPerformanceDomain,
} from '../../../../features/hub/playerProfile/sharedLogic/performance/performance.domain.logic.js'
import { shortsRefs } from '../shorts.refs.js'

let mockStore
let mockId = 0
let mockCommitFailure = false
const mockClone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value))
const mockSnapshot = ref => ({
  exists: () => mockStore.has(ref.path),
  data: () => mockClone(mockStore.get(ref.path)),
  id: ref.id,
})

jest.mock('firebase/firestore', () => ({
  doc: (...args) => {
    const collection = args[0]?.collection || args[1]
    const id = args[0]?.collection ? args[1] || `stats-${++mockId}` : args[2]
    return { path: `${collection}/${id}`, id }
  },
  Timestamp: { now: () => 1700000000000 },
}))
jest.mock('../../../firebase/firebase.js', () => ({ db: {} }))
jest.mock('../../shortsCollections.js', () => ({ gameStatsShortsRef: { collection: 'gameStatsShorts' } }))
jest.mock('../../storage/deleteImageByUrl.js', () => ({ deleteImageByUrl: jest.fn() }))
jest.mock('../../usage/firestoreUsage.instrumentation.js', () => ({
  trackedGetDoc: async ref => mockSnapshot(ref),
  trackedRunTransaction: async (_, callback) => {
    const writes = []
    const result = await callback({
      get: async ref => mockSnapshot(ref),
      set: (ref, data, options) => writes.push({ ref, data: mockClone(data), options }),
      delete: ref => writes.push({ ref, remove: true }),
    })
    if (mockCommitFailure) throw new Error('Transaction failed')
    for (const { ref, data, options, remove } of writes) {
      if (remove) mockStore.delete(ref.path)
      else mockStore.set(ref.path, options?.merge ? { ...mockStore.get(ref.path), ...data } : data)
    }
    return result
  },
}))
jest.mock('../../../../shared/performance/filters/statsFilterGroups.js', () => ({ statsFilterGroups: [] }))

const shortKey = meta => `${meta.collection}/${meta.docId}`
const seed = (meta, list) => mockStore.set(shortKey(meta), { list })

function prepare(kind, gameDuration = 90) {
  const privateMode = kind === 'private'
  const gameMeta = privateMode ? shortsRefs.externalGames.gameInfo : shortsRefs.games.gameInfo
  const aggregateMeta = privateMode ? shortsRefs.privates.privatePlayersStats : shortsRefs.players.playersStats
  const game = { id: 'g1', teamId: privateMode ? '' : 't1', gameDuration, type: 'league' }
  const player = { id: 'p1', type: kind, isPrivatePlayer: privateMode }
  const gameInfo = { ...game }
  if (!privateMode) delete gameInfo.gameDuration
  seed(gameMeta, [gameInfo])
  seed(aggregateMeta, [])
  seed(shortsRefs.teams.teamsStats, [])

  return { gameMeta, aggregateMeta, game, player, scope: privateMode ? 'privatePlayer' : 'player' }
}

function makeDraft(scope, gameDuration = 90) {
  return {
    gameId: 'g1', teamId: scope === 'privatePlayer' ? '' : 't1', gameDuration, status: 'committed',
    source: scope === 'privatePlayer' ? 'privatePlayerProfile' : 'playerProfile',
    scope, editablePlayerId: 'p1', activePlayerId: 'p1',
    selectedPlayerIds: ['p1'],
    selectedParmIds: [
      'passesTotal', 'passesSuccess', 'passesSuccessRate', 'ballLoss',
      'progressivePassesTotal', 'progressivePassesSuccess', 'progressivePassesSuccessRate',
    ],
    meta: { scope, playerId: 'p1' }, timePlayed: 90, timeVideoStats: 90,
    players: [{ playerId: 'p1', timePlayed: 70 }],
    playerStats: [{
      playerId: 'p1', timePlayed: 70, timeVideoStats: 70,
      passesTotal: 20, passesSuccess: 15, ballLoss: 3,
      progressivePassesTotal: 8, progressivePassesSuccess: 6,
    }],
  }
}

beforeEach(() => {
  mockStore = new Map()
  mockCommitFailure = false
})

test('team deletion commits payments, game stats and player changes together', async () => {
  const { aggregateMeta } = prepare('regular')
  const saved = await saveGameStats({ payload: buildGameStatsPayload(makeDraft('player')) })
  expect(saved.ok).toBe(true)
  const statsId = saved.data.ids.gameStatsDocId

  const { teams, players, games, payments } = shortsRefs
  const list = meta => mockStore.get(shortKey(meta)).list
  const otherGame = { id: 'g2', teamId: 't2', gameDuration: 90 }
  seed(games.gameInfo, [...list(games.gameInfo), otherGame])
  const otherDraft = makeDraft('player')
  const savedOther = await saveGameStats({
    payload: buildGameStatsPayload({
      ...otherDraft,
      gameId: otherGame.id,
      teamId: otherGame.teamId,
      playerStats: [{ ...otherDraft.playerStats[0], passesTotal: 3, passesSuccess: 2 }],
    }),
  })
  expect(savedOther.ok).toBe(true)

  seed(teams.teamsInfo, [{ id: 't1', teamName: 'First team' }, { id: 't2' }])
  seed(players.playersTeam, [{ id: 'p1', teamId: 't2' }, { id: 'p2', teamId: 't1' }])
  seed(players.playersInfo, [{ id: 'p1' }, { id: 'p2' }])
  seed(players.playersNames, [{ id: 'p2', playerFirstName: 'Test', playerLastName: 'Player' }])
  seed(payments.paymentOperative, [{ id: 'pay', playerId: 'p2' }])
  seed(payments.paymentProfit, [{ id: 'pay', price: 150 }])

  const plan = collectTeamCascadeDeletePlan({
    teamId: 't1',
    shorts: {
      teamsShorts: { teamsInfo: list(teams.teamsInfo) },
      playersShorts: { playersTeam: list(players.playersTeam) },
      gamesShorts: { gameInfo: list(games.gameInfo) },
      paymentsShorts: { paymentOperative: list(payments.paymentOperative) },
    },
  })
  const before = mockClone([...mockStore])

  seed(games.gameInfo, [...list(games.gameInfo), { id: 'new-game', teamId: 't1' }])
  const changed = mockClone([...mockStore])
  await expect(executeTeamCascadeDelete({ plan })).rejects.toThrow('נתוני הקבוצה השתנו')
  expect([...mockStore]).toEqual(changed)
  mockStore = new Map(before)

  mockCommitFailure = true
  await expect(executeTeamCascadeDelete({ plan })).rejects.toThrow('Transaction failed')
  expect([...mockStore]).toEqual(before)

  mockCommitFailure = false
  await expect(executeTeamCascadeDelete({ plan })).resolves.toMatchObject({ ok: true })
  expect(list(teams.teamsInfo)).toEqual([{ id: 't2' }])
  expect(list(players.playersInfo)).toEqual([{ id: 'p1' }])
  expect(list(games.gameInfo)).toMatchObject([{ id: otherGame.id, teamId: otherGame.teamId }])
  expect(mockStore.has(`gameStatsShorts/${statsId}`)).toBe(false)
  expect(mockStore.has(`gameStatsShorts/${savedOther.data.ids.gameStatsDocId}`)).toBe(true)
  const remainingPlayer = list(aggregateMeta).find(item => item.id === 'p1')
  expect(remainingPlayer).toMatchObject({
    id: 'p1',
    playerId: 'p1',
    gamesWithStats: 1,
    statsGameRefs: [{ gameId: otherGame.id }],
    passesTotal: 3,
    passesSuccess: 2,
  })
  expect(list(payments.paymentProfit)[0]).toMatchObject({
    id: 'pay',
    price: 150,
    archived: true,
    playerName: 'Test Player',
    sourceDeletedId: 't1',
  })
})

test.each(['regular', 'project', 'private'])('%s: save, reload, reset, repeat and delete', async kind => {
  const { gameMeta, aggregateMeta, game, player, scope } = prepare(kind)
  const draft = patchGameStatsDraft(makeDraft(scope), { timePlayed: 65, timeVideoStats: 40 })
  const initialPayload = buildGameStatsPayload(draft)
  expect(buildGameStatsSavePreview(initialPayload)).toMatchObject({
    gameDuration: 90, timePlayed: 65, timeVideoStats: 40, isPlayerScope: true,
  })
  const created = await saveGameStats({ payload: initialPayload })
  expect(created.ok).toBe(true)
  const gameStatsDocId = created.data.ids.gameStatsDocId
  const loaded = await loadGameStats({ gameStatsDocId })
  expect(loaded.data.playerStats[0]).toMatchObject({ timePlayed: 65, timeVideoStats: 40, passesTotal: 20 })
  expect(loaded.data.playerStats[0]).toMatchObject({
    progressivePassesTotal: 8, progressivePassesSuccess: 6, progressivePassesSuccessRate: 75,
  })

  const linkedGame = {
    ...game,
    statsDocId: gameStatsDocId,
    gamePlayers: [{ playerId: 'p1', timePlayed: 70 }],
  }
  const restored = lockDraftToPlayer({
    draft: createGameStatsDraftFromDoc({ game: linkedGame, statsDoc: loaded.data }), player, scope,
  })
  expect(restored.timePlayed).toBe(65)
  expect(restored.timeVideoStats).toBe(40)
  expect(restored.gameDuration).toBe(90)
  expect(buildGameStatsSavePreview(buildGameStatsPayload(restored))).toMatchObject({
    timePlayed: 65, timeVideoStats: 40,
  })
  expect(linkedGame.gamePlayers[0].timePlayed).toBe(70)
  expect(loaded.data.teamStats?.timePlayed).toBe(kind === 'private' ? undefined : 90)

  const hydrated = { ...player, playerGames: hydratePlayerPerformanceGames({ ...player, playerGames: [linkedGame] }, [loaded.data]) }
  expect(buildPlayerPerformanceRows(hydrated)[0].stats).toMatchObject({ timePlayed: 65, timeVideoStats: 40, passesTotal: 20 })

  const reset = {
    ...restored, status: 'committed',
    playerStats: [{
      ...restored.playerStats[0], passesTotal: 0, passesSuccess: 0, ballLoss: 0,
      progressivePassesTotal: 0, progressivePassesSuccess: 0,
    }],
  }
  const payload = buildGameStatsPayload(reset)
  expect(payload.playerStats).toHaveLength(1)
  expect((await saveGameStats({ payload })).ok).toBe(true)
  expect((await saveGameStats({ payload })).ok).toBe(true)
  const resetDoc = (await loadGameStats({ gameStatsDocId })).data
  expect(resetDoc.playerStats[0]).toMatchObject({ passesTotal: 0, passesSuccess: 0, ballLoss: 0 })
  expect(resetDoc.playerStats[0].passesSuccessRate).toBeUndefined()
  expect(resetDoc.playerStats[0]).toMatchObject({ progressivePassesTotal: 0, progressivePassesSuccess: 0 })
  expect(resetDoc.playerStats[0].progressivePassesSuccessRate).toBeUndefined()
  const aggregate = mockStore.get(shortKey(aggregateMeta)).list[0]
  expect(aggregate.gamesWithStats).toBe(1)
  expect(aggregate.passesTotal || 0).toBe(0)
  expect(aggregate.passesSuccessRate).toBeUndefined()
  expect(aggregate.timeVideoStats).toBe(40)

  const deleted = await deleteGameStats({ payload: { gameId: 'g1', teamId: game.teamId, gameStatsDocId, scope, playerId: 'p1' } })
  expect(deleted.ok).toBe(true)
  expect(mockStore.has(`gameStatsShorts/${gameStatsDocId}`)).toBe(false)
  expect(mockStore.get(shortKey(gameMeta)).list[0].statsDocId).toBeUndefined()
  expect(mockStore.get(shortKey(aggregateMeta)).list[0].gamesWithStats || 0).toBe(0)
})

test('failed save leaves all documents unchanged', async () => {
  prepare('regular')
  const before = mockClone(Array.from(mockStore.entries()))
  const payload = buildGameStatsPayload(makeDraft('player'))
  const result = await saveGameStats({ payload: { ...payload, gameId: 'missing' } })
  expect(result.ok).toBe(false)
  expect(Array.from(mockStore.entries())).toEqual(before)
})

test('editing one player preserves other players and team video time', async () => {
  const { game } = prepare('regular')
  const teamPayload = buildGameStatsPayload({
    ...makeDraft('team'), scope: 'team', meta: {}, source: 'manual', timeVideoStats: 80,
    selectedPlayerIds: ['p1', 'p2'],
    playerStats: [...makeDraft('team').playerStats, { playerId: 'p2', timePlayed: 90, timeVideoStats: 80, passesTotal: 10, passesSuccess: 8 }],
  })
  const created = await saveGameStats({ payload: teamPayload })
  const gameStatsDocId = created.data.ids.gameStatsDocId
  const draft = { ...makeDraft('player'), gameStatsDocId, playerStats: [{ ...makeDraft('player').playerStats[0], timeVideoStats: 30, ballLoss: 0 }] }
  expect((await saveGameStats({ payload: buildGameStatsPayload(draft) })).ok).toBe(true)
  const doc = (await loadGameStats({ gameStatsDocId })).data
  expect(doc.playerStats.find(row => row.playerId === 'p2')).toMatchObject({ passesTotal: 10, timeVideoStats: 80 })
  expect(doc.teamStats.timeVideoStats).toBe(80)
  expect(doc.teamStats.timePlayed).toBe(game.gameDuration)
})

test.each(['regular', 'project', 'private'])(
  '%s: preserves age-group duration, analyzed minutes and whole success percentages',
  async kind => {
    const { scope, game, player } = prepare(kind, 80)
    const base = makeDraft(scope, 80)
    const draft = patchGameStatsDraft({
      ...base,
      playerStats: [{
        ...base.playerStats[0],
        passesTotal: 34, passesSuccess: 29,
        progressivePassesTotal: 14, progressivePassesSuccess: 12,
      }],
    }, { timePlayed: 80, timeVideoStats: 60 })
    const payload = buildGameStatsPayload(draft)
    expect(buildGameStatsSavePreview(payload)).toMatchObject({
      gameDuration: 80, timePlayed: 80, timeVideoStats: 60,
    })
    expect(payload.playerStats[0].stats).toMatchObject({
      passesSuccessRate: 85, progressivePassesSuccessRate: 86,
    })
    const saved = await saveGameStats({ payload })
    expect(saved.ok).toBe(true)
    const gameStatsDocId = saved.data.ids.gameStatsDocId
    const loaded = (await loadGameStats({ gameStatsDocId })).data
    expect(loaded.playerStats[0]).toMatchObject({
      timePlayed: 80, timeVideoStats: 60,
      passesSuccessRate: 85, progressivePassesSuccessRate: 86,
    })
    const restored = lockDraftToPlayer({
      draft: createGameStatsDraftFromDoc({
        game: buildPlayerStatsFormGame({ game, player, statsDoc: loaded }),
        statsDoc: loaded,
      }), player, scope,
    })
    expect(buildGameStatsSavePreview(buildGameStatsPayload(restored))).toMatchObject({
      gameDuration: 80, timePlayed: 80, timeVideoStats: 60,
    })
    const hydrated = {
      ...player,
      playerGames: hydratePlayerPerformanceGames({
        ...player,
        playerGames: [{ ...game, statsDocId: gameStatsDocId }],
      }, [loaded]),
    }
    const performance = resolvePlayerPerformanceDomain(hydrated)
    expect(performance.statsMeta).toMatchObject({
      gameDurationPerGame: 80, recordedMinutesTotal: 60, canNormalize: true,
    })
    expect(performance.fullStatsNorm.passesTotal).toBe(45)
  }
)

test('save preview preserves explicit zero player times and separate team times', () => {
  const playerDraft = patchGameStatsDraft(makeDraft('player'), { timePlayed: 0, timeVideoStats: 0 })
  expect(buildGameStatsSavePreview(buildGameStatsPayload(playerDraft))).toMatchObject({
    timePlayed: 0, timeVideoStats: 0,
  })
  const teamDraft = { ...makeDraft('team'), timePlayed: 80, timeVideoStats: 60 }
  expect(buildGameStatsSavePreview(buildGameStatsPayload(teamDraft))).toMatchObject({
    isPlayerScope: false, timePlayed: 80, timeVideoStats: 60,
  })
})

test.each(['regular', 'project', 'private'])(
  '%s: a new stats form starts with the player minutes stored on the game',
  kind => {
    const { game, player, scope } = prepare(kind)
    const registration = { playerId: 'p1', timePlayed: 65, onSquad: true, onStart: true }
    const registeredGame = kind === 'private'
      ? { ...game, ...registration, gameSource: 'external' }
      : { ...game, timePlayed: 90, gamePlayers: [registration] }
    const formGame = buildPlayerStatsFormGame({ game: registeredGame, player })
    const draft = createScopedInitialDraft({ game: formGame, player, scope })

    expect(draft.timePlayed).toBe(65)
    expect(draft.timeVideoStats).toBe(0)
    const edited = patchGameStatsDraft(draft, { timeVideoStats: 40 })
    expect(edited.timePlayed).toBe(65)
    expect(edited.playerStats[0]).toMatchObject({ timePlayed: 65, timeVideoStats: 40 })
    expect(registration.timePlayed).toBe(65)
  }
)
