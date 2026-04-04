// ui/actions/fabActions.factory.js
import { iconUi } from '../core/icons/iconUi.js'

function pick(v, fallback) {
  return typeof v === 'function' ? v : fallback
}
function noOp() {}

export function buildFabActions({
  area = 'hub',
  mode,
  context = {},
  handlers = {},
  permissions = {},
} = {}) {
  const allowCreate = permissions?.allowCreate !== false

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

  if (area === 'hub') {
    if (mode === 'clubs') {
      return [
        {
          id: 'club',
          label: 'הוסף מועדון',
          icon: iconUi({ id: 'addClub' }),
          onClick: onCreateClub,
          color: 'club',
          disabled: !allowCreate,
        },
      ]
    }

    if (mode === 'teams') {
      return [
        {
          id: 'team',
          label: 'הוסף קבוצה',
          icon: iconUi({ id: 'addTeam' }),
          onClick: onCreateTeam,
          color: 'team',
          disabled: !allowCreate,
        },
      ]
    }

    if (mode === 'players') {
      return [
        {
          id: 'player',
          label: 'הוסף שחקן',
          icon: iconUi({ id: 'addPlayer' }),
          onClick: onCreatePlayer,
          color: 'player',
          disabled: !allowCreate,
        },
      ]
    }

    if (mode === 'privates') {
      return [
        {
          id: 'private-player',
          label: 'הוסף שחקן פרטי',
          icon: iconUi({ id: 'addPlayer' }),
          onClick: onCreatePrivatePlayer,
          color: 'private',
          disabled: !allowCreate,
        },
      ]
    }

    if (mode === 'staff') {
      return [
        {
          id: 'staff',
          label: 'הוסף איש צוות',
          icon: iconUi({ id: 'addRole' }),
          onClick: onCreateStaff,
          color: 'role',
          disabled: !allowCreate,
        },
      ]
    }

    if (mode === 'scouting') {
      return [
        {
          id: 'scout',
          label: 'הוסף שחקן למעקב',
          icon: iconUi({ id: 'addScouting' }),
          onClick: onCreateScout,
          color: 'project',
          disabled: !allowCreate,
        },
      ]
    }
  }

  if (area === 'player') {
    if (mode === 'meetings') {
      return [
        {
          id: 'add-meeting',
          label: 'הוסף מפגש',
          icon: iconUi({ id: 'addMeeting' }),
          onClick: onAddMeeting,
          color: 'project',
          disabled: !allowCreate,
        },
      ]
    }

    if (mode === 'abilities') {
      return [
        {
          id: 'add-abilities',
          label: 'הוסף טופס יכולות',
          icon: iconUi({ id: 'addAbilities' }),
          onClick: onAddAbilities,
          color: 'player',
          disabled: !allowCreate,
        },
      ]
    }

    if (mode === 'payments') {
      return [
        {
          id: 'add-payment',
          label: 'הוסף תשלום',
          icon: iconUi({ id: 'addPayment' }),
          onClick: onAddPayment,
          color: 'club',
          disabled: !allowCreate,
        },
      ]
    }

    if (mode === 'videoAnalysis') {
      return [
        {
          id: 'add-video',
          label: 'הוסף ניתוח וידאו',
          icon: iconUi({ id: 'addVideo' }),
          onClick: onAddVideoAnalysis,
          color: 'videoAnalysis',
          disabled: !allowCreate,
        },
      ]
    }

    return []
  }

  if (area === 'team') {
    if (mode === 'games') {
      return [
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
      ]
    }

    if (mode === 'players') {
      return [
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
      ]
    }

    return []
  }

  if (area === 'club') {
    if (mode === 'teams') {
      return [
        {
          id: 'team',
          label: 'הוסף קבוצה',
          icon: iconUi({ id: 'addTeam' }),
          onClick: onCreateTeam,
          color: 'team',
          disabled: !allowCreate,
        },
      ]
    }

    if (mode === 'players') {
      return [
        {
          id: 'player',
          label: 'הוסף שחקן',
          icon: iconUi({ id: 'addPlayer' }),
          onClick: onCreatePlayer,
          color: 'player',
          disabled: !allowCreate,
        },
      ]
    }

    return []
  }

  return []
}
