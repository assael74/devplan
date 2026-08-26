// src/features/playersDatabase/services/audit/audit.read.js

import {
  collection,
  limit,
  query,
  startAfter,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  trackedGetDocsFromServer,
} from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import {
  AUDIT_COLLECTION_SCOPE,
  AUDIT_RELATION_SCOPE,
  AUDIT_SCOPE_TYPE,
} from './audit.scope.js'

const PAGE_LIMIT = 5000
const READ_SAFETY_LIMIT = 49000

export const AUDIT_READ_COLLECTION = Object.freeze({
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  PLAYERS: 'players',
  SEARCH_INDEXES: 'searchIndexes',
})

const RELATION_READ_REQUIREMENTS = Object.freeze({
  [AUDIT_RELATION_SCOPE.LEAGUE_TEAMS]: {
    collections: [AUDIT_READ_COLLECTION.LEAGUES, AUDIT_READ_COLLECTION.TEAMS],
  },
  [AUDIT_RELATION_SCOPE.LEAGUE_TEAM_INDEXES]: {
    collections: [AUDIT_READ_COLLECTION.LEAGUES, AUDIT_READ_COLLECTION.SEARCH_INDEXES],
    searchEntityTypes: ['birthTeamSeason'],
  },
  [AUDIT_RELATION_SCOPE.TEAMS_TEAM_INDEXES]: {
    collections: [AUDIT_READ_COLLECTION.TEAMS, AUDIT_READ_COLLECTION.SEARCH_INDEXES],
    searchEntityTypes: ['birthTeamSeason'],
  },
  [AUDIT_RELATION_SCOPE.TEAMS_PLAYERS]: {
    collections: [AUDIT_READ_COLLECTION.TEAMS, AUDIT_READ_COLLECTION.PLAYERS],
  },
  [AUDIT_RELATION_SCOPE.TEAMS_PLAYER_INDEXES]: {
    collections: [AUDIT_READ_COLLECTION.TEAMS, AUDIT_READ_COLLECTION.SEARCH_INDEXES],
    searchEntityTypes: ['playerSeason'],
  },
  [AUDIT_RELATION_SCOPE.PLAYERS_PLAYER_INDEXES]: {
    collections: [AUDIT_READ_COLLECTION.PLAYERS, AUDIT_READ_COLLECTION.SEARCH_INDEXES],
    searchEntityTypes: ['playerSeason'],
  },
})

const COLLECTION_NAMES = Object.freeze({
  [AUDIT_READ_COLLECTION.LEAGUES]: PLAYERS_DATABASE_COLLECTIONS.leagues,
  [AUDIT_READ_COLLECTION.TEAMS]: PLAYERS_DATABASE_COLLECTIONS.teams,
  [AUDIT_READ_COLLECTION.PLAYERS]: PLAYERS_DATABASE_COLLECTIONS.players,
  [AUDIT_READ_COLLECTION.SEARCH_INDEXES]: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
})

const COLLECTION_SCOPE_REQUIREMENTS = Object.freeze({
  [AUDIT_COLLECTION_SCOPE.LEAGUES]: {
    collectionKey: AUDIT_READ_COLLECTION.LEAGUES,
  },
  [AUDIT_COLLECTION_SCOPE.TEAMS]: {
    collectionKey: AUDIT_READ_COLLECTION.TEAMS,
  },
  [AUDIT_COLLECTION_SCOPE.PLAYERS]: {
    collectionKey: AUDIT_READ_COLLECTION.PLAYERS,
  },
  [AUDIT_COLLECTION_SCOPE.TEAM_INDEXES]: {
    collectionKey: AUDIT_READ_COLLECTION.SEARCH_INDEXES,
    searchEntityTypes: ['birthTeamSeason'],
  },
  [AUDIT_COLLECTION_SCOPE.PLAYER_INDEXES]: {
    collectionKey: AUDIT_READ_COLLECTION.SEARCH_INDEXES,
    searchEntityTypes: ['playerSeason'],
  },
})

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [
  ...new Set((Array.isArray(values) ? values : []).map(clean).filter(Boolean)),
]

const buildReadRequirements = scope => {
  if (scope?.type === AUDIT_SCOPE_TYPE.COLLECTION) {
    const requirement = COLLECTION_SCOPE_REQUIREMENTS[scope.collectionScope]
    if (!requirement) throw new Error('היקף האוסף אינו נתמך לקריאה.')

    return {
      collections: [requirement.collectionKey],
      searchEntityTypes: requirement.searchEntityTypes || [],
    }
  }

  if (scope?.type === AUDIT_SCOPE_TYPE.RELATIONS) {
    const relationId = clean(scope.relationId)
    if (relationId) {
      const requirement = RELATION_READ_REQUIREMENTS[relationId]
      if (!requirement) throw new Error('בדיקת הקשר אינה נתמכת.')

      return {
        collections: requirement.collections,
        searchEntityTypes: requirement.searchEntityTypes || [],
      }
    }

    return {
      collections: [
        AUDIT_READ_COLLECTION.LEAGUES,
        AUDIT_READ_COLLECTION.TEAMS,
        AUDIT_READ_COLLECTION.PLAYERS,
        AUDIT_READ_COLLECTION.SEARCH_INDEXES,
      ],
      searchEntityTypes: ['birthTeamSeason', 'playerSeason'],
    }
  }

  if (scope?.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM) {
    return {
      collections: [
        AUDIT_READ_COLLECTION.LEAGUES,
        AUDIT_READ_COLLECTION.TEAMS,
        AUDIT_READ_COLLECTION.PLAYERS,
        AUDIT_READ_COLLECTION.SEARCH_INDEXES,
      ],
      searchEntityTypes: ['birthTeamSeason', 'playerSeason'],
    }
  }

  return null
}

const readCollectionPages = async ({
  collectionKey,
  searchEntityTypes = [],
  budget,
}) => {
  const collectionName = COLLECTION_NAMES[collectionKey]
  if (!collectionName) throw new Error('אוסף הבדיקה אינו נתמך.')

  if (budget.used >= READ_SAFETY_LIMIT) {
    throw new Error(
      `הבדיקה נעצרה לפני קריאת ${collectionName}: מגבלת ${READ_SAFETY_LIMIT} הקריאות כבר נוצלה.`
    )
  }

  const source = collection(db, collectionName)
  const documents = []
  let cursor = null

  while (budget.used < READ_SAFETY_LIMIT) {
    const remaining = READ_SAFETY_LIMIT - budget.used
    const pageLimit = Math.min(PAGE_LIMIT, remaining)
    const constraints = []

    if (
      collectionKey === AUDIT_READ_COLLECTION.SEARCH_INDEXES &&
      searchEntityTypes.length === 1
    ) {
      constraints.push(where('entityType', '==', searchEntityTypes[0]))
    } else if (
      collectionKey === AUDIT_READ_COLLECTION.SEARCH_INDEXES &&
      searchEntityTypes.length > 1
    ) {
      constraints.push(where('entityType', 'in', unique(searchEntityTypes)))
    }

    if (cursor) constraints.push(startAfter(cursor))
    constraints.push(limit(pageLimit))

    const snapshot = await trackedGetDocsFromServer(
      query(source, ...constraints),
      {
        feature: 'playersDatabase',
        operation: 'audit',
        source: `auditV2:${collectionKey}`,
      }
    )

    budget.used += Math.max(1, snapshot.docs.length)
    documents.push(...snapshot.docs)

    if (snapshot.docs.length < pageLimit) break
    if (budget.used >= READ_SAFETY_LIMIT) {
      throw new Error(
        `הבדיקה נעצרה לפני חריגה ממגבלת ${READ_SAFETY_LIMIT} קריאות. לא הוחזרה תוצאה חלקית.`
      )
    }

    cursor = snapshot.docs[snapshot.docs.length - 1]
  }

  return documents
}

const toRows = documents => (Array.isArray(documents) ? documents : []).map(snapshot => ({
  id: snapshot.id,
  data: snapshot.data() || {},
}))

export async function readPlayerDatabaseAuditSnapshot({ scope } = {}) {
  const requirements = buildReadRequirements(scope)
  if (!requirements) return null

  const budget = { used: 0 }
  const documents = {}

  for (const collectionKey of requirements.collections) {
    documents[collectionKey] = await readCollectionPages({
      collectionKey,
      searchEntityTypes: collectionKey === AUDIT_READ_COLLECTION.SEARCH_INDEXES
        ? requirements.searchEntityTypes
        : [],
      budget,
    })
  }

  const searchDocuments = documents[AUDIT_READ_COLLECTION.SEARCH_INDEXES] || []
  const teamIndexDocuments = searchDocuments.filter(snapshot => (
    clean(snapshot.data()?.entityType) === 'birthTeamSeason'
  ))
  const playerIndexDocuments = searchDocuments.filter(snapshot => (
    clean(snapshot.data()?.entityType) === 'playerSeason'
  ))

  return {
    scope,
    generatedAt: new Date().toISOString(),
    readsUsed: budget.used,
    readCollections: requirements.collections,
    documents: {
      leagues: documents[AUDIT_READ_COLLECTION.LEAGUES] || [],
      teams: documents[AUDIT_READ_COLLECTION.TEAMS] || [],
      players: documents[AUDIT_READ_COLLECTION.PLAYERS] || [],
      searchIndexes: searchDocuments,
      teamIndexes: teamIndexDocuments,
      playerIndexes: playerIndexDocuments,
    },
    rows: {
      leagues: toRows(documents[AUDIT_READ_COLLECTION.LEAGUES]),
      teams: toRows(documents[AUDIT_READ_COLLECTION.TEAMS]),
      players: toRows(documents[AUDIT_READ_COLLECTION.PLAYERS]),
      searchIndexes: toRows(searchDocuments),
      teamIndexes: toRows(teamIndexDocuments),
      playerIndexes: toRows(playerIndexDocuments),
    },
  }
}

export const getAuditRelationReadRequirements = relationId => {
  const requirement = RELATION_READ_REQUIREMENTS[clean(relationId)]
  return requirement
    ? {
        collections: [...requirement.collections],
        searchEntityTypes: [...(requirement.searchEntityTypes || [])],
      }
    : null
}
