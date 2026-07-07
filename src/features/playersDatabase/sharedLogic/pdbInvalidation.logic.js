// features/playersDatabase/sharedLogic/pdbInvalidation.logic.js

import { markLeagueBoardCacheDirty } from '../components/summary/hooks/leagueBoardCache.js'
import { clean } from './pdbText.logic.js'

const dirtyScopes = new Set()

export const PDB_DIRTY_SCOPE = {
  BOARD: 'board',
  LEAGUES: 'leagues',
  LEAGUE_ROWS: 'leagueRows',
  PROFILE_DOCUMENTS: 'profileDocuments',
  TEAM_PLAYERS: 'teamPlayers',
}

export const markPdbScopeDirty = scope => {
  const safeScope = clean(scope)
  if (!safeScope) return

  dirtyScopes.add(safeScope)
}

export const clearPdbScopeDirty = scope => {
  const safeScope = clean(scope)
  if (!safeScope) return

  dirtyScopes.delete(safeScope)
}

export const isPdbScopeDirty = scope => dirtyScopes.has(clean(scope))

export const invalidatePlayersDatabaseBoard = () => {
  markPdbScopeDirty(PDB_DIRTY_SCOPE.BOARD)
  markPdbScopeDirty(PDB_DIRTY_SCOPE.LEAGUES)
  markLeagueBoardCacheDirty()
}

export const invalidatePlayersDatabaseAfterTeamChange = () => {
  invalidatePlayersDatabaseBoard()
  markPdbScopeDirty(PDB_DIRTY_SCOPE.LEAGUE_ROWS)
  markPdbScopeDirty(PDB_DIRTY_SCOPE.TEAM_PLAYERS)
}

export const invalidatePlayersDatabaseAfterProfileChange = () => {
  invalidatePlayersDatabaseBoard()
  markPdbScopeDirty(PDB_DIRTY_SCOPE.PROFILE_DOCUMENTS)
  markPdbScopeDirty(PDB_DIRTY_SCOPE.TEAM_PLAYERS)
}

export const resetPlayersDatabaseDirtyScopes = () => {
  dirtyScopes.clear()
}
