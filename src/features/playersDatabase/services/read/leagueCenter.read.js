// features/playersDatabase/services/read/leagueCenter.read.js

import { readLeaguesMasterDocument } from './leaguesMaster.read.js'

export const readLeagueCenterData = async () => ({
  leaguesMasterDoc: await readLeaguesMasterDocument(),
})
