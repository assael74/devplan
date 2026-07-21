// features/playersDatabase/services/read/teamPage.read.js

import { getLeagueById } from './league.js'
import { getTeamById } from './team.js'

export const readTeamPageData = async ({ leagueId = '', teamId = '' } = {}) => {
  const [leagueDoc, teamDoc] = await Promise.all([
    getLeagueById(leagueId),
    getTeamById(teamId),
  ])

  return { leagueDoc, teamDoc }
}
