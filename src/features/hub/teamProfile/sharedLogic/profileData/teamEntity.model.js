// src/features/hub/teamProfile/sharedLogic/profileData/teamEntity.model.js

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const toNumber = (value, fallback = null) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const toBoolean = value => {
  return value === true
}

export const buildTeamProfileEntity = team => {
  if (!team) return null

  const name =
    asText(team.teamName) ||
    asText(team.name) ||
    asText(team.label)

  return {
    id: asText(team.id),
    clubId: asText(team.clubId),

    teamName: name,
    name,
    label: name,

    active: toBoolean(team.active),
    color: asText(team.color),
    photo: asText(team.photo),
    project: asText(team.project),

    teamYear: asText(team.teamYear),

    club: team.club || null,

    ifaLink: asText(team.ifaLink),

    points: toNumber(team.points, 0),
    goals: toNumber(team.goals, 0),

    league: asText(team.league),
    leagueLevel: asText(team.leagueLevel),
    leaguePosition: toNumber(team.leaguePosition),
    leagueRound: toNumber(team.leagueRound),
    leagueGameTime: toNumber(team.leagueGameTime, 90),
    leagueNumGames: toNumber(team.leagueNumGames),

    leagueGoalsFor: toNumber(team.leagueGoalsFor, 0),
    leagueGoalsAgainst: toNumber(team.leagueGoalsAgainst, 0),

    targetPosition: toNumber(team.targetPosition),
    targetPositionMode: asText(team.targetPositionMode),
    targetProfileId: asText(team.targetProfileId),

    targets: team.targets || null,
    teamPerformance: team.teamPerformance || null,

    trainingWeeks: Array.isArray(team.trainingWeeks)
      ? team.trainingWeeks
      : [],
  }
}
