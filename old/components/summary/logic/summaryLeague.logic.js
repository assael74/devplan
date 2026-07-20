// features/playersDatabase/components/summary/logic/summaryLeague.logic.js

import { getLeagueSeasonRows } from '../../leagues/leagueUtils.js'
import {
  pdbLeagueScoutProfilesCount,
} from '../../../sharedLogic/pdbCounts.logic.js'

const hasValue = value => value !== undefined && value !== null

export const getSummaryLeagueBirthYear = league => {
  const years = getLeagueSeasonRows(league)
    .map(season => Number(season.primaryBirthYear || season.birthYear))
    .filter(Number.isFinite)

  return years.length ? Math.min(...years) : ''
}

export const getSummaryScoutProfilesCount = league => (
  pdbLeagueScoutProfilesCount(league)
)

export const getSummaryDisplayScoutProfilesCount = ({ league, insight }) => {
  if (hasValue(insight.scoutProfilesCount)) {
    return insight.scoutProfilesCount
  }

  return getSummaryScoutProfilesCount(league)
}
