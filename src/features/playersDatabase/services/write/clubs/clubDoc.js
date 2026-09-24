// features/playersDatabase/services/write/clubs/clubDoc.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildClubDocumentProjection,
  buildNextCompetitionPath,
  removeClubAgeGroupSeasonProjections,
  removeOrphanedClubCompetitionPathSeasons,
} from '../../../domain/projections/club/index.js'
import { cleanValue } from '../../../model/shared/value.model.js'
import {
  trackedGetDoc,
  trackedRunTransaction,
} from '../../../../../services/firestore/usage/index.js'

const clean = cleanValue
const isActive = value => clean(value).toLowerCase() === 'active'

const hasRequiredCompetitionTarget = ({ club = {}, target = {} } = {}) => {
  const ageGroup = (Array.isArray(club?.ageGroups) ? club.ageGroups : []).find(group => (
    clean(group?.ageGroupId) === clean(target?.ageGroupId)
  ))
  const clubSeason = (Array.isArray(ageGroup?.seasons) ? ageGroup.seasons : []).find(season => (
    clean(season?.seasonKey || season?.seasonId) === clean(target?.seasonKey) &&
    clean(season?.teamId) === clean(target?.teamId) &&
    clean(season?.league?.leagueId) === clean(target?.leagueId)
  ))
  const path = (Array.isArray(club?.competitionPaths) ? club.competitionPaths : []).find(path => (
    Number(path?.birthYear) === Number(target?.birthYear)
  ))
  const competitionSeason = (Array.isArray(path?.seasons) ? path.seasons : []).find(season => (
    clean(season?.seasonKey || season?.seasonId) === clean(target?.seasonKey) &&
    clean(season?.teamId) === clean(target?.teamId) &&
    clean(season?.ageGroupId) === clean(target?.ageGroupId) &&
    clean(season?.leagueId) === clean(target?.leagueId)
  ))

  return Boolean(
    clubSeason && competitionSeason &&
    Number(clubSeason?.birthYear) === Number(target?.birthYear) &&
    isActive(clubSeason?.seasonStatus) &&
    isActive(competitionSeason?.seasonStatus)
  )
}

const omitRuntimeMetadata = value => {
  if (Array.isArray(value)) return value.map(omitRuntimeMetadata)
  if (!value || typeof value !== 'object') return value

  return Object.entries(value).reduce((result, [key, nested]) => {
    if (['createdAt', 'updatedAt', 'lastWriteAt', 'lastWriteAction'].includes(key)) {
      return result
    }
    result[key] = omitRuntimeMetadata(nested)
    return result
  }, {})
}

export const isSameClubProjectionState = (currentData = {}, nextData = {}) => (
  JSON.stringify(omitRuntimeMetadata(currentData)) ===
  JSON.stringify(omitRuntimeMetadata(nextData))
)

export const clubDocRef = clubId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.clubs, clean(clubId))

export async function readClubDocument({ clubId = '' } = {}) {
  const resolvedClubId = clean(clubId)
  if (!resolvedClubId) throw new Error('Missing club id')

  const snapshot = await trackedGetDoc(clubDocRef(resolvedClubId), {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.clubs,
    action: 'club-competition-override-read',
    operationSubtype: 'projection-getDoc',
  })

  return {
    clubId: resolvedClubId,
    exists: snapshot.exists(),
    club: snapshot.exists() ? snapshot.data() || {} : null,
  }
}

export async function upsertClubDocument({
  clubIdentity = {},
  ageGroupSeasonProjection = null,
  competitionPathUpdate = null,
  competitionPathUpdates = [],
  propagateCompetitionFromBirthYear = 0,
  propagateCompetitionSeasonKey = '',
  propagateCompetitionTeamId = '',
  propagateCompetitionTeamSlot = null,
  requiredCompetitionTarget = null,
  projectionVersion = 1,
  lastWriteAction = '',
  transactionGuard = null,
} = {}) {
  const clubId = clean(clubIdentity?.clubId || clubIdentity?.id)
  if (!clubId) throw new Error('Missing club id')

  const ref = clubDocRef(clubId)

  return trackedRunTransaction(db, async transaction => {
    const guardSnapshot = transactionGuard?.ref
      ? await transaction.get(transactionGuard.ref)
      : null
    const snapshot = await transaction.get(ref)

    if (guardSnapshot) {
      const guardField = clean(transactionGuard.field)
      const expectedGuardValue = clean(transactionGuard.expected)
      const currentGuardValue = clean(guardSnapshot.exists()
        ? guardSnapshot.data()?.[guardField]
        : '')

      if (!guardSnapshot.exists() || !guardField || currentGuardValue !== expectedGuardValue) {
        return {
          clubId,
          updated: false,
          changed: false,
          writeSkipped: true,
          guardSuperseded: true,
        }
      }
    }

    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    if (requiredCompetitionTarget && !hasRequiredCompetitionTarget({
      club: currentData,
      target: requiredCompetitionTarget,
    })) {
      throw new Error('Required Club competition target is missing or not active')
    }

    const pathUpdates = [
      ...(competitionPathUpdate ? [competitionPathUpdate] : []),
      ...(Array.isArray(competitionPathUpdates) ? competitionPathUpdates : []),
    ]
    let projected = pathUpdates.reduce((nextClub, pathUpdate) => (
      buildClubDocumentProjection({
        existingClub: nextClub,
        clubIdentity: {
          ...clubIdentity,
          clubId,
        },
        ageGroupSeasonProjection: nextClub === currentData ? ageGroupSeasonProjection : null,
        competitionPathUpdate: pathUpdate,
        projectionVersion,
        updatedAt: currentData.updatedAt || null,
      })
    ), pathUpdates.length
      ? currentData
      : buildClubDocumentProjection({
          existingClub: currentData,
          clubIdentity: { ...clubIdentity, clubId },
          ageGroupSeasonProjection,
          projectionVersion,
          updatedAt: currentData.updatedAt || null,
        }))

    const sourceBirthYear = Number(propagateCompetitionFromBirthYear) || 0
    if (sourceBirthYear) {
      const sourcePath = (Array.isArray(projected?.competitionPaths)
        ? projected.competitionPaths
        : []).find(path => Number(path?.birthYear) === sourceBirthYear)
      const sourceSeason = (Array.isArray(sourcePath?.seasons) ? sourcePath.seasons : []).find(
        season => (
          clean(season?.seasonKey || season?.seasonId) === clean(propagateCompetitionSeasonKey) &&
          (!clean(propagateCompetitionTeamId) ||
            clean(season?.teamId) === clean(propagateCompetitionTeamId))
        )
      ) || null
      const effectiveProjection = sourceSeason?.competitionProjection?.effective || null

      projected = buildClubDocumentProjection({
        existingClub: projected,
        clubIdentity: { ...clubIdentity, clubId },
        competitionPathUpdate: {
          birthYear: sourceBirthYear + 1,
          nextCompetitionPath: buildNextCompetitionPath({
            sourceBirthYear,
            sourceTeamId: sourceSeason?.teamId || propagateCompetitionTeamId,
            sourceTeamSlot: sourceSeason?.teamSlot || propagateCompetitionTeamSlot,
            effectiveProjection,
            reason: effectiveProjection ? null : 'SOURCE_COHORT_NOT_LOADED',
          }),
        },
        projectionVersion,
        updatedAt: currentData.updatedAt || null,
      })
    }

    const writeSkipped = snapshot.exists() &&
      isSameClubProjectionState(currentData, projected)

    if (!writeSkipped) {
      transaction.set(ref, {
        ...projected,
        clubId,
        projectionVersion: Number(projectionVersion) || 1,
        createdAt: currentData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastWriteAction: clean(lastWriteAction),
        lastWriteAt: serverTimestamp(),
      })
    }

    return {
      clubId,
      created: !snapshot.exists(),
      updated: !writeSkipped,
      changed: !writeSkipped,
      writeSkipped,
    }
  })
}

export async function removeClubDocumentAgeGroupSeasonProjections({
  clubId = '',
  removals = [],
  projectionVersion = 1,
  lastWriteAction = '',
} = {}) {
  const resolvedClubId = clean(clubId)
  if (!resolvedClubId) throw new Error('Missing club id')

  const ref = clubDocRef(resolvedClubId)
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        clubId: resolvedClubId,
        updated: false,
        changed: false,
        writeSkipped: true,
        reason: 'clubDocumentMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const projected = removeClubAgeGroupSeasonProjections({
      existingClub: currentData,
      removals,
    })
    const writeSkipped = isSameClubProjectionState(currentData, projected)

    if (!writeSkipped) {
      transaction.set(ref, {
        ...projected,
        projectionVersion: Number(projectionVersion) || 1,
        updatedAt: serverTimestamp(),
        lastWriteAction: clean(lastWriteAction),
        lastWriteAt: serverTimestamp(),
      })
    }

    return {
      clubId: resolvedClubId,
      updated: !writeSkipped,
      changed: !writeSkipped,
      writeSkipped,
    }
  })
}

export async function removeClubDocumentOrphanedCompetitionPathSeasons({
  clubId = '',
  targets = [],
  projectionVersion = 1,
  lastWriteAction = '',
} = {}) {
  const resolvedClubId = clean(clubId)
  if (!resolvedClubId) throw new Error('Missing club id')

  const ref = clubDocRef(resolvedClubId)
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      return {
        clubId: resolvedClubId,
        updated: false,
        changed: false,
        writeSkipped: true,
        reason: 'clubDocumentMissing',
      }
    }

    const currentData = snapshot.data() || {}
    const projected = removeOrphanedClubCompetitionPathSeasons({
      existingClub: currentData,
      targets,
    })
    const writeSkipped = isSameClubProjectionState(currentData, projected)
    if (!writeSkipped) {
      transaction.set(ref, {
        ...projected,
        projectionVersion: Number(projectionVersion) || 1,
        updatedAt: serverTimestamp(),
        lastWriteAction: clean(lastWriteAction),
        lastWriteAt: serverTimestamp(),
      })
    }

    return {
      clubId: resolvedClubId,
      updated: !writeSkipped,
      changed: !writeSkipped,
      writeSkipped,
    }
  })
}
