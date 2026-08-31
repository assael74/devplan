// features/playersDatabase/services/write/teams/teamDoc.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  buildTeamSeasonDocumentId,
  normalizeTeamIdentity,
  resolveBirthTeamDocumentId,
} from '../../../model/teamIdentity.model.js'
import {
  pickFirstValue,
  toNumberOrZero,
} from '../../../model/value.model.js'
import { clean } from '../leagues/leagueDoc.js'

import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'

const getBirthTeamId = team => resolveBirthTeamDocumentId(team)

const normalizeSeasonStatus = value => (
  clean(value) === 'completed' ? 'completed' : 'active'
)

const buildSeasonIndexEntry = ({ birthTeamDocumentId, season = {} } = {}) => {
  const seasonKey = clean(season.seasonKey)
  const seasonDocumentId = buildTeamSeasonDocumentId(
    birthTeamDocumentId,
    seasonKey
  )

  if (!seasonKey || !seasonDocumentId) return null

  return {
    seasonKey,
    seasonDocumentId,
    seasonStatus: normalizeSeasonStatus(season.seasonStatus),
  }
}

export const normalizeTeamSeasonsIndex = ({
  birthTeamDocumentId = '',
  seasons = [],
} = {}) => {
  const entriesBySeasonKey = new Map()

  ;(Array.isArray(seasons) ? seasons : []).forEach(season => {
    const entry = buildSeasonIndexEntry({ birthTeamDocumentId, season })
    if (entry) entriesBySeasonKey.set(entry.seasonKey, entry)
  })

  return [...entriesBySeasonKey.values()]
}

export const upsertTeamSeasonsIndex = ({
  birthTeamDocumentId = '',
  seasons = [],
  season = {},
} = {}) => normalizeTeamSeasonsIndex({
  birthTeamDocumentId,
  seasons: [...(Array.isArray(seasons) ? seasons : []), season],
})

export const removeTeamSeasonFromIndex = ({
  birthTeamDocumentId = '',
  seasons = [],
  seasonKey = '',
} = {}) => normalizeTeamSeasonsIndex({
  birthTeamDocumentId,
  seasons: (Array.isArray(seasons) ? seasons : []).filter(entry => (
    clean(entry?.seasonKey) !== clean(seasonKey)
  )),
})

export const teamDocRef = teamId =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.teams, clean(teamId))

export const buildTeamBaseDoc = (team = {}, currentData = {}) => {
  const identity = normalizeTeamIdentity({
    team,
    fallback: currentData,
  })
  const birthTeamDocumentId = identity.birthTeamDocumentId

  return {
    id: birthTeamDocumentId,
    clubId: identity.clubId,
    birthTeamId: identity.birthTeamId || birthTeamDocumentId,
    birthTeamDocumentId,
    birthYear: toNumberOrZero(pickFirstValue(team.birthYear, currentData.birthYear)),
    birthTeamSlot: identity.birthTeamSlot,
    displayName: clean(pickFirstValue(
      team.displayName,
      team.teamName,
      currentData.displayName
    )),
    seasons: normalizeTeamSeasonsIndex({
      birthTeamDocumentId,
      seasons: currentData.seasons,
    }),
    createdAt: currentData.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

export const buildTeamRootWithSeasonIndex = ({
  team = {},
  currentData = {},
  season = {},
} = {}) => {
  const root = buildTeamBaseDoc(team, currentData)

  return {
    ...root,
    seasons: upsertTeamSeasonsIndex({
      birthTeamDocumentId: root.birthTeamDocumentId,
      seasons: currentData.seasons,
      season,
    }),
  }
}

export const buildTeamRootWithoutSeasonIndex = ({
  team = {},
  currentData = {},
  seasonKey = '',
} = {}) => {
  const root = buildTeamBaseDoc(team, currentData)

  return {
    ...root,
    seasons: removeTeamSeasonFromIndex({
      birthTeamDocumentId: root.birthTeamDocumentId,
      seasons: currentData.seasons,
      seasonKey,
    }),
  }
}

export async function ensureTeamDoc(team = {}) {
  const birthTeamDocumentId = getBirthTeamId(team)
  if (!birthTeamDocumentId) throw new Error('Missing birth team id')

  const ref = teamDocRef(birthTeamDocumentId)

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    const currentData = snapshot.exists() ? snapshot.data() || {} : {}
    const docData = buildTeamBaseDoc({
      ...team,
      birthTeamDocumentId,
    }, currentData)

    // Root-only canonical write: never preserve legacy current/history season arrays.
    transaction.set(ref, docData)

    return {
      birthTeamDocumentId,
      teamDocumentId: birthTeamDocumentId,
      created: !snapshot.exists(),
    }
  })
}
