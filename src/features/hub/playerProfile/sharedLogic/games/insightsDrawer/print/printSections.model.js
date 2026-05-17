// playerProfile/sharedLogic/games/insightsDrawer/print/printSections.model.js

import {
  buildDifficultyCards,
  buildImpactCards,
  buildPositionCards,
  buildScoreCards,
} from '../cards/index.js'

import {
  buildPrintSection,
  pickPrimaryBriefText,
  resolveTargetAchievementColor,
} from './print.utils.js'

const getBriefs = (model = {}) => {
  return (
    model?.insights?.briefs ||
    model?.viewModel?.briefs ||
    {}
  )
}

const getTargets = (model = {}) => {
  return (
    model?.insights?.targets ||
    model?.viewModel?.targets ||
    {}
  )
}

const getGamesData = (model = {}) => {
  return (
    model?.insights?.games ||
    model?.viewModel?.games ||
    {}
  )
}

const getCardDedupeKey = (card = {}) => {
  return (
    card.id ||
    card.key ||
    card.label ||
    card.title ||
    ''
  )
}

const dedupeCardsById = (cards = []) => {
  const seen = new Set()

  return cards.filter((card) => {
    const key = getCardDedupeKey(card)

    if (!key) return true
    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

const parseNumberFromValue = (value) => {
  if (value === null || value === undefined) return null

  const text = String(value)
    .replace('%', '')
    .replace(',', '.')
    .trim()

  const number = Number(text)

  return Number.isFinite(number) ? number : null
}

const resolveCardTargetFallbackColor = (card = {}) => {
  if (card.color && card.color !== 'neutral') return card.color

  const raw = card.raw || {}

  const actual =
    card.actual ??
    card.valueRaw ??
    card.rawValue ??
    raw.actual ??
    raw.valueRaw ??
    parseNumberFromValue(card.value)

  const target =
    card.target ??
    card.targetValue ??
    raw.target ??
    raw.targetValue

  return resolveTargetAchievementColor({
    actual,
    target,
    fallback: card.color || 'neutral',
  })
}

const enrichCardsWithTargetColor = (cards = []) => {
  return cards.map((card) => {
    if (!card) return card

    return {
      ...card,
      color: resolveCardTargetFallbackColor(card),
    }
  })
}

const buildExpectationSection = ({
  scoringBrief,
  positionBrief,
  targets,
  gamesData,
}) => {
  if (!scoringBrief && !positionBrief) return null

  const scoreCards = scoringBrief
    ? buildScoreCards({
        brief: scoringBrief,
        positionBrief,
        targets,
        gamesData,
      })
    : []

  const positionCards = positionBrief
    ? buildPositionCards({
        brief: positionBrief,
        targets,
        compact: true,
      })
    : []

  const cards = enrichCardsWithTargetColor(
    dedupeCardsById([
      ...scoreCards,
      ...positionCards,
    ])
  )

  return buildPrintSection({
    id: 'expectation',
    title: 'האם נתן תפוקה לפי הציפייה?',
    summary:
      pickPrimaryBriefText(scoringBrief) ||
      pickPrimaryBriefText(positionBrief),
    color: scoringBrief?.tone || positionBrief?.tone || 'neutral',
    cards,
  })
}

const buildTeamImpactSection = ({ brief }) => {
  if (!brief) return null

  return buildPrintSection({
    id: 'teamContext',
    title: 'השפעה קבוצתית',
    summary: pickPrimaryBriefText(brief),
    color: brief?.tone || 'neutral',
    cards: buildImpactCards(brief),
  })
}

const buildDifficultySection = ({ brief }) => {
  if (!brief) return null

  return buildPrintSection({
    id: 'difficulty',
    title: 'השפעה לפי רמת יריבה',
    summary: pickPrimaryBriefText(brief),
    color: brief?.tone || 'neutral',
    cards: buildDifficultyCards(brief),
  })
}

export const buildPlayerPrintSectionsModel = (model = {}) => {
  const briefs = getBriefs(model)
  const targets = getTargets(model)
  const gamesData = getGamesData(model)

  return [
    buildExpectationSection({
      scoringBrief: briefs.scoring,
      positionBrief: briefs.positionFit,
      targets,
      gamesData,
    }),

    buildTeamImpactSection({
      brief: briefs.teamContext,
    }),

    buildDifficultySection({
      brief: briefs.difficulty,
    }),
  ].filter(Boolean)
}
