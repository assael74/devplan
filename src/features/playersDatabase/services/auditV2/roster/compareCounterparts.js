import {
  buildApprovedCounterpartTeamSeason,
} from '../../../domain/rosterV2/counterpartRoster.builder.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const candidatesFor = ({
  actualCounterparts = [],
  birthTeamDocumentId = '',
  seasonKey = '',
} = {}) => (Array.isArray(actualCounterparts) ? actualCounterparts : [])
  .filter(row => (
    clean(row?.birthTeamDocumentId) === clean(birthTeamDocumentId) &&
    (!seasonKey || clean(row?.seasonKey) === clean(seasonKey))
  ))

const resolveCandidate = ({
  actualCounterparts = [],
  target = {},
} = {}) => candidatesFor({
  actualCounterparts,
  birthTeamDocumentId: target.birthTeamDocumentId,
  seasonKey: target.seasonKey,
}).find(row => row?.teamSeason) || null

export function compareRosterCounterpartsV2({
  expectedCounterparts = [],
  actualCounterparts = [],
} = {}) {
  const findings = []

  ;(Array.isArray(expectedCounterparts) ? expectedCounterparts : [])
    .forEach(expected => {
      const target = expected.target || {}
      const candidate = resolveCandidate({
        actualCounterparts,
        target,
      })

      // This matches the writer contract: a missing/unavailable counterpart
      // Team Season is not part of approvedCounterpartStates and is skipped.
      if (!candidate?.teamSeason) return

      const existingMovement = (
        Array.isArray(candidate.teamSeason?.[target.side])
          ? candidate.teamSeason[target.side]
          : []
      ).some(row => clean(row?.movementId) === clean(expected.movementId))

      if (existingMovement) return

      const reconciliation = buildApprovedCounterpartTeamSeason({
        current: candidate.teamSeason,
        fact: expected.fact,
        side: target.side,
      })

      // The writer intentionally skips conflicts. Audit must not promise more
      // than syncRosterCounterpartsV2 actually writes.
      if (reconciliation.conflict) return

      // changed=false means the movement is already represented. In
      // particular, an existing exact movementId is preserved by the writer;
      // Audit must not compare display/context fields the writer would not
      // replace (for example fromClubId).
      if (!reconciliation.changed) return

      findings.push({
        type: 'missing_projection',
        target: 'counterpart',
        documentId: clean(candidate.birthTeamDocumentId),
        seasonKey: clean(candidate.seasonKey),
        movementId: clean(expected.movementId),
        reason: 'The available counterpart Team Season is missing a movement that the Roster counterpart writer would add.',
        expected: expected.fact,
        actual: null,
      })
    })

  return findings
}
