// src/features/playersDatabase/services/write/players/playerDoc.model.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  clean,
  toNumberOrZero,
} from '../leagues/leagueDoc.js'
import { pickDefinedValue } from '../../../model/value.model.js'
import {
  normalizeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
} from './scoutingPlayerLifecycle.model.js'
import { normalizeScoutingPlayerVerification } from './scoutingPlayerVerification.model.js'
import {
  buildPlayerDocumentId as buildCanonicalPlayerDocumentId,
  buildPlayerMatchValues,
  normalizePlayerNameValue,
  resolvePlayerIdentityBirthYear,
} from '../../../model/playerIdentity.model.js'
import { PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG } from '../../../catalog/firestoreDocuments/playerDocument.catalog.js'
import { buildPlayerManualReview } from '../../../../../shared/scouting/players/manualReview/playerManualReview.js'

export const buildPlayerDocumentId = player =>
  buildCanonicalPlayerDocumentId(player)

const compactScoutValue = value => {
  if (value === undefined) return undefined

  if (Array.isArray(value)) {
    return value
      .map(compactScoutValue)
      .filter(item => item !== undefined)
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((result, [key, item]) => {
      const compacted = compactScoutValue(item)
      if (compacted === undefined) return result

      return {
        ...result,
        [key]: compacted,
      }
    }, {})
  }

  return value
}

const normalizePlayerScoutTrajectory = value => {
  const trajectory = value && typeof value === 'object'
    ? value
    : null

  if (!trajectory) return null

  return compactScoutValue({
    direction: trajectory.direction,
    confidence: trajectory.confidence,
    evidence: Array.isArray(trajectory.evidence) ? trajectory.evidence : [],
    stintsCount: trajectory.stintsCount,
    seasonsCount: trajectory.seasonsCount,
    latestTransfer: trajectory.latestTransfer || null,
    transferEvents: Array.isArray(trajectory.transferEvents)
      ? trajectory.transferEvents
      : [],
    comparisons: Array.isArray(trajectory.comparisons)
      ? trajectory.comparisons
      : [],
  })
}

const normalizeScoutProfileArray = values => (
  Array.isArray(values)
    ? values.map(compactScoutValue).filter(Boolean)
    : []
)

const cloneScoutContractValue = value => compactScoutValue(value)

const resolvePlayerManualReview = ({ player = {}, currentData = {} } = {}) => (
  buildPlayerManualReview({
    review: player.playerReview || currentData.playerReview || {},
  })
)

const resolveManualImmediacyDecision = ({ player = {}, currentData = {} } = {}) => {
  const template = cloneScoutContractValue(
    PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG.manualImmediacyDecision || {}
  )
  const source = player.manualImmediacyDecision && typeof player.manualImmediacyDecision === 'object'
    ? player.manualImmediacyDecision
    : currentData.manualImmediacyDecision && typeof currentData.manualImmediacyDecision === 'object'
      ? currentData.manualImmediacyDecision
      : {}

  return compactScoutValue({
    ...template,
    ...source,
  })
}

export const normalizePlayerScoutStory = player => ({
  scoutCandidateSignals: normalizeScoutProfileArray(player?.scoutCandidateSignals),
  scoutEvidence: normalizeScoutProfileArray(player?.scoutEvidence),
  scoutSpotlights: normalizeScoutProfileArray(player?.scoutSpotlights),
  scoutOpportunity: compactScoutValue(player?.scoutOpportunity || null),
  scoutVerification: compactScoutValue(player?.scoutVerification || null),
  scoutProfileProgression: compactScoutValue(player?.scoutProfileProgression || null),
  scoutProfileHierarchy: compactScoutValue(player?.scoutProfileHierarchy || null),
  scoutProfileCaseStrength: compactScoutValue(player?.scoutProfileCaseStrength || null),
  scoutPlayerInterest: compactScoutValue(player?.scoutPlayerInterest || null),
  scoutTrajectory: normalizePlayerScoutTrajectory(player?.scoutTrajectory),
  scoutTransferContext: compactScoutValue(player?.scoutTransferContext || null),
  futureCompetitionPath: compactScoutValue(player?.futureCompetitionPath || null),
  scoutEngineVersion: clean(player?.scoutEngineVersion),
})

export const normalizePlayerScoutProfiles = player => {
  const scoutSignals = Array.isArray(player?.scoutSignals)
    ? player.scoutSignals
    : []

  const scoutProfiles = Array.isArray(player?.scoutProfiles)
    ? player.scoutProfiles
    : []

  const sourceProfiles = scoutSignals.length > 0
    ? scoutSignals
    : scoutProfiles

  return sourceProfiles
    .filter(profile => clean(profile.profileId || profile.id))
    .map(profile => {
      const warnings = [
        ...new Set(
          (
            Array.isArray(profile.warnings)
              ? profile.warnings
              : []
          )
            .map(clean)
            .filter(Boolean)
        ),
      ]

      return compactScoutValue({
        profileId: clean(profile.profileId || profile.id),
        profileLabel: clean(profile.profileLabel || profile.label),
        profileShortLabel: clean(profile.profileShortLabel || profile.shortLabel),
        profileIdentity: clean(profile.profileIdentity || profile.identity),
        classificationState: clean(profile.classificationState),
        sourcePreliminaryProfileId: clean(profile.sourcePreliminaryProfileId),
        reclassifiedToProfileId: clean(profile.reclassifiedToProfileId),
        reclassificationReason: clean(profile.reclassificationReason),
        perspective: clean(profile.perspective),
        searchLevels: normalizeScoutProfileArray(profile.searchLevels),
        teamFilter: clean(profile.teamFilter),
        positionContext: clean(profile.positionContext),
        interestLevel: clean(profile.interestLevel || profile.interest),
        profileDepth: profile.profileDepth || null,
        profileStrength: profile.profileStrength || null,
        profileConfidence: profile.profileConfidence || null,
        warnings,
        score: Number.isFinite(Number(profile.score))
          ? Number(profile.score)
          : null,
        reasons: normalizeScoutProfileArray(profile.reasons),
        requiredReview: normalizeScoutProfileArray(
          profile.requiredReview || profile.reviews
        ),
        matchEvidence: normalizeScoutProfileArray(profile.matchEvidence),
        scoutContext: profile.scoutContext || null,
        spotlights: normalizeScoutProfileArray(profile.spotlights),
      })
    })
}

export const normalizePlayerScoutCombinations = player => {
  const combinations = Array.isArray(player?.scoutCombinations)
    ? player.scoutCombinations
    : []

  return combinations
    .filter(combination =>
      clean(
        combination?.id ||
        combination?.combinationId
      )
    )
    .map(combination => ({
      id: clean(
        combination.id ||
        combination.combinationId
      ),
      idIcon: clean(
        combination.idIcon
      ),
      label: clean(
        combination.label
      ),
      group: clean(
        combination.group
      ),
      interest: clean(
        combination.interest
      ),
      description: clean(
        combination.description
      ),
      profileIds: [
        ...new Set(
          (
            Array.isArray(combination.profileIds)
              ? combination.profileIds
              : Array.isArray(combination.matchedProfileIds)
                ? combination.matchedProfileIds
                : []
          )
            .map(clean)
            .filter(Boolean)
        ),
      ],
    }))
}

export const hasPlayerScoutProfiles = player =>
  normalizePlayerScoutProfiles(player).length > 0

export const getPlayerIdentityKeys = entity =>
  new Set(
    buildPlayerMatchValues(entity)
      .map(value =>
        clean(value).toLowerCase()
      )
      .filter(Boolean)
  )

export const isSamePlayerSource = (
  candidate = {},
  player = {}
) => {
  const candidateKeys =
    getPlayerIdentityKeys(candidate)

  const playerKeys =
    getPlayerIdentityKeys(player)

  for (const key of playerKeys) {
    if (candidateKeys.has(key)) {
      return true
    }
  }

  return false
}

export const playerDocRef = playerDocumentId =>
  doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.players,
    clean(playerDocumentId)
  )

export const buildPlayerBaseDoc = (player = {}, currentData = {}, season = {}, team = {}) => {
  const currentTracking = normalizeScoutingPlayerTracking({
    ...(currentData.tracking || {}),
    favorite:
      currentData.tracking?.favorite === true ||
      currentData.favorite === true,
    watchlist: currentData.tracking?.watchlist === true,
  })

  return {
    id: clean(
      player.playerDocumentId ||
      buildPlayerDocumentId(player)
    ),

    externalPlayerId: clean(
      player.externalPlayerId ||
      currentData.externalPlayerId
    ),

    fullName: clean(
      player.fullName ||
      currentData.fullName
    ),

    normalizedName: normalizePlayerNameValue(
      player.normalizedName ||
      player.fullName ||
      currentData.normalizedName
    ),

    birthYear: resolvePlayerIdentityBirthYear({
      player,
      season,
    }) || toNumberOrZero(
      pickDefinedValue(
        player.birthYear,
        season.birthYear,
        team.birthYear,
        currentData.birthYear
      )
    ) || null,

    birthDate: pickDefinedValue(
      currentData.birthDate,
      null
    ),

    status: clean(
      currentData.status
    ),

    favorite:
      currentData.favorite === true ||
      currentTracking.favorite === true,

    notes: clean(
      player.rootNotes ||
      currentData.notes
    ),

    primaryPosition: clean(
      player.primaryPosition ||
      currentData.primaryPosition
    ),

    positionLayer: clean(
      player.positionLayer ||
      currentData.positionLayer
    ),

    numShirt: clean(
      player.numShirt ||
      currentData.numShirt
    ),

    tracking: currentTracking,

    playerReview: resolvePlayerManualReview({ player, currentData }),

    manualImmediacyDecision: resolveManualImmediacyDecision({
      player,
      currentData,
    }),

    manualImmediacyHistory: normalizeScoutProfileArray(
      currentData.manualImmediacyHistory
    ),

    verification: normalizeScoutingPlayerVerification(
      currentData.verification
    ),

    events: normalizeScoutingPlayerEvents(currentData.events),

    current: Array.isArray(currentData.current)
      ? currentData.current
      : [],

    history: Array.isArray(currentData.history)
      ? currentData.history
      : [],

    createdAt:
      currentData.createdAt ||
      serverTimestamp(),

    updatedAt: serverTimestamp(),
  }
}
