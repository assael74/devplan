// features/playersDatabase/services/read/leaguePage.read.js

import { getLeagueById } from '../entities/league.js'

export const readLeaguePageData = async ({ leagueId = '' } = {}) => ({
  leagueDoc: await getLeagueById(leagueId),
})
