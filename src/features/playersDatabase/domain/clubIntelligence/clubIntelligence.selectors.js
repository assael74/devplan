import {
  CLUB_INTELLIGENCE_SEASON_VIEW,
  CLUB_SPOTLIGHT_ORDER,
  CLUB_SPOTLIGHT_TYPE,
} from './clubIntelligence.contract.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const spotlightOrder = new Map(
  CLUB_SPOTLIGHT_ORDER.map((type, index) => [type, index])
)

const teamSlotOf = team => {
  const explicitSlot = Number(team?.birthTeamSlot || team?.teamSlot || team?.slot)
  if (Number.isInteger(explicitSlot) && explicitSlot > 0) return explicitSlot

  const suffix = clean(team?.teamId).split('_').filter(Boolean).at(-1)
  const slot = Number(suffix)
  return Number.isInteger(slot) && slot > 0 ? slot : 1
}

export const getOrderedClubSpotlights = intelligence => (
  [...(Array.isArray(intelligence?.spotlights) ? intelligence.spotlights : [])]
    .sort((left, right) => (
      (spotlightOrder.get(left?.type) ?? Number.MAX_SAFE_INTEGER) -
      (spotlightOrder.get(right?.type) ?? Number.MAX_SAFE_INTEGER)
    ) || Number(right?.birthYear || 0) - Number(left?.birthYear || 0))
)

export const getPrimaryClubSpotlight = intelligence => (
  getOrderedClubSpotlights(intelligence)[0] || null
)

const getSeasonTeams = ({ intelligence, seasonView }) => (
  (Array.isArray(intelligence?.birthYearTeams) ? intelligence.birthYearTeams : [])
    .flatMap(item => item?.seasons?.[seasonView]?.teams || [])
)

const buildSpotlightGroups = intelligence => {
  const ordered = getOrderedClubSpotlights(intelligence)

  return {
    futureLeaguePath: ordered.filter(item => (
      item.type === CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_RISE ||
      item.type === CLUB_SPOTLIGHT_TYPE.FUTURE_LEAGUE_PATH_DROP
    )),
    leagueVsClubLevel: ordered.filter(item => (
      item.type === CLUB_SPOTLIGHT_TYPE.LEAGUE_ABOVE_CLUB_LEVEL ||
      item.type === CLUB_SPOTLIGHT_TYPE.LEAGUE_BELOW_CLUB_LEVEL
    )),
    squadTask: ordered.filter(item => (
      item.type === CLUB_SPOTLIGHT_TYPE.OFFENSE_SQUAD_TASK ||
      item.type === CLUB_SPOTLIGHT_TYPE.DEFENSE_SQUAD_TASK
    )),
  }
}

export const getClubSummaryView = intelligence => ({
  club: intelligence?.club || {},
  signalCoverage: intelligence?.signalCoverage || {},
  primarySpotlight: getPrimaryClubSpotlight(intelligence),
  spotlights: getOrderedClubSpotlights(intelligence),
  spotlightGroups: buildSpotlightGroups(intelligence),
  currentTeams: getSeasonTeams({
    intelligence,
    seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.CURRENT,
  }),
  previousTeams: getSeasonTeams({
    intelligence,
    seasonView: CLUB_INTELLIGENCE_SEASON_VIEW.PREVIOUS,
  }),
})

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
