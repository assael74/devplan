// src/shared/entityLifecycle/cascade/team/executeTeamCascadeDelete.js

import { archiveTeamCascadePayments } from './archiveTeamCascadePayments.js'
import { deleteTeamCascadeStats } from './deleteTeamCascadeStats.js'
import { deleteTeamCascadeStorage } from './deleteTeamCascadeStorage.js'

import {
  deleteTeamGamesShorts,
  deleteTeamMeetingsShorts,
  deleteTeamPlayersShorts,
  deleteTeamRootShorts,
} from './deleteTeamCascadeShorts.js'

const assertPlan = plan => {
  if (!plan?.teamId) throw new Error('[teamCascadeDelete] plan.teamId is required')
  if (plan?.type !== 'teamCascadeDelete') {
    throw new Error('[teamCascadeDelete] invalid plan type')
  }
}

export async function executeTeamCascadeDelete({ plan, deps = {} }) {
  assertPlan(plan)

  const results = {
    teamId: plan.teamId,
    paymentsArchive: null,
    stats: null,
    games: null,
    meetings: null,
    players: null,
    team: null,
    storage: null,
  }

  /**
   * 1. תשלומים — ארכוב עם snapshot.
   * חייב לקרות לפני מחיקת השחקנים.
   */
  results.paymentsArchive = await archiveTeamCascadePayments({ plan })

  /**
   * 2. סטטיסטיקה מתקדמת.
   * חייב לקרות לפני מחיקת משחקים, כי deleteGameStatsDoc צריך למצוא את המשחק.
   */
  if (typeof deps.deleteStats === 'function') {
    results.stats = await deps.deleteStats({ plan })
  } else {
    results.stats = await deleteTeamCascadeStats({ plan })
  }

  /**
   * 3. משחקים.
   */
  results.games = await deleteTeamGamesShorts({ plan })

  /**
   * 4. פגישות.
   */
  results.meetings = await deleteTeamMeetingsShorts({ plan })

  /**
   * 5. שחקנים.
   */
  results.players = await deleteTeamPlayersShorts({ plan })

  /**
   * 6. הקבוצה עצמה.
   */
  results.team = await deleteTeamRootShorts({ plan })

  /**
   * 7. Storage — אחרי מחיקת הדאטה, עם urls שנשמרו מראש ב־plan.
   */
  results.storage = await deleteTeamCascadeStorage({ plan })

  return {
    ok: true,
    teamId: plan.teamId,
    results,
  }
}
