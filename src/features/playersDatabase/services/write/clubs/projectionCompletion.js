// features/playersDatabase/services/write/clubs/projectionCompletion.js

export const CLUB_PROJECTION_STAGE = Object.freeze({
  CLUB_DOCUMENT: 'clubDocument',
  CLUBS_MASTER: 'clubsMaster',
})

export const buildClubProjectionCompletion = ({
  canonicalCommitted = false,
  clubDocumentCompleted = false,
  clubsMasterCompleted = false,
  errorStage = null,
} = {}) => {
  const projectionsCompleted = Boolean(
    clubDocumentCompleted && clubsMasterCompleted
  )
  const completed = Boolean(canonicalCommitted && projectionsCompleted)

  return {
    completed,
    canonicalCommitted: Boolean(canonicalCommitted),
    projectionsCompleted,
    clubDocumentCompleted: Boolean(clubDocumentCompleted),
    clubsMasterCompleted: Boolean(clubsMasterCompleted),
    recoveryRequired: Boolean(canonicalCommitted && !projectionsCompleted),
    errorStage: completed ? null : errorStage,
  }
}

export const buildClubProjectionRecoveryScope = ({
  clubId = '',
  ageGroupId = '',
  seasonKey = '',
  teamId = '',
  birthYear = 0,
} = {}) => ({
  clubId: String(clubId || '').trim(),
  ageGroupId: String(ageGroupId || '').trim(),
  seasonKey: String(seasonKey || '').trim(),
  teamId: String(teamId || '').trim(),
  birthYear: Number(birthYear) || 0,
})
