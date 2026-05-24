// src/features/hub/clubProfile/sharedLogic/profileData/profileScope.model.js

const emptyArray = []

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const getId = item => {
  return asText(item?.id || item?.teamId || item?.playerId)
}

const getClubId = item => {
  return asText(
    item?.clubId ||
      item?.club?.id ||
      item?.club?.clubId ||
      item?.teamClubId ||
      ''
  )
}

const getTeamId = item => {
  return asText(
    item?.teamId ||
      item?.team?.id ||
      item?.team?.teamId ||
      ''
  )
}

const getClubTeamIds = club => {
  const rows = Array.isArray(club?.teams) ? club.teams : emptyArray

  return rows
    .map(item => asText(item?.id || item?.teamId || item))
    .filter(Boolean)
}

const hasClubTeamRef = ({ team, clubTeamIds }) => {
  const teamId = getId(team)

  return Boolean(teamId && clubTeamIds.includes(teamId))
}

const belongsToClub = ({ item, clubId }) => {
  const itemClubId = getClubId(item)

  return Boolean(itemClubId && itemClubId === clubId)
}

const resolveClubTeams = ({ club, teams }) => {
  const clubId = getId(club)
  const clubTeamIds = getClubTeamIds(club)
  const safeTeams = Array.isArray(teams) ? teams : emptyArray

  return safeTeams.filter(team => {
    return (
      belongsToClub({ item: team, clubId }) ||
      hasClubTeamRef({ team, clubTeamIds })
    )
  })
}

const resolveClubPlayers = ({ clubTeams, players }) => {
  const teamIds = clubTeams.map(getId).filter(Boolean)
  const safePlayers = Array.isArray(players) ? players : emptyArray

  return safePlayers.filter(player => {
    return teamIds.includes(getTeamId(player))
  })
}

const buildById = rows => {
  return rows.reduce((acc, item) => {
    const id = getId(item)

    if (id) {
      acc[id] = item
    }

    return acc
  }, {})
}

export const buildClubProfileScope = ({ club, teams, players } = {}) => {
  if (!club) {
    return {
      club: null,
      teams: emptyArray,
      players: emptyArray,
      teamsById: {},
      playersById: {},
      meta: {
        ready: false,
        reason: 'missing_club',
      },
    }
  }

  const clubTeams = resolveClubTeams({
    club,
    teams,
  })

  const clubPlayers = resolveClubPlayers({
    clubTeams,
    players,
  })

  return {
    club,
    teams: clubTeams,
    players: clubPlayers,

    teamsById: buildById(clubTeams),
    playersById: buildById(clubPlayers),

    meta: {
      ready: true,
      source: 'clubProfile.profileScope',
      counts: {
        teams: clubTeams.length,
        players: clubPlayers.length,
      },
    },
  }
}
