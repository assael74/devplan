// src/dev/reports/fixtures/reportsDev.fixtures.js

import { REPORTS_DEV_REPORTS } from '../reportsDev.constants.js'

import { MINUTES_PLAN_FIXTURES } from './minutesPlan.fixtures.js'
import { PLAYER_TARGETS_FIXTURES } from './playerTargets.fixtures.js'
import { SEASON_PLAN_FIXTURES } from './seasonPlan.fixtures.js'
import { TEAM_TARGETS_FIXTURES } from './teamTargets.fixtures.js'

export const REPORTS_DEV_FIXTURES = {
  [REPORTS_DEV_REPORTS.TEAM_TARGETS]: TEAM_TARGETS_FIXTURES,
  [REPORTS_DEV_REPORTS.PLAYER_TARGETS]: PLAYER_TARGETS_FIXTURES,
  [REPORTS_DEV_REPORTS.SEASON_PLAN]: SEASON_PLAN_FIXTURES,
  [REPORTS_DEV_REPORTS.MINUTES_PLAN]: MINUTES_PLAN_FIXTURES,
}

export const getReportsDevFixture = ({ reportId, scenario }) => {
  const reportFixtures = REPORTS_DEV_FIXTURES[reportId]

  if (!reportFixtures) return null

  return reportFixtures[scenario] || Object.values(reportFixtures)[0] || null
}
