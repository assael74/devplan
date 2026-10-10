// src/features/playersDatabase/services/read/entities/teamRoots.read.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamId } from '../../../domain/identity/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const movementTeamSlots = [1, 2, 3]
const clubCatalogOrderById = new Map(
  PLAYERS_DATABASE_CLUBS_CATALOG.map((club, index) => [clean(club?.id), index])
)

const compareTeamRootOptionsByClubCatalog = (left, right) => {
  const leftOrder = clubCatalogOrderById.get(clean(left?.clubId))
  const rightOrder = clubCatalogOrderById.get(clean(right?.clubId))
  const hasLeftOrder = Number.isInteger(leftOrder)
  const hasRightOrder = Number.isInteger(rightOrder)

  if (hasLeftOrder && hasRightOrder && leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }
  if (hasLeftOrder) return -1
  if (hasRightOrder) return 1

  return clean(left?.label).localeCompare(clean(right?.label), 'he')
}

const resolveDirectoryClubLabel = (clubId, club) => clean(
  club?.names?.short ||
  club?.names?.display ||
  club?.names?.official ||
  clubId
)

export const buildMovementTeamOptions = ({
  clubsDirectory = null,
  existingOptions = [],
  birthYear = 0,
  excludedBirthTeamDocumentId = '',
} = {}) => {
  const clubsById = clubsDirectory?.clubsById && typeof clubsDirectory.clubsById === 'object'
    ? clubsDirectory.clubsById
    : {}
  if (!Object.keys(clubsById).length) return existingOptions

  const targetBirthYear = Number(birthYear)
  const excludedId = clean(excludedBirthTeamDocumentId)
  const existingByClubId = new Map(
    existingOptions.map(option => [clean(option?.clubId), option])
  )

  return Object.entries(clubsById).map(([clubId, club]) => {
    const existing = existingByClubId.get(clean(clubId)) || null
    const clubLevel = club?.clubLevel === undefined
      ? existing?.clubLevel === undefined ? null : existing.clubLevel
      : club.clubLevel
    const existingTeams = Array.isArray(existing?.availableTeams)
      ? existing.availableTeams
      : []
    const existingTeamsBySlot = new Map(existingTeams.map(team => [
      Number(team?.birthTeamSlot || team?.teamSlot),
      team,
    ]))
    const availableTeams = targetBirthYear
      ? movementTeamSlots.map(teamSlot => {
          const existingTeam = existingTeamsBySlot.get(teamSlot)
          if (existingTeam) return existingTeam

          const teamId = buildTeamId({
            clubId,
            birthYear: targetBirthYear,
            teamSlot,
          })
          return {
            clubId,
            clubLevel,
            teamId,
            teamSeasonDocumentId: '',
            birthTeamId: teamId,
            birthTeamDocumentId: teamId,
            teamSlot,
            birthTeamSlot: teamSlot,
            birthYear: targetBirthYear,
          }
        }).filter(team => clean(team?.birthTeamDocumentId) !== excludedId)
      : existingTeams
    const label = resolveDirectoryClubLabel(clubId, club)

    return {
      clubId,
      clubLevel,
      clubName: label,
      displayName: clean(club?.names?.display || label),
      label,
      availableTeams,
    }
  })
    .filter(option => option.availableTeams.length > 0)
    .sort(compareTeamRootOptionsByClubCatalog)
}

export async function listExistingTeamRootOptions({
  seasonId = '',
  ageGroupId = '',
  birthYear = 0,
  excludedBirthTeamDocumentId = '',
} = {}) {
  const resolvedSeasonId = clean(seasonId)
  if (!resolvedSeasonId) return []
  const snapshot = await trackedGetDoc(
    doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsCenter, resolvedSeasonId),
    {
      feature: 'playersDatabase',
      action: 'team-root-options-read',
      collection: PLAYERS_DATABASE_COLLECTIONS.clubsCenter,
    }
  )
  if (!snapshot.exists()) return []

  const source = snapshot.data() || {}
  const excludedId = clean(excludedBirthTeamDocumentId)
  const targetAgeGroupId = clean(ageGroupId)
  const targetBirthYear = Number(birthYear)

  return Object.entries(source.clubsById || {}).map(([clubId, club]) => {
    const availableTeams = Object.entries(club?.teamsById || {})
      .filter(([teamId, team]) => {
        const teamSlot = Number(team?.teamSlot)
        return teamId !== excludedId &&
          Number.isInteger(teamSlot) && teamSlot > 0 &&
          (!targetAgeGroupId || clean(team?.ageGroupId) === targetAgeGroupId) &&
          (!targetBirthYear || Number(team?.birthYear) === targetBirthYear)
      })
      .map(([teamId, team]) => ({
        clubId,
        clubLevel: club?.clubLevel === undefined ? null : club.clubLevel,
        teamId,
        teamSeasonDocumentId: clean(team?.teamSeasonDocumentId),
        birthTeamId: teamId,
        birthTeamDocumentId: teamId,
        teamSlot: Number(team?.teamSlot),
        birthTeamSlot: Number(team?.teamSlot),
        birthYear: Number(team?.birthYear || 0),
      }))
      .sort((left, right) => left.teamSlot - right.teamSlot)

    return {
      clubId,
      clubLevel: club?.clubLevel === undefined ? null : club.clubLevel,
      clubName: clean(club?.shortName || club?.displayName || clubId),
      displayName: clean(club?.displayName || club?.shortName || clubId),
      label: clean(club?.shortName || club?.displayName || clubId),
      availableTeams,
    }
  })
    .filter(option => option.availableTeams.length > 0)
    .sort(compareTeamRootOptionsByClubCatalog)
}
