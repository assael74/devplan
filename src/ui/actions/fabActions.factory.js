// ui/actions/fabActions.factory.js

import { iconUi } from '../core/icons/iconUi.js'

function pick(v, fallback) {
  return typeof v === 'function' ? v : fallback
}

function noOp() {}

function buildTaskFabAction({
  allowCreate = true,
  onAddTask = noOp,
  area = '',
  mode = '',
  taskContext = {},
}) {
  return {
    id: 'add-task',
    label: 'הוסף משימה אישית',
    icon: iconUi({ id: 'addTask' }),
    onClick: () =>
      onAddTask({
        workspace: taskContext?.workspace || '',
        url: taskContext?.url || '',
        contextArea: taskContext?.contextArea || area || '',
        contextMode: taskContext?.contextMode || mode || '',
      }),
    color: 'taskApp',
    disabled: !allowCreate,
  }
}

function appendGlobalTaskAction(entityActions = [], taskAction = null) {
  if (!taskAction) return entityActions
  if (!Array.isArray(entityActions) || !entityActions.length) return [taskAction]

  return [
    ...entityActions,
    {
      id: 'divider-task',
      type: 'divider',
    },
    taskAction,
  ]
}

export function buildFabActions({
  area = 'hub',
  mode,
  context = {},
  taskContext = {},
  handlers = {},
  permissions = {},
} = {}) {
  const allowCreate = permissions?.allowCreate !== false

  const onAddTask = pick(handlers.onAddTask, noOp)

  const onCreateClub = pick(handlers.onCreateClub, noOp)
  const onCreateTeam = pick(handlers.onCreateTeam, noOp)
  const onCreateProject = pick(handlers.onCreateProject, noOp)
  const onCreatePlayer = pick(handlers.onCreatePlayer, noOp)
  const onCreatePrivatePlayer = pick(handlers.onCreatePrivatePlayer, noOp)
  const onCreatePlayers = pick(handlers.onCreatePlayers, noOp)
  const onCreateTag = pick(handlers.onCreateTag, noOp)
  const onCreateStaff = pick(handlers.onCreateStaff, noOp)
  const onCreateScout = pick(handlers.onCreateScout, noOp)
  const onAddMeeting = pick(handlers.onAddMeeting, noOp)
  const onAddPayment = pick(handlers.onAddPayment, noOp)
  const onAddAbilities = pick(handlers.onAddAbilities, noOp)
  const onAddGame = pick(handlers.onAddGame, noOp)
  const onAddGames = pick(handlers.onAddGames, noOp)
  const onAddVideoAnalysis = pick(handlers.onAddVideoAnalysis, noOp)
  const onCreateVideoGeneral = pick(handlers.onCreateVideoGeneral, noOp)

  const taskAction = buildTaskFabAction({
    allowCreate,
    onAddTask,
    area,
    mode,
    taskContext,
  })

  if (area === 'hub') {
    if (mode === 'clubs') {
      return appendGlobalTaskAction(
        [
          {
            id: 'club',
            label: 'הוסף מועדון',
            icon: iconUi({ id: 'addClub' }),
            onClick: onCreateClub,
            color: 'club',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'teams') {
      return appendGlobalTaskAction(
        [
          {
            id: 'team',
            label: 'הוסף קבוצה',
            icon: iconUi({ id: 'addTeam' }),
            onClick: onCreateTeam,
            color: 'team',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'players') {
      return appendGlobalTaskAction(
        [
          {
            id: 'player',
            label: 'הוסף שחקן',
            icon: iconUi({ id: 'addPlayer' }),
            onClick: onCreatePlayer,
            color: 'player',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'privates') {
      return appendGlobalTaskAction(
        [
          {
            id: 'private-player',
            label: 'הוסף שחקן פרטי',
            icon: iconUi({ id: 'addPlayer' }),
            onClick: onCreatePrivatePlayer,
            color: 'private',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'staff') {
      return appendGlobalTaskAction(
        [
          {
            id: 'staff',
            label: 'הוסף איש צוות',
            icon: iconUi({ id: 'addRole' }),
            onClick: onCreateStaff,
            color: 'role',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'scouting') {
      return appendGlobalTaskAction(
        [
          {
            id: 'scout',
            label: 'הוסף שחקן למעקב',
            icon: iconUi({ id: 'addScouting' }),
            onClick: onCreateScout,
            color: 'project',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    return appendGlobalTaskAction([], taskAction)
  }

  if (area === 'player') {
    if (mode === 'meetings') {
      return appendGlobalTaskAction(
        [
          {
            id: 'add-meeting',
            label: 'הוסף מפגש',
            icon: iconUi({ id: 'addMeeting' }),
            onClick: onAddMeeting,
            color: 'project',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'abilities') {
      return appendGlobalTaskAction(
        [
          {
            id: 'add-abilities',
            label: 'הוסף טופס יכולות',
            icon: iconUi({ id: 'addAbilities' }),
            onClick: onAddAbilities,
            color: 'player',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'payments') {
      return appendGlobalTaskAction(
        [
          {
            id: 'add-payment',
            label: 'הוסף תשלום',
            icon: iconUi({ id: 'addPayment' }),
            onClick: onAddPayment,
            color: 'club',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'videoAnalysis') {
      return appendGlobalTaskAction(
        [
          {
            id: 'add-video',
            label: 'הוסף ניתוח וידאו',
            icon: iconUi({ id: 'addVideo' }),
            onClick: onAddVideoAnalysis,
            color: 'videoAnalysis',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    return appendGlobalTaskAction([], taskAction)
  }

  if (area === 'team') {
    if (mode === 'games') {
      return appendGlobalTaskAction(
        [
          {
            id: 'add-game',
            label: 'הוסף משחק',
            icon: iconUi({ id: 'addGame' }),
            onClick: onAddGame,
            color: 'team',
            disabled: !allowCreate,
          },
          {
            id: 'add-multi-game',
            label: 'הוסף מספר משחקים',
            icon: iconUi({ id: 'addGames' }),
            onClick: onAddGames,
            color: 'team',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'players') {
      return appendGlobalTaskAction(
        [
          {
            id: 'player',
            label: 'הוסף שחקן',
            icon: iconUi({ id: 'addPlayer' }),
            onClick: onCreatePlayer,
            color: 'player',
            disabled: !allowCreate,
          },
          {
            id: 'players',
            label: 'הוסף מספר שחקנים',
            icon: iconUi({ id: 'addPlayers' }),
            onClick: onCreatePlayers,
            color: 'player',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    return appendGlobalTaskAction([], taskAction)
  }

  if (area === 'club') {
    if (mode === 'teams') {
      return appendGlobalTaskAction(
        [
          {
            id: 'team',
            label: 'הוסף קבוצה',
            icon: iconUi({ id: 'addTeam' }),
            onClick: onCreateTeam,
            color: 'team',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'players') {
      return appendGlobalTaskAction(
        [
          {
            id: 'player',
            label: 'הוסף שחקן',
            icon: iconUi({ id: 'addPlayer' }),
            onClick: onCreatePlayer,
            color: 'player',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    return appendGlobalTaskAction([], taskAction)
  }

  if (area === 'video') {
    if (mode === 'analysis') {
      return appendGlobalTaskAction(
        [
          {
            id: 'create-video-analysis',
            label: 'ניתוח וידאו חדש',
            icon: iconUi({ id: 'videoAnalysis' }),
            onClick: onAddVideoAnalysis,
            color: 'videoAnalysis',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    if (mode === 'general') {
      return appendGlobalTaskAction(
        [
          {
            id: 'create-video-general',
            label: 'וידאו כללי חדש',
            icon: iconUi({ id: 'videoGeneral' }),
            onClick: onCreateVideoGeneral,
            color: 'videoGeneral',
            disabled: !allowCreate,
          },
        ],
        taskAction
      )
    }

    return appendGlobalTaskAction([], taskAction)
  }

  if (area === 'calendar') {
  return appendGlobalTaskAction(
    [
      {
        id: 'add-meeting',
        label: 'הוסף מפגש',
        icon: iconUi({ id: 'addMeeting' }),
        onClick: onAddMeeting,
        color: 'project',
        disabled: !allowCreate,
      },
    ],
    taskAction
  )
}

  if (area === 'tags') {
    return appendGlobalTaskAction(
      [
        {
          id: 'create-tag',
          label: 'יצירת תג חדש',
          icon: iconUi({ id: 'addTag' }),
          onClick: onCreateTag,
          color: 'tags',
          disabled: !allowCreate,
        },
      ],
      taskAction
    )
  }

  return appendGlobalTaskAction([], taskAction)
}
