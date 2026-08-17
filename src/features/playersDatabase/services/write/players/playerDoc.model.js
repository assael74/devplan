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
  })
}

const normalizeScoutProfileArray = values => (
  Array.isArray(values)
    ? values.map(compactScoutValue).filter(Boolean)
    : []
)

export const normalizePlayerScoutStory = player => ({
  scoutCandidateSignals: normalizeScoutProfileArray(player?.scoutCandidateSignals),
  scoutSpotlights: normalizeScoutProfileArray(player?.scoutSpotlights),
  scoutOpportunity: compactScoutValue(player?.scoutOpportunity || null),
  scoutVerification: compactScoutValue(player?.scoutVerification || null),
  scoutProfileProgression: compactScoutValue(player?.scoutProfileProgression || null),
  scoutProfileHierarchy: compactScoutValue(player?.scoutProfileHierarchy || null),
  scoutProfileCaseStrength: compactScoutValue(player?.scoutProfileCaseStrength || null),
  scoutTrajectory: normalizePlayerScoutTrajectory(player?.scoutTrajectory),
  scoutTransferContext: compactScoutValue(player?.scoutTransferContext || null),
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
        perspective: clean(profile.perspective),
        searchLevels: normalizeScoutProfileArray(profile.searchLevels),
        teamFilter: clean(profile.teamFilter),
        positionContext: clean(profile.positionContext),
        interestLevel: clean(profile.interestLevel || profile.interest),
        profileDepth: profile.profileDepth || null,
        profileStrength: profile.profileStrength || null,
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

    playerReview: compactScoutValue(
      player.playerReview ||
      currentData.playerReview ||
      null
    ),

    manualImmediacyDecision: compactScoutValue(
      player.manualImmediacyDecision ||
      currentData.manualImmediacyDecision ||
      null
    ),

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
