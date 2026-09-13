// The compact identity index is an advisory preflight source.
// League documents remain the canonical source after a write.

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const resolveLeagueClubIdentityIndex = ({
  rows = [],
  identityIndex = {},
  seasonKey = '',
  birthYear = 0,
  ageGroupId = '',
  leagueId = '',
  leagueLevel = 0,
} = {}) => {
  const previewRows = Array.isArray(rows) ? rows : []
  if (Number(leagueLevel) < 2) return { rows: previewRows, warnings: [] }

  const safeSeasonKey = clean(seasonKey)
  const safeBirthYear = Number(birthYear) || 0
  const safeAgeGroupId = clean(ageGroupId)
  const safeLeagueId = clean(leagueId)
  const indexEntries = Array.isArray(identityIndex?.entries) ? identityIndex.entries : []

  const warnings = []
  const resolvedRows = previewRows.map((row, rowIndex) => {
    const clubId = clean(row?.clubId)
    const selectedTeamSlot = Number(row?.teamSlot) || 1
    const comparisons = indexEntries.map((item, entryIndex) => ({
      entryIndex,
      expected: {
        seasonKey: safeSeasonKey,
        birthYear: safeBirthYear,
        ageGroupId: safeAgeGroupId,
        clubId,
        teamSlot: selectedTeamSlot,
        differentLeagueId: safeLeagueId,
      },
      actual: {
        seasonKey: clean(identityIndex?.seasonKey),
        birthYear: Number(identityIndex?.birthYear) || 0,
        ageGroupId: clean(item?.ageGroupId),
        clubId: clean(item?.clubId),
        teamSlot: Number(item?.teamSlot) || 1,
        leagueId: clean(item?.leagueId),
        leagueName: clean(item?.leagueName),
      },
      matches: {
        seasonKey: clean(identityIndex?.seasonKey) === safeSeasonKey,
        birthYear: (Number(identityIndex?.birthYear) || 0) === safeBirthYear,
        ageGroupId: clean(item?.ageGroupId) === safeAgeGroupId,
        clubId: clean(item?.clubId) === clubId,
        teamSlot: (Number(item?.teamSlot) || 1) === selectedTeamSlot,
        differentLeagueId: clean(item?.leagueId) !== safeLeagueId,
      },
    }))

    console.groupCollapsed(`[League import identity] row ${rowIndex + 1}: ${clubId || 'missing club'}`)
    console.log('Selected row', {
      seasonKey: safeSeasonKey,
      birthYear: safeBirthYear,
      ageGroupId: safeAgeGroupId,
      clubId,
      teamSlot: selectedTeamSlot,
      leagueId: safeLeagueId,
    })
    console.table(comparisons)
    console.groupEnd()

    const clubAppearances = indexEntries.filter(item => (
      clean(item?.clubId) === clubId &&
      clean(item?.ageGroupId) === safeAgeGroupId
    ))
    const sameLeagueAppearances = clubAppearances.filter(item => (
      clean(item?.leagueId) === safeLeagueId
    ))

    // A team already written to this league is the strongest signal. Reuse its
    // slot instead of reporting it as a cross-league ambiguity.
    if (clubId && sameLeagueAppearances.length) {
      const existingSlot = Number(sameLeagueAppearances[0]?.teamSlot) || 1
      return {
        ...row,
        teamSlot: String(existingSlot),
        teamSlotConfirmed: true,
      }
    }

    const otherLeagueAppearances = clubAppearances.filter(item => (
      clean(item?.leagueId) !== safeLeagueId
    ))

    if (!clubId || !otherLeagueAppearances.length) return row

    const selectedSlotAppearances = otherLeagueAppearances.filter(item => (
      (Number(item?.teamSlot) || 1) === selectedTeamSlot
    ))
    const selectedSlotConflict = selectedSlotAppearances.length > 0

    warnings.push({
      rowIndex,
      clubId,
      appearances: otherLeagueAppearances,
      selectedSlotConflict,
      message: selectedSlotConflict
        ? `מספר קבוצה ${selectedTeamSlot} של המועדון כבר מופיע בשנתון ${safeBirthYear}\nבעונת ${safeSeasonKey} בליגה: ${selectedSlotAppearances.map(item => item?.leagueName || item?.leagueId).filter(Boolean).join(', ')}.\nבחר מספר קבוצה פנוי לפני אישור.`
        : `המועדון כבר מופיע בשנתון ${safeBirthYear} בעונת ${safeSeasonKey} בליגה: ${otherLeagueAppearances.map(item => item?.leagueName || item?.leagueId).filter(Boolean).join(', ')}. בדוק את מספר הקבוצה לפני אישור.`,
    })
    return row
  })

  return { rows: resolvedRows, warnings }
}

export const findLeagueClubMasterWarnings = options => (
  resolveLeagueClubIdentityIndex(options).warnings
)
