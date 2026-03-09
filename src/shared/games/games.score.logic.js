/// shared/games/games.score.logic.js
import { n } from './games.summary.logic.js'

export const buildScoreText = (gf, ga, hasAny) => {
  if (!hasAny) return '—'
  return `${n(gf)} - ${n(ga)}`
}

export const scoreFromGameAndStats = ({ game, stats }) => {
  const gf = stats?.goalsFor ?? game?.goalsFor
  const ga = stats?.goalsAgainst ?? game?.goalsAgainst
  const hasAny =
    stats?.goalsFor != null ||
    stats?.goalsAgainst != null ||
    game?.goalsFor != null ||
    game?.goalsAgainst != null

  return buildScoreText(gf, ga, hasAny)
}
