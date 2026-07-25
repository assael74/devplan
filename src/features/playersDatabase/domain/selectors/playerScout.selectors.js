// src/features/playersDatabase/domain/selectors/playerScout.selectors.js

import { createEmptyPlayerScoutDisplay } from '../contracts/playerScout.contract.js'

export const selectPlayerScoutProfiles = playerSeason => (
  Array.isArray(playerSeason?.scout?.profiles)
    ? playerSeason.scout.profiles
    : []
)

export const selectPrimaryScoutProfile = playerSeason => (
  playerSeason?.scout?.primaryProfile || null
)

export const selectSecondaryScoutProfile = playerSeason => (
  playerSeason?.scout?.secondaryProfile || null
)

export const selectPrimaryScoutCombination = playerSeason => (
  playerSeason?.scout?.primaryCombination || null
)

export const selectPlayerScoutDisplay = playerSeason => (
  playerSeason?.scout?.display || createEmptyPlayerScoutDisplay()
)

export const selectPlayerScoutReliability = playerSeason => (
  selectPlayerScoutDisplay(playerSeason).reliability
)

export const selectHasPlayerScoutProfile = playerSeason => Boolean(
  playerSeason?.scout?.hasProfiles
)
