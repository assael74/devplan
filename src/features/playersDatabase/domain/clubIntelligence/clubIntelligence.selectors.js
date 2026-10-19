// src/features/playersDatabase/domain/clubIntelligence/clubIntelligence.selectors.js

import { CLUB_INTELLIGENCE_SEASON_VIEW } from './clubIntelligence.contract.js'
import { mergeTeamSignalSummaries, readTeamSignalSummary } from '../signals/teamSignalSummary.js'
import { buildTeamClubLevelGap } from '../signals/teamSignalFacts.js'
import { readCompetitionAvailability } from '../signals/teamSignalAvailability.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const teamSlotOf = team => {
  const explicitSlot = Number(team?.birthTeamSlot || team?.teamSlot || team?.slot)
  if (Number.isInteger(explicitSlot) && explicitSlot > 0) return explicitSlot

  const suffix = clean(team?.teamId).split('_').filter(Boolean).at(-1)
  const slot = Number(suffix)
  return Number.isInteger(slot) && slot > 0 ? slot : 1
}

const getSeasonTeams = ({ intelligence, seasonView }) => (
  (Array.isArray(intelligence?.birthYearTeams) ? intelligence.birthYearTeams : [])
    .flatMap(item => item?.seasons?.[seasonView]?.teams || [])
)

export const getClubTeamSignalDirections = ({ team = {}, club = {} }) => {
  const summary = readTeamSignalSummary(team.teamSignalSummary)
  const competition = team.futureCompetition
  const futureActive = teamSlotOf(team) === 1 && summary.familiesById['future-competition'].level > 0
  const clubGapActive = summary.familiesById['club-gap'].level > 0
  // Compact summaries own signal presence. Direction remains a fact from the
  // existing forecast or the canonical gap calculation, never a new spotlight.
  return {
    futureCompetition: futureActive && readCompetitionAvailability(competition) === 'available' &&
      ['up', 'down'].includes(competition.direction) ? competition.direction : null,
    clubLevel: clubGapActive ? buildTeamClubLevelGap({ team, club }).direction : null,
  }
}

export const getClubSummaryView = intelligence => {
  const currentTeams = getSeasonTeams({
    intelligence,
    seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.CURRENT,
  })
  return {
    club: intelligence?.club || {},
    signalCoverage: intelligence?.signalCoverage || {},
    teamSignalSummary: mergeTeamSignalSummaries(currentTeams.map(team => team.teamSignalSummary)),
    currentTeams,
    previousTeams: getSeasonTeams({
      intelligence,
      seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.PREVIOUS,
    }),
  }
}

export const getClubCollapseView = intelligence => ({
  ...getClubSummaryView(intelligence),
  currentPrimaryTeams: getSeasonTeams({
    intelligence,
    seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.CURRENT,
  }).filter(team => teamSlotOf(team) === 1),
  currentSecondaryTeams: getSeasonTeams({
    intelligence,
    seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.CURRENT,
  }).filter(team => teamSlotOf(team) > 1),
  previousPrimaryTeams: getSeasonTeams({
    intelligence,
    seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.PREVIOUS,
  }).filter(team => teamSlotOf(team) === 1),
  previousSecondaryTeams: getSeasonTeams({
    intelligence,
    seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.PREVIOUS,
  }).filter(team => teamSlotOf(team) > 1),
})

export const getClubPageView = intelligence => ({
  ...getClubSummaryView(intelligence),
  birthYearTeams: Array.isArray(intelligence?.birthYearTeams)
    ? intelligence.birthYearTeams
    : [],
})
