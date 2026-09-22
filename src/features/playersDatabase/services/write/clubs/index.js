export {
  clubDocRef,
  isSameClubProjectionState,
  readClubDocument,
  removeClubDocumentAgeGroupSeasonProjections,
  removeClubDocumentOrphanedCompetitionPathSeasons,
  upsertClubDocument,
} from './clubDoc.js'

export {
  rebuildAllClubsMasterDocument,
  syncClubsMasterDocument,
} from './clubsMaster.js'

export {
  buildLeagueClubSeasonIdentityEntries,
  removeLeagueClubSeasonIdentityIndex,
  syncLeagueClubSeasonIdentityIndex,
} from './clubSeasonIdentityIndex.js'

export {
  CLUB_PROJECTION_STAGE,
  buildClubProjectionCompletion,
  buildClubProjectionRecoveryScope,
} from './projectionCompletion.js'

export {
  removeClubProjectionsForLeagueSeason,
  syncClubProjectionPersistence,
  recoverClubProjectionPersistence,
} from './clubProjectionSync.js'

export {
  buildClubIdentityFromTeam,
  CLUB_PROJECTION_REASON,
  ensureRequiredClubProjectionCompleted,
  findClubIdsWithLeagueProjection,
  reconcileClubProjectionsFromLeagueTable,
  resolveClubTransferCoverageStatus,
  syncClubProjectionFromTeamSeason,
  syncClubProjectionsFromLeagueTable,
} from './clubFlowProjection.js'

export {
  setClubCompetitionManualProjection,
} from './clubCompetitionOverride.js'

export {
  parseClubExternalLinksWorkbook,
  seedClubCatalogDocuments,
} from './clubCatalogSeed.js'
