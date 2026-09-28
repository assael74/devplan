import {
  shouldProjectStatsPlayerDocument,
} from '../../../domain/statsV2/playerDocumentStats.projection.js'
import {
  areComparableValuesEqual,
} from '../../shared/valueComparison.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const actualById = rows => new Map(
  (Array.isArray(rows) ? rows : [])
    .map(row => [clean(row?.playerDocumentId), row])
    .filter(([id]) => id)
)

export function compareStatsPlayerDocumentsV2({
  expectedPlayerDocuments = [],
  actualPlayerDocuments = [],
  seasonKey = '',
} = {}) {
  const findings = []
  const actualLookup = actualById(actualPlayerDocuments)

  ;(Array.isArray(expectedPlayerDocuments) ? expectedPlayerDocuments : [])
    .forEach(expected => {
      const actual = actualLookup.get(clean(expected.playerDocumentId)) || null
      const shouldExist = shouldProjectStatsPlayerDocument({
        player: expected.player,
        documentExists: actual?.exists === true,
      })

      if (!shouldExist) return

      if (!actual?.exists || !actual.document) {
        findings.push({
          type: 'missing_projection',
          target: 'playerDocument',
          documentId: clean(expected.playerDocumentId),
          reason: 'Stats requires this Player Document but it is missing.',
          expected: expected.seasonRow,
          actual: null,
        })
        return
      }

      const rows = Array.isArray(actual.document?.[expected.target])
        ? actual.document[expected.target]
        : []
      const actualSeasonRow = rows.find(row => (
        clean(row?.seasonKey) === clean(seasonKey)
      )) || null

      if (!actualSeasonRow) {
        findings.push({
          type: 'missing_projection',
          target: 'playerDocument',
          documentId: clean(expected.playerDocumentId),
          reason: 'Stats Player Document season projection is missing.',
          expected: expected.seasonRow,
          actual: null,
        })
        return
      }

      const actualOwned = Object.fromEntries(
        Object.keys(expected.seasonRow).map(key => [
          key,
          actualSeasonRow[key],
        ])
      )

      if (areComparableValuesEqual(actualOwned, expected.seasonRow)) return

      findings.push({
        type: 'projection_mismatch',
        target: 'playerDocument',
        documentId: clean(expected.playerDocumentId),
        reason: 'Stats-owned Player Document season fields do not match canonical Stats.',
        expected: expected.seasonRow,
        actual: actualOwned,
      })
    })

  return findings
}
