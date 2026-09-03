// src/features/playersDatabase/services/write/searchIndex/team/teamSeasonIndex.balance.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const buildTeamBalanceSearchIndexProjection = teamBalance => {
  if (!teamBalance || typeof teamBalance !== 'object') return {}

  const dependencyKey = clean(teamBalance?.dependencyKey)
  const persistenceContractVersion = clean(teamBalance?.persistenceContractVersion)
  const scoutInterpretationModelVersion = clean(teamBalance?.scoutInterpretation?.modelVersion)
  const scoutInterpretationAvailability = clean(teamBalance?.scoutInterpretation?.availability)
  const scoutInterpretationAvailabilityReason = clean(teamBalance?.scoutInterpretation?.availabilityReason)
  const scoutOffenseFinding = clean(teamBalance?.scoutInterpretation?.offense?.finding)
  const scoutDefenseFinding = clean(teamBalance?.scoutInterpretation?.defense?.finding)
  const teamInterest = Boolean(teamBalance?.scoutInterpretation?.teamInterest?.isInteresting)
  const squadInterest = Boolean(teamBalance?.scoutInterpretation?.teamInterest?.squad?.isInteresting)
  const squadInterestReason = squadInterest
    ? clean(teamBalance?.scoutInterpretation?.teamInterest?.squad?.reason)
    : ''
  if (!dependencyKey || !persistenceContractVersion) return {}

  return {
    balanceDependencyKey: dependencyKey,
    balancePersistenceContractVersion: persistenceContractVersion,
    scoutInterpretationModelVersion,
    scoutInterpretationAvailability,
    scoutInterpretationAvailabilityReason,
    scoutOffenseFinding,
    scoutDefenseFinding,
    teamInterest,
    squadInterestReason,
  }
}
