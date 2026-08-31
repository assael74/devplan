// features/playersDatabase/services/read/teamPage.read.js

import { getLeagueById } from './league.js'
import { getTeamById } from './team.js'
import { getTeamSeason } from './teamSeason.js'

export const readTeamPageData = async ({ leagueId = '', teamId = '' } = {}) => {
  const [leagueDoc, teamDoc] = await Promise.all([
    getLeagueById(leagueId),
    getTeamById(teamId),
  ])

  const seasonEntries = Array.isArray(teamDoc?.seasons) ? teamDoc.seasons : []
  const teamSeasons = await Promise.all(seasonEntries.map(entry => getTeamSeason({
    birthTeamDocumentId: teamDoc?.id || teamId,
    seasonKey: entry?.seasonKey,
  })))

  return {
    leagueDoc,
    teamDoc,
    teamSeasons: teamSeasons.filter(Boolean),
  }
}
