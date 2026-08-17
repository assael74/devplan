// src/features/playersDatabase/domain/narrative/narrativeMeaning.js

import { createEmptyNarrativeMeaning } from './narrative.contract.js'

const clean = value => String(value || '').trim()

const buildEntryMeaning = entry => ({
  teamId: clean(entry?.team?.teamId),
  clubId: clean(entry?.team?.clubId),
  leagueLevel: entry?.team?.leagueLevel === undefined
    ? null
    : entry.team.leagueLevel,
  clubStrengthLevel: entry?.team?.clubStrengthLevel === undefined
    ? null
    : entry.team.clubStrengthLevel,
  ageGroupId: clean(entry?.team?.ageGroupId),
  isPlayingUp: entry?.age?.isPlayingUp === null ||
    entry?.age?.isPlayingUp === undefined
    ? null
    : Boolean(entry.age.isPlayingUp),
  ageGap: entry?.age?.ageGap === null || entry?.age?.ageGap === undefined
    ? null
    : Number(entry.age.ageGap),
  profileId: clean(entry?.scout?.primaryProfile?.id),
  profileStrengthDepthPct: entry?.scout?.primaryProfile?.profileStrength?.depthPct === null ||
    entry?.scout?.primaryProfile?.profileStrength?.depthPct === undefined
    ? null
    : Number(entry.scout.primaryProfile.profileStrength.depthPct),
  priority: clean(entry?.scout?.opportunity?.effectiveActionStatus),
  trajectory: clean(entry?.scout?.trajectory?.direction),
  progression: clean(entry?.scout?.profileProgression?.status),
  transferDirection: clean(entry?.scout?.transferContext?.direction),
})

const buildSeasonMeaning = season => ({
  seasonKey: clean(season?.seasonKey || season?.seasonId),
  entries: (Array.isArray(season?.entries) ? season.entries : [])
    .map(buildEntryMeaning),
})

const unique = values => [...new Set(values.filter(Boolean))]

const buildCareerMeaning = ({ seasons, events }) => {
  const entries = seasons.flatMap(season => season.entries || [])
  const safeEvents = Array.isArray(events) ? events : []

  return {
    transferDirections: unique([
      ...entries.map(entry => entry.transferDirection),
      ...safeEvents.map(event => clean(event?.direction)),
    ]),
    transferTypes: unique(safeEvents.map(event => clean(event?.moveType || event?.type))),
    playingUpSeasons: seasons
      .filter(season => season.entries.some(entry => entry.isPlayingUp === true))
      .map(season => season.seasonKey),
    profileChanges: unique(entries.map(entry => entry.profileId)),
    competitionLevels: unique(entries.map(entry => String(entry.leagueLevel || ''))),
    clubs: unique(entries.map(entry => entry.clubId)),
  }
}

export const buildNarrativeMeaning = input => {
  const result = createEmptyNarrativeMeaning()
  const seasons = (Array.isArray(input?.seasons) ? input.seasons : [])
    .map(buildSeasonMeaning)

  return {
    ...result,
    seasons,
    career: buildCareerMeaning({
      seasons,
      events: input?.events,
    }),
  }
}
