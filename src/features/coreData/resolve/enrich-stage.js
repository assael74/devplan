// C:\projects\devplan\src\features\coreData\resolve\enrich-stage.js
/**
 * שלב העשרת הנתונים (Enrich Stage)
 *
 * אחריות:
 * - חיבור בין הישויות במערכת
 * - הוספת relations בין אובייקטים
 * - הוספת נתונים מחושבים
 *
 * דוגמאות להשלמות שמתבצעות כאן:
 * player -> team
 * player -> club
 * player -> meetings
 * player -> payments
 *
 * team -> club
 * team -> games
 * team -> meetings
 * team -> trainingWeeks
 *
 * בנוסף:
 * - חישוב statistics לשחקנים וקבוצות
 * - חיבור סרטונים לישויות
 */
 import { getPlayerGeneralPosition } from '../../../shared/players/player.positions.utils.js'
 import { getPlayerAge } from '../../../shared/players/player.age.utils.js'
 import { getPlayerFullName } from '../../../shared/players/player.name.utils.js'
 import {
   buildPlayersWithStats,
   buildTeamsWithStats,
   buildScoutGamesSummary,
   buildVideosWithEntities,
   buildTrainingWeeksSummary,
   buildPlayerGames
 } from '../resolvers/builders'

const safeId = (v) => (v == null ? '' : String(v))

export function enrichTeams(merged, indexes) {
  const { teamsBase = [] } = merged
  const {
    clubById,
    trainingWeeksByTeamId,
    teamMeetingsByTeamId,
    teamGamesByTeamId,
  } = indexes

  return teamsBase.map((team) => {
    const teamId = safeId(team.id)
    const trainingWeeks = trainingWeeksByTeamId.get(teamId) || []
    const teamMeetings = teamMeetingsByTeamId.get(teamId) || []
    const teamGames = teamGamesByTeamId.get(teamId) || []

    return {
      ...team,
      club: clubById.get(safeId(team.clubId)) || null,
      trainingWeeks,
      trainingSummary: buildTrainingWeeksSummary(trainingWeeks),
      teamMeetings,
      teamGames,
    }
  })
}

export function enrichPlayers(merged, indexes, teams) {
  const { playersBase = [] } = merged
  const {
    clubById,
    meetingsByPlayerId,
    paymentsIdsByPlayerId,
    paymentsById,
    trainingWeeksByTeamId,
    teamMeetingsByTeamId,
    teamGamesByTeamId,
  } = indexes

  const teamById = new Map(teams.map((team) => [safeId(team.id), team]))

  return playersBase.map((player) => {
    const team = teamById.get(safeId(player.teamId)) || null
    const teamId = safeId(player.teamId)

    const club = player.clubId
      ? clubById.get(safeId(player.clubId)) || null
      : team?.clubId
      ? clubById.get(safeId(team.clubId)) || null
      : null

    const meetings = meetingsByPlayerId.get(safeId(player.id)) || []
    const trainingWeeks = trainingWeeksByTeamId.get(teamId) || []
    const teamMeetings = teamMeetingsByTeamId.get(teamId) || []
    const teamGames = teamGamesByTeamId.get(teamId) || []
    const playerGames = buildPlayerGames(teamGames, player.id)
    const generalPosition = getPlayerGeneralPosition(player.positions)

    const paymentsIds = paymentsIdsByPlayerId.get(safeId(player.id)) || []
    const payments = paymentsIds.map((id) => paymentsById.get(id)).filter(Boolean)
    const age = getPlayerAge(player)
    const playerFullName = getPlayerFullName(player)

    return {
      ...player,
      team,
      club,
      meetings,
      teamMeetings,
      trainingWeeks,
      teamGames,
      playerGames,
      payments,
      age,
      playerFullName,
      generalPosition: {
        layerKey: generalPosition.layerKey,
        layerLabel: generalPosition.layerLabel,
      }
    }
  })
}

export function enrichMeetings(merged, indexes, players = []) {
  const { meetingsBase = [] } = merged
  const { videosByMeetingId } = indexes

  const playerById = new Map(players.map((player) => [safeId(player.id), player]))

  return meetingsBase.map((meeting) => {
    const playerId = safeId(meeting?.playerId)

    return {
      ...meeting,
      player: playerId ? playerById.get(playerId) || null : null,
      videos: videosByMeetingId.get(String(meeting.id)) || [],
    }
  })
}

export function enrichScouting(merged) {
  const { scoutingBase = [] } = merged

  return scoutingBase.map((item) => {
    const { games, stats } = buildScoutGamesSummary(item?.games)
    return {
      ...item,
      games,
      gamesSummary: stats,
    }
  })
}

export function attachPlayerStatsAndVideos(players, merged, indexes, teams) {
  const { meetingsBase = [] } = merged
  const { gamesWithStats, videosByPlayerId, tags } = indexes

  const playersWithStats = buildPlayersWithStats(players, gamesWithStats, 'all')

  return playersWithStats.map((player) => {
    const rawVideos = videosByPlayerId.get(String(player.id)) || []

    const videos = buildVideosWithEntities(rawVideos, {
      meetingsArr: meetingsBase,
      playersArr: players,
      teamsArr: teams,
      tagsArr: tags,
    })

    return {
      ...player,
      videos,
      abilities: player?.abilities && typeof player.abilities === 'object'
        ? player.abilities
        : {},
    }
  })
}

export function attachTeamStatsAndVideos(teams, indexes) {
  const { gamesWithStats, videosByTeamId, tags } = indexes
  const teamsWithStats = buildTeamsWithStats(teams, gamesWithStats, 'all')

  return teamsWithStats.map((team) => {
    const rawVideos = videosByTeamId.get(String(team.id)) || []

    const videos = buildVideosWithEntities(rawVideos, {
      teamsArr: teams,
      tagsArr: tags,
    })

    return {
      ...team,
      videos,
    }
  })
}
