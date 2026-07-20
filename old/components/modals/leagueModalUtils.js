// src/features/playersDatabase/components/modals/leagueModalUtils.js

export {
  buildLeagueDocument,
  clean,
  createLeagueId,
  createLeagueSeason,
  createSeasonKey,
  deriveLeagueMeta,
  validateLeagueForm,
} from '../../models/league.model.js'

export const EMPTY_LEAGUE_FORM = {
  leagueName: '',
  seasonId: '2025-2026',
  ageGroupId: 'u17',
  birthYear: 2009,
  region: '',
  clubsCount: '',
}
