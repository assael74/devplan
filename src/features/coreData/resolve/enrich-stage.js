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
 import {
   buildPlayersWithStats,
   buildTeamsWithStats,
   buildScoutGamesSummary,
   buildVideosWithEntities,
   buildTrainingWeeksSummary,
   buildTeamEventsByWeek,
   buildPlayerEventsByWeek,
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
    const generalPosition = getPlayerGeneralPosition(player.positions)

    const paymentsIds = paymentsIdsByPlayerId.get(safeId(player.id)) || []
    const payments = paymentsIds.map((id) => paymentsById.get(id)).filter(Boolean)

    return {
      ...player,
      team,
      club,
      meetings,
      teamMeetings,
      trainingWeeks,
      teamGames,
      payments,
      generalPosition: {
        layerKey: generalPosition.layerKey,
        layerLabel: generalPosition.layerLabel,
      }
    }
  })
}

export function enrichMeetings(merged, indexes) {
  const { meetingsBase = [] } = merged
  const { videosByMeetingId } = indexes

  return meetingsBase.map((meeting) => ({
    ...meeting,
    videos: videosByMeetingId.get(String(meeting.id)) || [],
  }))
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

    const eventsByWeek = buildPlayerEventsByWeek({
      trainingWeeks: player?.trainingWeeks || [],
      teamMeetings: player?.teamMeetings || [],
      teamGames: player?.teamGames || [],
      playerMeetings: player?.meetings || [],
      teamId: player?.teamId || player?.team?.id || null,
      playerId: player?.id || null,
    })

    return {
      ...player,
      videos,
      eventsByWeek,
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

    const eventsByWeek = buildTeamEventsByWeek({
      trainingWeeks: team?.trainingWeeks || [],
      teamMeetings: team?.teamMeetings || [],
      teamGames: team?.teamGames || [],
      teamId: team?.id || null,
    })

    return {
      ...team,
      videos,
      eventsByWeek,
    }
  })
}
