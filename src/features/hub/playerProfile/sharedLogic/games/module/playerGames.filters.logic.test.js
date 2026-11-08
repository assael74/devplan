// src/features/hub/playerProfile/sharedLogic/games/module/playerGames.filters.logic.test.js

import { buildPlayerGames } from '../../../../../../coreData/resolvers/builders/games.builders.js'
import { buildPlayerGamesBase } from '../../../../domain/scoring/playerGamesBase.model.js'
import { buildPlayerGameEntryInitial } from '../../../../editLogic/games/entryGames/playerGameEntry.model.js'
import { resolvePlayerGamesFiltersDomain } from './playerGames.filters.logic.js'

function buildFixture(kind) {
  const privatePlayer = kind === 'private'
  const games = ['league', 'cup', 'friendly', 'training'].map((type, index) => ({
    id: type,
    type,
    rivel: type === 'cup' ? 'בני סכנין' : 'יריבה',
    gameDate: `2026-11-0${index + 1}`,
    gameStatus: 'played',
    home: true,
    goalsFor: 2,
    goalsAgainst: 1,
    gamePlayers: [{
      playerId: 'p1',
      isSelected: true,
      isStarting: true,
      timePlayed: 45 + index,
      goals: 1,
      assists: 0,
    }],
  }))
  const team = {
    id: 't1',
    teamGames: [
      ...games,
      { id: 'other-player', type: 'cup', gamePlayers: [{ playerId: 'p2' }] },
    ],
  }
  const player = {
    id: 'p1',
    type: kind,
    isPrivatePlayer: privatePlayer,
    playerSource: privatePlayer ? 'private' : 'players',
    playerGames: privatePlayer ? games : buildPlayerGames(team.teamGames, 'p1'),
    externalGames: privatePlayer ? games.map(game => ({
      ...game,
      ...game.gamePlayers[0],
    })) : [],
  }
  const profileData = { games: buildPlayerGamesBase({ player, team }) }

  return { player, profileData }
}

test.each(['regular', 'project', 'private'])(
  '%s: shows cup and other game types alongside an existing league game',
  kind => {
    const { player, profileData } = buildFixture(kind)
    const domain = resolvePlayerGamesFiltersDomain(player, {}, { profileData })

    expect(domain.games.map(game => game.id)).toEqual(['league', 'cup', 'friendly', 'training'])
    expect(domain.summary).toMatchObject({ totalGames: 4, filteredGames: 4 })
    expect(domain.options.typeOptions.find(option => option.id === 'cup').count).toBe(1)
    expect(domain.games.find(game => game.id === 'cup')).toMatchObject({
      rival: 'בני סכנין',
      timePlayed: 46,
      goals: 1,
      isSelected: true,
    })
    expect(profileData.games.playedPlayerGames.map(game => game.id)).toEqual(['league'])
  }
)

test('cup filter and rival search include the cup game without changing the total count', () => {
  const { player, profileData } = buildFixture('regular')
  const domain = resolvePlayerGamesFiltersDomain(
    player,
    { typeKey: 'cup', search: 'בני סכנין' },
    { profileData }
  )

  expect(domain.games.map(game => game.id)).toEqual(['cup'])
  expect(domain.summary).toMatchObject({ totalGames: 4, filteredGames: 1 })
})

test('an empty current player list does not restore old games from the scoring profile', () => {
  const { player, profileData } = buildFixture('regular')
  const domain = resolvePlayerGamesFiltersDomain(
    { ...player, playerGames: [] },
    {},
    { profileData }
  )

  expect(domain.games).toEqual([])
  expect(domain.summary.totalGames).toBe(0)
})

test('uses profile games when the current player has no game list', () => {
  const { profileData } = buildFixture('regular')
  const domain = resolvePlayerGamesFiltersDomain({ id: 'p1' }, {}, { profileData })

  expect(domain.games.map(game => game.id)).toEqual(['league'])
})

test.each(['regular', 'project', 'private'])(
  '%s: cup card and edit drawer read the saved player registration instead of old defaults',
  kind => {
    const { player, profileData } = buildFixture(kind)
    const savedEntry = {
      playerId: 'p1',
      isSelected: true,
      isStarting: true,
      onSquad: true,
      onStart: true,
      timePlayed: 65,
      goals: 2,
      assists: 1,
    }
    const staleEntry = {
      playerId: 'p1',
      isSelected: true,
      isStarting: false,
      timePlayed: 0,
      goals: 0,
      assists: 0,
    }
    const cupGame = {
      ...player.playerGames.find(game => game.id === 'cup'),
      ...staleEntry,
      playerGame: staleEntry,
      stats: staleEntry,
      gamePlayers: [{ playerId: 'p2', timePlayed: 90 }, savedEntry],
    }
    const currentPlayer = {
      ...player,
      playerGames: [cupGame],
      externalGames: kind === 'private' ? [cupGame] : [],
    }
    const domain = resolvePlayerGamesFiltersDomain(currentPlayer, {}, { profileData })
    const card = domain.games[0]
    const drawer = buildPlayerGameEntryInitial(card, currentPlayer)

    const expected = { isSelected: true, isStarting: true, timePlayed: 65, goals: 2, assists: 1 }
    expect(card.playerGame).toEqual(savedEntry)
    expect(card).toMatchObject(expected)
    expect(drawer).toMatchObject({ playerId: 'p1', ...expected })
  }
)

test('current registration overrides a stale league profile and preserves explicit zero and false', () => {
  const { player, profileData } = buildFixture('regular')
  const savedEntry = {
    playerId: 'p1',
    onSquad: false,
    onStart: false,
    timePlayed: 0,
    goals: 0,
    assists: 0,
  }
  const currentGame = {
    ...player.playerGames.find(game => game.id === 'league'),
    gamePlayers: [savedEntry],
  }
  const domain = resolvePlayerGamesFiltersDomain(
    { ...player, playerGames: [currentGame] },
    {},
    { profileData }
  )

  expect(domain.games[0]).toMatchObject({
    playerGame: savedEntry,
    isSelected: false,
    isStarting: false,
    onSquad: false,
    onStart: false,
    timePlayed: 0,
    goals: 0,
    assists: 0,
    hasEntry: false,
  })
})

test('wrapped game registration takes priority over derived stats and supports saved squad flags', () => {
  const savedEntry = { playerId: 'p1', onSquad: true, onStart: true, timePlayed: 65 }
  const player = {
    id: 'p1',
    playerGames: [{
      gameId: 'cup',
      game: { id: 'cup', type: 'cup', gamePlayers: [savedEntry] },
      stats: { isSelected: false, isStarting: false, timePlayed: 0 },
    }],
  }
  const domain = resolvePlayerGamesFiltersDomain(player, {})

  expect(domain.games[0]).toMatchObject({
    id: 'cup',
    playerGame: savedEntry,
    timePlayed: 65,
    isSelected: true,
    isStarting: true,
  })
})
