// src/features/playersDatabase/services/read/entities/teamRoots.read.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDoc } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

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
  }).filter(option => option.availableTeams.length > 0)
}
