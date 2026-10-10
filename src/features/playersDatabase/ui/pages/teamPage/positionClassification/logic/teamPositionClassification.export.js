// src/features/playersDatabase/ui/pages/teamPage/positionClassification/logic/teamPositionClassification.export.js

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../../catalog/clubs.catalog.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const safeFileName = value => clean(value)
  .replace(/[\\/:*?"<>|]/g, '-')
  .replace(/\s+/g, '-')

export const buildTeamPositionClassificationFileName = ({
  teamName = '',
  seasonKey = '',
  birthYear = '',
  ageGroupLabel = '',
} = {}) => (
  safeFileName([
    'סיווג-עמדה',
    teamName,
    birthYear ? `שנתון-${birthYear}` : '',
    ageGroupLabel,
    seasonKey,
  ].filter(Boolean).join('-')) || 'סיווג-עמדה'
)

const ROSTER_STATUS_LABELS = {
  regular: 'בסגל',
  youngerAgeGroup: 'שנתון צעיר',
  left: 'עזב',
  olderAgeException: 'חריג גיל',
  unknown: 'לא ידוע',
}

const clubNameById = new Map(PLAYERS_DATABASE_CLUBS_CATALOG.map(club => [
  clean(club?.id),
  clean(club?.shortName || club?.name || club?.id),
]))

const playerKeysOf = row => [
  row?.playerId,
  row?.playerDocumentId,
  row?.externalPlayerId,
  row?.id,
  row?.player?.playerId,
  row?.player?.playerDocumentId,
  row?.player?.externalPlayerId,
  row?.player?.id,
].map(clean).filter(Boolean)

const movementPlayerKey = movement => clean(
  movement?.playerId || movement?.playerDocumentId || movement?.externalPlayerId
)

const explicitMovementTeamName = ({ movement, side }) => clean(
  movement?.[`${side}TeamName`] ||
  movement?.[`${side}BirthTeamName`] ||
  movement?.[`${side}ClubName`]
)

const movementTeamName = ({ movement, side }) => {
  const explicitName = explicitMovementTeamName({ movement, side })
  const clubId = clean(movement?.[`${side}ClubId`])
  const clubName = explicitName || clubNameById.get(clubId) || clubId
  const slot = Number(
    movement?.[`${side}BirthTeamSlot`] || movement?.[`${side}TeamSlot`] || 1
  ) || 1

  if (!clubName) {
    return clean(
      movement?.[`${side}BirthTeamDocumentId`] || movement?.[`${side}BirthTeamId`]
    )
  }

  return slot > 1 ? `${clubName} · קבוצה ${slot}` : clubName
}

const uniqueLabels = values => [...new Set(values.map(clean).filter(Boolean))].join(' | ')

const buildMovementLookup = movements => {
  const lookup = new Map()

  ;(Array.isArray(movements) ? movements : []).forEach(movement => {
    const key = movementPlayerKey(movement)
    if (!key) return
    lookup.set(key, [...(lookup.get(key) || []), movement])
  })

  return lookup
}

const movementsForRow = ({ row, lookup }) => {
  for (const key of playerKeysOf(row)) {
    if (lookup.has(key)) return lookup.get(key)
  }

  return []
}

const buildSupplementalExportRows = ({ rows, seasonDoc }) => {
  const existingKeys = new Set(rows.flatMap(playerKeysOf))
  const supplements = []

  ;(Array.isArray(seasonDoc?.resolvedRosterAbsences)
    ? seasonDoc.resolvedRosterAbsences
    : []).forEach(absence => {
    if (playerKeysOf(absence).some(key => existingKeys.has(key))) return

    const row = {
      id: clean(absence?.playerId || absence?.externalPlayerId),
      playerId: clean(absence?.playerId),
      externalPlayerId: clean(absence?.externalPlayerId),
      name: clean(absence?.fullName) || 'שחקן ללא שם',
      birthYear: Number(absence?.birthYear) || '',
      exportRosterStatus: clean(absence?.resolution) || 'unknown',
    }
    supplements.push(row)
    playerKeysOf(row).forEach(key => existingKeys.add(key))
  })

  ;[
    ...(Array.isArray(seasonDoc?.transfersIn)
      ? seasonDoc.transfersIn.map(movement => ({ movement, rosterStatus: 'regular' }))
      : []),
    ...(Array.isArray(seasonDoc?.transfersOut)
      ? seasonDoc.transfersOut.map(movement => ({ movement, rosterStatus: 'left' }))
      : []),
  ].forEach(({ movement, rosterStatus }) => {
    const key = movementPlayerKey(movement)
    if (!key || existingKeys.has(key)) return

    const row = {
      id: key,
      playerId: clean(movement?.playerId || movement?.playerDocumentId),
      externalPlayerId: clean(movement?.externalPlayerId),
      name: clean(movement?.fullName || movement?.playerName) || 'שחקן ללא שם',
      exportRosterStatus: rosterStatus,
    }
    supplements.push(row)
    playerKeysOf(row).forEach(playerKey => existingKeys.add(playerKey))
  })

  return supplements
}

export const buildTeamPositionClassificationExportRows = ({
  rows = [],
  seasonDoc = null,
  teamName = '',
} = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const allRows = [
    ...safeRows,
    ...buildSupplementalExportRows({ rows: safeRows, seasonDoc }),
  ]
  const transfersInLookup = buildMovementLookup(seasonDoc?.transfersIn)
  const transfersOutLookup = buildMovementLookup(seasonDoc?.transfersOut)

  return allRows.map(row => {
    const transfersIn = movementsForRow({ row, lookup: transfersInLookup })
    const transfersOut = movementsForRow({ row, lookup: transfersOutLookup })

    return {
      ...row,
      transferFromTeamName: uniqueLabels([
        ...transfersIn.map(movement => movementTeamName({ movement, side: 'from' })),
        ...(transfersOut.length ? [teamName] : []),
      ]),
      transferToTeamName: uniqueLabels([
        ...(transfersIn.length ? [teamName] : []),
        ...transfersOut.map(movement => movementTeamName({ movement, side: 'to' })),
      ]),
      hasIncomingTransfer: transfersIn.length > 0,
      hasOutgoingTransfer: transfersOut.length > 0,
    }
  })
}

const externalPlayerIdOf = row => clean(
  row?.externalPlayerId || row?.player?.externalPlayerId
)

const playerIdentifierOf = row => clean(
  row?.player?.playerId || row?.player?.playerDocumentId || row?.playerId || row?.id
)

const transferCheckOf = row => clean(
  row?.transferCheck || row?.player?.transferCheck
)

export const TEAM_POSITION_CLASSIFICATION_EXPORT_COLUMNS = Object.freeze([
  // Keep this import-compatible block first, in the same order as the Stats Load modal.
  ['אינדקס', (row, index) => row.sourceIndex || index + 1],
  ['שם שחקן', row => row.name],
  ['מזהה שחקן חיצוני', externalPlayerIdOf],
  ['קישור שחקן', row => row.playerUrl],
  ['מס. משחקים', row => row.games],
  ['שערים', row => row.goals],
  ['כ. צהובים', row => row.yellowCards],
  ['טוטו', row => row.toto],
  ['כ. אדומים', row => row.redCards],
  ['הרכב פותח', row => row.starts],
  ['נכנס כמחליף', row => row.substituteIn],
  ['הוחלף', row => row.substitutedOut],
  ['דקות משחק', row => row.minutes],

  // Enriched squad, classification, and derived-statistics fields follow the source block.
  ['סטטוס סגל', row => ROSTER_STATUS_LABELS[
    clean(row.exportRosterStatus || row.rosterStatus)
  ] || 'לא ידוע'],
  ['קבוצה ממנה עבר', row => row.transferFromTeamName],
  ['קבוצה אליה עבר', row => row.transferToTeamName],
  ['דקות קבוצה', row => row.teamMinutes],
  ['דקות אפשריות אישיות', row => row.possiblePlayerMinutes],
  ['אחוז דקות אישי', row => row.minutesRate],
  ['טווח דקות', row => row.minutesBand],
  ['שיעור חילופים', row => row.substitutionRate],
  ['טווח חילופים', row => row.substitutionBand],
  ['חוליה', row => clean(row.classification?.line)],
  ['עמדה', row => clean(row.classification?.position)],
  ['כלל הסיווג', row => row.rule],
  ['מקור סיווג', row => clean(row.classification?.source)],
  ['רמת ראיה', row => clean(row.classification?.evidenceLevel)],
  ['גרסת מודל', row => clean(row.classification?.modelVersion)],

  // QA-only columns. They are included for controlled Excel comparison and
  // never participate in Movement reconciliation or identity resolution.
  ['בקרת העברה', transferCheckOf],
  ['מזהה שחקן פנימי', playerIdentifierOf],
])

const HEADER_STYLE = {
  fill: { patternType: 'solid', fgColor: { rgb: 'E5E7EB' } },
  font: { bold: true, color: { rgb: '1F2937' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
    left: { style: 'thin', color: { rgb: 'D1D5DB' } },
    right: { style: 'thin', color: { rgb: 'D1D5DB' } },
  },
}

export default async function exportTeamPositionClassificationToXlsx({
  rows = [],
  seasonDoc = null,
  teamName = '',
  seasonKey = '',
  birthYear = '',
  ageGroupLabel = '',
} = {}) {
  const safeRows = buildTeamPositionClassificationExportRows({
    rows,
    seasonDoc,
    teamName,
  })
  if (!safeRows.length) return false

  const XLSX = await import('xlsx')
  const headers = TEAM_POSITION_CLASSIFICATION_EXPORT_COLUMNS.map(([label]) => label)
  const dataRows = safeRows.map((row, index) => (
    TEAM_POSITION_CLASSIFICATION_EXPORT_COLUMNS.map(([, getValue]) => {
      const value = getValue(row, index)
      return value === undefined || value === null ? '' : value
    })
  ))
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows])

  worksheet['!autofilter'] = {
    ref: XLSX.utils.encode_range({
      s: { c: 0, r: 0 },
      e: { c: headers.length - 1, r: dataRows.length },
    }),
  }
  worksheet['!cols'] = headers.map(header => ({
    wch: Math.max(
      header.length + 2,
      header === 'שם שחקן' ? 26 : header === 'קישור שחקן' ? 48 : 14
    ),
  }))

  headers.forEach((_, columnIndex) => {
    const cell = worksheet[XLSX.utils.encode_cell({ c: columnIndex, r: 0 })]
    if (cell) cell.s = HEADER_STYLE
  })

  const workbook = XLSX.utils.book_new()
  workbook.Workbook = { Views: [{ RTL: true }] }
  XLSX.utils.book_append_sheet(workbook, worksheet, 'סיווג עמדה')
  XLSX.writeFile(
    workbook,
    `${buildTeamPositionClassificationFileName({
      teamName,
      seasonKey,
      birthYear,
      ageGroupLabel,
    })}.xlsx`
  )

  return true
}
