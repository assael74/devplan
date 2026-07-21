// features/playersDatabase/services/read/leaguePage.read.js

import { getLeagueById } from './league.js'

export const readLeaguePageData = async ({ leagueId = '' } = {}) => ({
  leagueDoc: await getLeagueById(leagueId),
})
