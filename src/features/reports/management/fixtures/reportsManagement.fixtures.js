// src/features/reports/management/fixtures/ReportsManagement.fixtures.js

import { REPORTS_MANAGEMENT_REPORTS } from '../reportsManagement.constants.js'

import { MINUTES_PLAN_FIXTURES } from './minutesPlan.fixtures.js'
import { PLAYER_TARGETS_FIXTURES } from './playerTargets.fixtures.js'
import { SEASON_PLAN_FIXTURES } from './seasonPlan.fixtures.js'
import { TEAM_TARGETS_FIXTURES } from './teamTargets.fixtures.js'

export const REPORTS_MANAGEMENT_FIXTURES = {
  [REPORTS_MANAGEMENT_REPORTS.TEAM_TARGETS]: TEAM_TARGETS_FIXTURES,
  [REPORTS_MANAGEMENT_REPORTS.PLAYER_TARGETS]: PLAYER_TARGETS_FIXTURES,
  [REPORTS_MANAGEMENT_REPORTS.SEASON_PLAN]: SEASON_PLAN_FIXTURES,
  [REPORTS_MANAGEMENT_REPORTS.MINUTES_PLAN]: MINUTES_PLAN_FIXTURES,
}

export const getReportsManagementFixture = ({ reportId, scenario }) => {
  const reportFixtures = REPORTS_MANAGEMENT_FIXTURES[reportId]

  if (!reportFixtures) return null

  return reportFixtures[scenario] || Object.values(reportFixtures)[0] || null
}
