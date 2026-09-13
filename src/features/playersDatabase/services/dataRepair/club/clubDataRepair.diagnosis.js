import { buildClubsMasterClubProjection } from '../../../domain/projections/club/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
// Firestore does not guarantee a useful insertion order for keys in nested
// maps.  A Clubs Master projection must therefore be compared by its values,
// not by the incidental key order returned by the client.
const stableValue = value => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (!value || typeof value !== 'object') return value

  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = stableValue(value[key])
      return result
    }, {})
}

const stable = value => JSON.stringify(stableValue(value))
const ageGroupSeasonKey = item => {
  const seasonKey = clean(item?.seasonKey || item?.seasonId)
  const teamId = clean(item?.teamId)
  return seasonKey && teamId ? `${seasonKey}__${teamId}` : ''
}

export const CLUB_DATA_ISSUE_CODE = Object.freeze({
  DUPLICATE_AGE_GROUP: 'duplicate_age_group',
  DUPLICATE_AGE_GROUP_SEASON: 'duplicate_age_group_season',
  MISSING_AGE_GROUP_SEASON_TEAM_ID: 'missing_age_group_season_team_id',
  DUPLICATE_COMPETITION_PATH: 'duplicate_competition_path',
  DUPLICATE_COMPETITION_PATH_SEASON: 'duplicate_competition_path_season',
  MASTER_ENTRY_MISMATCH: 'master_entry_mismatch',
})

const duplicatesBy = (items, keyGetter) => {
  const seen = new Set()
  const duplicates = new Set()

  ;(Array.isArray(items) ? items : []).forEach(item => {
    const key = clean(keyGetter(item))
    if (!key) return
    if (seen.has(key)) duplicates.add(key)
    seen.add(key)
  })

  return [...duplicates]
}

const omitRuntimeMetadata = value => {
  if (Array.isArray(value)) return value.map(omitRuntimeMetadata)
  if (!value || typeof value !== 'object') return value

  return Object.entries(value).reduce((result, [key, nested]) => {
    if (['updatedAt', 'lastWriteAt', 'lastWriteAction'].includes(key)) return result
    result[key] = omitRuntimeMetadata(nested)
    return result
  }, {})
}

export const buildClubDataRepairIssues = ({
  clubDocument = {},
  masterEntry = null,
} = {}) => {
  const issues = []
  const clubId = clean(clubDocument?.clubId || clubDocument?.id)
  const ageGroups = Array.isArray(clubDocument?.ageGroups) ? clubDocument.ageGroups : []
  const competitionPaths = Array.isArray(clubDocument?.competitionPaths)
    ? clubDocument.competitionPaths
    : []

  duplicatesBy(ageGroups, item => item?.ageGroupId).forEach(ageGroupId => {
    issues.push({
      code: CLUB_DATA_ISSUE_CODE.DUPLICATE_AGE_GROUP,
      severity: 'danger',
      clubId,
      ageGroupId,
      title: `כפילות קבוצת גיל ${ageGroupId}`,
      action: 'לבנות מחדש את מסמך המועדון מהמקורות הקנוניים',
    })
  })

  ageGroups.forEach(ageGroup => {
    ;(Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : [])
      .filter(season => !clean(season?.teamId))
      .forEach(season => {
        issues.push({
          code: CLUB_DATA_ISSUE_CODE.MISSING_AGE_GROUP_SEASON_TEAM_ID,
          severity: 'danger',
          clubId,
          ageGroupId: clean(ageGroup?.ageGroupId),
          seasonKey: clean(season?.seasonKey || season?.seasonId),
          title: 'חסר teamId בעונת קבוצת גיל',
          action: 'לבנות מחדש את projection של קבוצת הגיל/עונה',
        })
      })

    duplicatesBy(ageGroup?.seasons, ageGroupSeasonKey).forEach(identity => {
      issues.push({
        code: CLUB_DATA_ISSUE_CODE.DUPLICATE_AGE_GROUP_SEASON,
        severity: 'danger',
        clubId,
        ageGroupId: clean(ageGroup?.ageGroupId),
        seasonKey: identity.split('__')[0],
        teamId: identity.split('__')[1],
        title: `כפילות קבוצה/עונה ${identity} בקבוצת הגיל`,
        action: 'לבנות מחדש את projection של קבוצת הגיל/עונה',
      })
    })
  })

  duplicatesBy(competitionPaths, item => item?.birthYear).forEach(birthYear => {
    issues.push({
      code: CLUB_DATA_ISSUE_CODE.DUPLICATE_COMPETITION_PATH,
      severity: 'danger',
      clubId,
      birthYear: Number(birthYear) || 0,
      title: `כפילות מסלול ליגה לשנתון ${birthYear}`,
      action: 'לבנות מחדש את מסלול הליגה לשנתון',
    })
  })

  competitionPaths.forEach(path => {
    duplicatesBy(path?.seasons, ageGroupSeasonKey).forEach(identity => {
      issues.push({
        code: CLUB_DATA_ISSUE_CODE.DUPLICATE_COMPETITION_PATH_SEASON,
        severity: 'danger',
        clubId,
        birthYear: Number(path?.birthYear) || 0,
        seasonKey: identity.split('__')[0],
        teamId: identity.split('__')[1],
        title: `כפילות קבוצה/עונה ${identity} במסלול הליגה`,
        action: 'לבנות מחדש את projection של מסלול הליגה',
      })
    })
  })

  if (masterEntry) {
    const expected = omitRuntimeMetadata(buildClubsMasterClubProjection({ club: clubDocument }))
    const actual = omitRuntimeMetadata(masterEntry)

    if (stable(expected) !== stable(actual)) {
      issues.push({
        code: CLUB_DATA_ISSUE_CODE.MASTER_ENTRY_MISMATCH,
        severity: 'warning',
        clubId,
        title: 'Clubs Master אינו תואם למסמך המועדון',
        action: 'לבנות מחדש את רשומת המועדון ב-Clubs Master',
      })
    }
  }

  return issues
}
