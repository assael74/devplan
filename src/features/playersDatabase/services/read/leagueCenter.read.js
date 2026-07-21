// features/playersDatabase/services/read/leagueCenter.read.js

import { listLeagues } from './league.js'

export const readLeagueCenterData = async () => ({
  leagueDocs: await listLeagues(),
})
