/**
 * שלב בניית קשרים סופיים (Relations Stage)
 *
 * אחריות:
 * - יצירת קשרים הפוכים בין הישויות
 * - בניית מבנה הנתונים הסופי של המערכת
 *
 * דוגמאות:
 * team -> players
 * club -> teams
 * club -> keyPlayers
 *
 * בנוסף:
 * - חישוב abilities של קבוצות
 * - זיהוי שחקני מפתח
 * - חיבור סרטונים עם ישויות
 *
 * בסיום שלב זה נוצר מבנה הנתונים הסופי
 * שמוחזר למערכת.
 */
 import {
   buildTeamAbilitiesSummary,
   buildVideosWithEntities
 } from '../resolvers/builders'
import { POSITION_LAYERS } from '../../../shared/players/players.constants.js'

const safeId = (v) => (v == null ? '' : String(v))

const pickClubKeyPlayers = (club) => {
  const teams = Array.isArray(club?.teams) ? club.teams : []
  const all = []

  for (const team of teams) {
    const players = Array.isArray(team?.players) ? team.players : []

    for (const player of players) {
      if (!player?.id) continue

      all.push({
        player,
        team: team || null,
        teamId: team?.id || player?.teamId || null,
        clubId: club?.id || player?.clubId || null,
        isKey: player?.isKey === true,
        isAutoEligible: Number(player?.timePlayed || player?.timeVideoStats || 0) > 0,
      })
    }
  }

  all.sort((a, b) => {
    if (a.isKey !== b.isKey) return a.isKey ? -1 : 1

    const aPotential = Number(a.player?.levelPotential || a.player?.level || 0)
    const bPotential = Number(b.player?.levelPotential || b.player?.level || 0)
    if (bPotential !== aPotential) return bPotential - aPotential

    const aTime = Number(a.player?.timePlayed || a.player?.timeVideoStats || 0)
    const bTime = Number(b.player?.timePlayed || b.player?.timeVideoStats || 0)
    return bTime - aTime
  })

  return all.filter((item) => item.isKey === true)
}

const pickTeamKeyPlayers = (team) =>
  pickClubKeyPlayers({ id: team?.clubId || null, teams: [team] })

export function buildFinalRelations({
  merged,
  indexes,
  teamsWithVideos,
  playersWithVideos,
  scouting,
  meetings,
}) {
  const { clubs = [], videosBase = [], videoAnalysisBase = [], meetingsBase = [] } = merged
  const { rolesByClubId, rolesByTeamId, tags } = indexes

  const playersByTeamId = playersWithVideos.reduce((acc, player) => {
    const key = safeId(player.teamId) || '__noTeam__'
    ;(acc[key] ||= []).push(player)
    return acc
  }, {})

  const teamsWithPlayers = teamsWithVideos.map((team) => {
    const teamId = safeId(team.id)
    const players = playersByTeamId[teamId] || []
    const squadStrength = buildTeamAbilitiesSummary(players)

    return {
      ...team,
      players,
      roles: rolesByTeamId[teamId] || [],
      squadStrength,
      level: squadStrength?.level || null,
      levelPotential: squadStrength?.levelPotential || null,
      keyPlayers: pickTeamKeyPlayers({ ...team, players }),
    }
  })

  const teamsByClubId = teamsWithPlayers.reduce((acc, team) => {
    const key = safeId(team.clubId) || '__noClub__'
    ;(acc[key] ||= []).push(team)
    return acc
  }, {})

  const clubsWithTeams = clubs.map((club) => {
    const clubId = safeId(club.id)

    const mergedClub = {
      ...club,
      teams: teamsByClubId[clubId] || [],
      roles: rolesByClubId[clubId] || [],
    }

    return {
      ...mergedClub,
      keyPlayers: pickClubKeyPlayers(mergedClub),
    }
  })

  const playerById = new Map(playersWithVideos.map((player) => [safeId(player.id), player]))
  const teamById = new Map(teamsWithPlayers.map((team) => [safeId(team.id), team]))

  const videoAnalysis = buildVideosWithEntities(videoAnalysisBase, {
    meetingsArr: meetingsBase,
    playersArr: playersWithVideos,
    teamsArr: teamsWithPlayers,
    tagsArr: tags,
  })

  const videos = buildVideosWithEntities(videosBase, {
    tagsArr: tags,
  })

  return {
    clubs: clubsWithTeams,
    teams: teamsWithPlayers,
    players: playersWithVideos,
    scouting,
    meetings,
    payments: merged.paymentsBase,
    roles: indexes.roles,
    videos,
    videoAnalysis,
    tags,
    games: indexes.gamesWithStats,
    clubById: indexes.clubById,
    teamById,
    meetingsById: indexes.meetingsById,
    paymentsById: indexes.paymentsById,
    meetingsByPlayerId: indexes.meetingsByPlayerId,
    playerById,
  }
}
