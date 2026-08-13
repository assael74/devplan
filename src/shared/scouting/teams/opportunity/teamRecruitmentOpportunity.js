// src/shared/scouting/teams/opportunity/teamRecruitmentOpportunity.js

import {
  TEAM_SCOUT_NEED_LEVEL,
  TEAM_SCOUT_RECRUITMENT_WINDOW,
} from './teamOpportunity.model.js'

const NEED_WEIGHT = {
  [TEAM_SCOUT_NEED_LEVEL.CRITICAL]: 3,
  [TEAM_SCOUT_NEED_LEVEL.HIGH]: 2,
  [TEAM_SCOUT_NEED_LEVEL.MODERATE]: 1,
  [TEAM_SCOUT_NEED_LEVEL.NONE]: 0,
  [TEAM_SCOUT_NEED_LEVEL.UNKNOWN]: 0,
}

const resolveRecruitmentWindow = needs => {
  const activeNeeds = needs.filter((need) => need.active)
  if (!activeNeeds.length) return TEAM_SCOUT_RECRUITMENT_WINDOW.NONE

  const strongest = activeNeeds.reduce((max, need) => {
    return Math.max(max, NEED_WEIGHT[need.level] || 0)
  }, 0)

  if (strongest >= 3) return TEAM_SCOUT_RECRUITMENT_WINDOW.STRONG
  if (strongest >= 2) return TEAM_SCOUT_RECRUITMENT_WINDOW.OPEN

  return TEAM_SCOUT_RECRUITMENT_WINDOW.WATCH
}

export const buildTeamRecruitmentOpportunity = ({ needs = [], context = null } = {}) => {
  const activeNeeds = needs.filter((need) => need.active)

  return {
    window: resolveRecruitmentWindow(needs),
    needs: activeNeeds,
    context,
    reasons: activeNeeds.map((need) => {
      return `${need.id}:${need.level}`
    }),
  }
}
