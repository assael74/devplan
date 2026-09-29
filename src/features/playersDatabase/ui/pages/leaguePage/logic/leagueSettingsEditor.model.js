// src/features/playersDatabase/ui/pages/leaguePage/logic/leagueSettingsEditor.model.js

const toQuantity = value => {
  if (value === '' || value === null || value === undefined) return 0
  const quantity = Number(value)
  return Number.isInteger(quantity) && quantity >= 0 ? quantity : null
}
const toQuantityText = places => String(Array.isArray(places) ? places.length : 0)
export const isValidQuantity = value => toQuantity(value) !== null
const buildTopPlaces = ({ quantity, start = 1 } = {}) =>
  Array.from({ length: toQuantity(quantity) || 0 }, (_, index) => start + index)
const buildRelegationPlaces = ({ teamCount, directQuantity, playoffQuantity } = {}) => {
  const teams = Math.max(0, Number(teamCount) || 0)
  const direct = Math.min(teams, toQuantity(directQuantity) || 0)
  const playoff = Math.min(Math.max(0, teams - direct), toQuantity(playoffQuantity) || 0)

  return {
    directPlaces: buildTopPlaces({ quantity: direct, start: teams - direct + 1 }),
    playoffPlaces: buildTopPlaces({
      quantity: playoff,
      start: teams - direct - playoff + 1,
    }),
  }
}
export const buildCompetitionRules = ({ draft, teamCount, isTopLeague } = {}) => {
  const promotionDirectPlaces = isTopLeague
    ? []
    : buildTopPlaces({ quantity: draft?.promotionDirectPlaces })
  const promotionPlayoffPlaces = isTopLeague
    ? []
    : buildTopPlaces({
        quantity: draft?.promotionPlayoffPlaces,
        start: promotionDirectPlaces.length + 1,
      })
  const relegation = buildRelegationPlaces({
    teamCount,
    directQuantity: draft?.relegationDirectPlaces,
    playoffQuantity: draft?.relegationPlayoffPlaces,
  })

  return {
    configured: Boolean(
      promotionDirectPlaces.length ||
      promotionPlayoffPlaces.length ||
      relegation.directPlaces.length ||
      relegation.playoffPlaces.length,
    ),
    promotion: {
      directPlaces: promotionDirectPlaces,
      playoffPlaces: promotionPlayoffPlaces,
    },
    relegation,
  }
}
export const buildRulesDraft = season => ({
  promotionDirectPlaces: toQuantityText(
    season?.competitionRules?.promotion?.directPlaces,
  ),
  promotionPlayoffPlaces: toQuantityText(
    season?.competitionRules?.promotion?.playoffPlaces,
  ),
  relegationDirectPlaces: toQuantityText(
    season?.competitionRules?.relegation?.directPlaces,
  ),
  relegationPlayoffPlaces: toQuantityText(
    season?.competitionRules?.relegation?.playoffPlaces,
  ),
})
export const serializeRulesDraft = draft =>
  JSON.stringify({
    promotionDirectPlaces: toQuantity(draft.promotionDirectPlaces),
    promotionPlayoffPlaces: toQuantity(draft.promotionPlayoffPlaces),
    relegationDirectPlaces: toQuantity(draft.relegationDirectPlaces),
    relegationPlayoffPlaces: toQuantity(draft.relegationPlayoffPlaces),
  })

export const isValidSeasonUrl = value =>
  !value.trim() || /^https?:\/\/[^\s]+$/i.test(value.trim())

export const rulesFields = [
  ['promotionDirectPlaces', 'כמות עולות ישירות'],
  ['promotionPlayoffPlaces', 'כמות עולות לפלייאוף'],
  ['relegationDirectPlaces', 'כמות יורדות ישירות'],
  ['relegationPlayoffPlaces', 'כמות יורדות לפלייאוף'],
]
