// src/features/playersDatabase/services/read/pages/leagueCenter.read.js

import { collection, doc } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import {
  trackedGetDocFromServer,
  trackedGetDocsFromServer,
} from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS as C } from '../../../constants/pdb.constants.js'
import { listLeagues } from '../entities/league.js'
import { readLeaguesMasterDocument } from '../masters/leaguesMaster.read.js'

export const readLeagueCenterData = async ({ fromServer = false } = {}) => {
  if (fromServer) return readLeagueCenterFromServer()
  const [leaguesMasterDoc, leagueDocuments] = await Promise.all([
    readLeaguesMasterDocument({ fresh: true }),
    listLeagues(),
  ])

  return {
    leaguesMasterDoc,
    leagueDocuments: Array.isArray(leagueDocuments) ? leagueDocuments : [],
  }
}

const readLeagueCenterFromServer = async () => {
  const usage = name => ({ feature: 'playersDatabase', collection: name, action: 'league-center-server-reload' })
  const [leagues, master] = await Promise.all([
    trackedGetDocsFromServer(collection(db, C.leagues), usage(C.leagues)),
    trackedGetDocFromServer(doc(db, C.leaguesMaster, 'all'), usage(C.leaguesMaster)),
  ])

  return {
    leagueDocuments: leagues.docs.map(row => ({ ...row.data(), id: row.id })),
    leaguesMasterDoc: master.exists() ? { ...master.data(), id: master.id, documentExists: true } : null,
  }
}
