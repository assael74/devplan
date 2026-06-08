// src/shared/entityLifecycle/cascade/team/collectTeamCascadeDeletePlan.js

import {
  buildPlayerSnapshot,
  buildTeamSnapshot,
  selectClubById,
  selectGamesByTeamId,
  selectMeetingsByTeamContext,
  selectPaymentsByTeamContext,
  selectPlayersByTeamId,
  selectTeamById,
  uniq,
} from './teamCascadeDelete.selectors.js'

const buildStatsRefsFromGames = games => {
  const byGameId = {}

  ;(games || []).forEach(game => {
    const gameId = game?.id || ''
    if (!gameId) return

    const statsDocId = game?.statsDocId || game?.gameStatsDocId || ''
    const hasStats = !!game?.hasStats || !!statsDocId

    if (!hasStats) return

    byGameId[gameId] = {
      gameId,
      statsDocId,
      statsStatus: game?.statsStatus || '',
      hasStats,
    }
  })

  return Object.values(byGameId)
}

const pickPhoto = item => {
  return item?.photo || item?.photoUrl || item?.image || item?.imageUrl || ''
}

const buildPhotoUrls = ({ team, players }) => ({
  team: pickPhoto(team),
  players: uniq((players || []).map(pickPhoto)),
})

const buildWarnings = ({ team, players, games, payments, meetings, statsRefs }) => {
  return [
    !team ? 'TEAM_NOT_FOUND' : null,
    players.length === 0 ? 'TEAM_HAS_NO_PLAYERS' : null,
    games.length === 0 ? 'TEAM_HAS_NO_GAMES' : null,
    statsRefs.length > 0 ? 'ADVANCED_STATS_WILL_BE_DELETED' : null,
    payments.length > 0 ? 'PAYMENTS_WILL_BE_ARCHIVED_WITH_SNAPSHOTS' : null,
    meetings.length > 0 ? 'MEETINGS_WILL_BE_DELETED' : null,
  ].filter(Boolean)
}

const buildFallbackPlayerSnapshot = ({ payment, teamSnapshot }) => ({
  id: payment?.playerId || payment?.entityId || payment?.targetId || '',
  name: payment?.playerName || payment?.playerFullName || payment?.name || '',
  teamId: teamSnapshot?.id || payment?.teamId || '',
  teamName: teamSnapshot?.name || payment?.teamName || '',
  clubId: teamSnapshot?.clubId || payment?.clubId || '',
  clubName: teamSnapshot?.clubName || payment?.clubName || '',
})

const buildPaymentSnapshotsById = ({ payments, playerSnapshotsById, teamSnapshot }) => {
  return (payments || []).reduce((acc, payment) => {
    if (!payment?.id) return acc

    const playerId = payment?.playerId || payment?.entityId || payment?.targetId || ''
    const playerSnapshot =
      playerSnapshotsById?.[playerId] ||
      buildFallbackPlayerSnapshot({ payment, teamSnapshot })

    acc[payment.id] = {
      id: payment.id,
      playerId: playerSnapshot.id,
      playerName: playerSnapshot.name,
      teamId: teamSnapshot.id || playerSnapshot.teamId,
      teamName: teamSnapshot.name || playerSnapshot.teamName,
      clubId: teamSnapshot.clubId || playerSnapshot.clubId,
      clubName: teamSnapshot.clubName || playerSnapshot.clubName,
    }

    return acc
  }, {})
}

const normalizeSeed = seed => {
  const team = seed?.team || seed?.entity || null

  return {
    team,
    club: seed?.club || team?.club || null,
    players: Array.isArray(seed?.players) ? seed.players : [],
    games: Array.isArray(seed?.games)
      ? seed.games
      : Array.isArray(seed?.teamGames)
      ? seed.teamGames
      : [],
    meetings: Array.isArray(seed?.meetings) ? seed.meetings : [],
    payments: Array.isArray(seed?.payments) ? seed.payments : [],
  }
}

export function collectTeamCascadeDeletePlan({ teamId, shorts, seed = {} }) {
  if (!teamId) throw new Error('[teamCascadeDelete] teamId is required')

  const safeSeed = normalizeSeed(seed)

  const team = selectTeamById({
    teamsShorts: shorts?.teamsShorts,
    teamId,
    seedTeam: safeSeed.team,
  })

  const club = selectClubById({
    clubsShorts: shorts?.clubsShorts,
    clubId: team?.clubId || safeSeed.club?.id || safeSeed.club?.clubId,
    seedClub: safeSeed.club,
  })

  const players = selectPlayersByTeamId({
    playersShorts: shorts?.playersShorts,
    teamId,
    seedPlayers: safeSeed.players,
  })

  const playerIds = uniq(players.map(x => x?.id))

  const games = selectGamesByTeamId({
    gamesShorts: shorts?.gamesShorts,
    teamId,
    seedGames: safeSeed.games,
  })

  const gameIds = uniq(games.map(x => x?.id))
  const statsRefs = buildStatsRefsFromGames(games)
  const statsDocIds = uniq(statsRefs.map(x => x?.statsDocId))

  const meetings = selectMeetingsByTeamContext({
    meetingsShorts: shorts?.meetingsShorts,
    teamId,
    playerIds,
    seedMeetings: safeSeed.meetings,
  })

  const meetingIds = uniq(meetings.map(x => x?.id))

  const payments = selectPaymentsByTeamContext({
    paymentsShorts: shorts?.paymentsShorts,
    teamId,
    playerIds,
    seedPayments: safeSeed.payments,
  })

  const paymentIds = uniq(payments.map(x => x?.id))

  const teamSnapshot = buildTeamSnapshot({ team, club })

  const playerSnapshotsById = players.reduce((acc, player) => {
    if (!player?.id) return acc
    acc[player.id] = buildPlayerSnapshot({ player, teamSnapshot })
    return acc
  }, {})

  const paymentSnapshotsById = buildPaymentSnapshotsById({
    payments,
    playerSnapshotsById,
    teamSnapshot,
  })

  const photoUrls = buildPhotoUrls({ team, players })

  return {
    type: 'teamCascadeDelete',
    teamId,

    team,
    club,
    teamSnapshot,

    players,
    playerIds,
    playerSnapshotsById,

    games,
    gameIds,

    statsRefs,
    statsDocIds,

    meetings,
    meetingIds,

    payments,
    paymentIds,
    paymentSnapshotsById,

    photoUrls,

    counts: {
      teams: team ? 1 : 0,
      players: playerIds.length,
      games: gameIds.length,
      stats: statsRefs.length,
      meetings: meetingIds.length,
      payments: paymentIds.length,
      photos: [
        photoUrls.team,
        ...(photoUrls.players || []),
      ].filter(Boolean).length,
    },

    warnings: buildWarnings({
      team,
      players,
      games,
      payments,
      meetings,
      statsRefs,
    }),
  }
}
