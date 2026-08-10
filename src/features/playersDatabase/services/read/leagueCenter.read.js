// src/features/playersDatabase/services/read/leagueCenter.read.js

import { listLeagues } from './league.js'
import { readLeaguesMasterDocument } from './leaguesMaster.read.js'

export const readLeagueCenterData = async () => {
  const [leaguesMasterDoc, leagueDocuments] = await Promise.all([
    readLeaguesMasterDocument({ fresh: true }),
    listLeagues(),
  ])

  return {
    leaguesMasterDoc,
    leagueDocuments: Array.isArray(leagueDocuments) ? leagueDocuments : [],
  }
}
