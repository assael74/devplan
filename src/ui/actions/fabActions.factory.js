// ui/actions/fabActions.factory.js

import { buildHubFabActions } from './fabActions/fabActions.hub.js'
import { buildPlayerFabActions } from './fabActions/fabActions.player.js'
import { buildTeamFabActions } from './fabActions/fabActions.team.js'
import { buildClubFabActions } from './fabActions/fabActions.club.js'
import { buildVideoFabActions } from './fabActions/fabActions.video.js'
import { buildCalendarFabActions } from './fabActions/fabActions.calendar.js'
import { buildTagsFabActions } from './fabActions/fabActions.tags.js'
import { buildTaskFabAction, noOp, pick } from './fabActions/fabActions.shared.js'

export function buildFabActions({
  area = 'hub',
  mode,
  context = {},
  taskContext = {},
  handlers = {},
  permissions = {},
} = {}) {
  const allowCreate = permissions?.allowCreate !== false

  const resolvedHandlers = {
    onAddTask: pick(handlers.onAddTask, noOp),
    onCreateClub: pick(handlers.onCreateClub, noOp),
    onCreateTeam: pick(handlers.onCreateTeam, noOp),
    onCreateProject: pick(handlers.onCreateProject, noOp),
    onCreatePlayer: pick(handlers.onCreatePlayer, noOp),
    onCreatePrivatePlayer: pick(handlers.onCreatePrivatePlayer, noOp),
    onCreatePlayers: pick(handlers.onCreatePlayers, noOp),
    onCreateTag: pick(handlers.onCreateTag, noOp),
    onCreateStaff: pick(handlers.onCreateStaff, noOp),
    onCreateScout: pick(handlers.onCreateScout, noOp),
    onAddMeeting: pick(handlers.onAddMeeting, noOp),
    onAddPayment: pick(handlers.onAddPayment, noOp),
    onAddAbilities: pick(handlers.onAddAbilities, noOp),
    onAddGame: pick(handlers.onAddGame, noOp),
    onAddGames: pick(handlers.onAddGames, noOp),
    onAddVideoAnalysis: pick(handlers.onAddVideoAnalysis, noOp),
    onCreateVideoGeneral: pick(handlers.onCreateVideoGeneral, noOp),

    onOpenPlayersInsights: pick(handlers.onOpenPlayersInsights, noOp),
    onOpenTeamsInsights: pick(handlers.onOpenTeamsInsights, noOp),
    onOpenGamesInsights: pick(handlers.onOpenGamesInsights, noOp),
    onOpenPerformanceInsights: pick(handlers.onOpenPerformanceInsights, noOp),
    onOpenAbilitiesInsights: pick(handlers.onOpenAbilitiesInsights, noOp),
    onOpenVideoInsights: pick(handlers.onOpenVideoInsights, noOp),
  }

  const taskAction = buildTaskFabAction({
    allowCreate,
    onAddTask: resolvedHandlers.onAddTask,
    area,
    mode,
    taskContext,
  })

  if (area === 'hub') {
    return buildHubFabActions({
      mode,
      allowCreate,
      taskAction,
      handlers: resolvedHandlers,
    })
  }

  if (area === 'player') {
    return buildPlayerFabActions({
      mode,
      allowCreate,
      taskAction,
      handlers: resolvedHandlers,
    })
  }

  if (area === 'team') {
    return buildTeamFabActions({
      mode,
      allowCreate,
      taskAction,
      handlers: resolvedHandlers,
    })
  }

  if (area === 'club') {
    return buildClubFabActions({
      mode,
      allowCreate,
      taskAction,
      handlers: resolvedHandlers,
    })
  }

  if (area === 'video') {
    return buildVideoFabActions({
      mode,
      allowCreate,
      taskAction,
      handlers: resolvedHandlers,
    })
  }

  if (area === 'calendar') {
    return buildCalendarFabActions({
      allowCreate,
      taskAction,
      handlers: resolvedHandlers,
    })
  }

  if (area === 'tags') {
    return buildTagsFabActions({
      allowCreate,
      taskAction,
      handlers: resolvedHandlers,
    })
  }

  if (area === 'home') {
    return taskAction ? [taskAction] : []
  }

  return taskAction ? [taskAction] : []
}
