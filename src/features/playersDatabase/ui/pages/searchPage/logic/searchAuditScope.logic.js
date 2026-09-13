const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const getRowTeamDocumentId = row => clean(
  row?.teamDocumentId ||
  row?.birthTeamDocumentId ||
  row?.birthTeamId ||
  row?.teamId
)

const getRowSeasonKey = row => clean(
  row?.seasonKey ||
  row?.seasonId
)

export const buildPartialAuditDefaults = rows => {
  const safeRows = Array.isArray(rows)
    ? rows
    : []
  const scopeKeys = [
    ...new Set(
      safeRows
        .map(row => {
          const teamDocumentId = getRowTeamDocumentId(row)
          const seasonKey = getRowSeasonKey(row)

          return teamDocumentId && seasonKey
            ? `${teamDocumentId}::${seasonKey}`
            : ''
        })
        .filter(Boolean)
    ),
  ]

  if (scopeKeys.length !== 1) {
    return {
      teamDocumentId: '',
      seasonKey: '',
    }
  }

  const [teamDocumentId, seasonKey] = scopeKeys[0].split('::')

  return {
    teamDocumentId,
    seasonKey,
  }
}
