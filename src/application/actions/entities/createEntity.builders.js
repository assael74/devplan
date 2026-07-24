// src/application/actions/entities/createEntity.builders.js

import { createShort } from '../../../services/firestore/shorts/shortsCreate.js'
import { makeId } from '../../../utils/id.js'

import {
  normalizeTask,
  getDefaultTaskTypeByWorkspace,
} from '../../../shared/tasks/tasks.model.js'

import {
  TASK_WORKSPACES,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_COMPLEXITY,
} from '../../../shared/tasks/tasks.constants.js'

const clean = value => String(value == null ? '' : value).trim()

const toNum = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const toNumOrNull = value => {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const toBool = (value, fallback = false) => {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

const toBoolOrNull = value => (typeof value === 'boolean' ? value : null)

const resolveResult = ({ goalsFor, goalsAgainst }) => {
  const gf = toNum(goalsFor)
  const ga = toNum(goalsAgainst)

  if (gf > ga) return 'win'
  if (gf < ga) return 'loss'

  return 'draw'
}

export const DEFAULT_GAME_HOUR = '12:00'

export const buildGameInfoItem = ({ id, draft, now }) => ({
  id,
  clubId: clean(draft?.clubId),
  teamId: clean(draft?.teamId),
  rivel: clean(draft?.rivel),
  home: toBoolOrNull(draft?.home),
  difficulty: clean(draft?.difficulty) || null,
  type: clean(draft?.type) || null,
  gameLeagueNum: toNumOrNull(draft?.gameLeagueNum),
  createdAt: now,
  updatedAt: now,
})

export const buildGameTimeItem = ({ id, draft }) => ({
  id,
  gameDate: clean(draft?.gameDate) || null,
  gameHour: clean(draft?.gameHour) || null,
  gameDuration: toNumOrNull(draft?.gameDuration),
})

export const buildGameResultItem = ({ id, draft }) => {
  const goalsFor = toNumOrNull(draft?.goalsFor)
  const goalsAgainst = toNumOrNull(draft?.goalsAgainst)

  return {
    id,
    goalsFor,
    goalsAgainst,
    result: goalsFor == null || goalsAgainst == null
      ? null
      : resolveResult({ goalsFor, goalsAgainst }),
  }
}

export const normalizeGameCreateDraft = (draft = {}) => ({
  ...draft,
  gameHour: clean(draft?.gameHour) || DEFAULT_GAME_HOUR,
  gameLeagueNum: draft?.gameLeagueNum ?? '',
  goalsFor: toNum(draft?.goalsFor),
  goalsAgainst: toNum(draft?.goalsAgainst),
  result: clean(draft?.result) || resolveResult({
    goalsFor: draft?.goalsFor,
    goalsAgainst: draft?.goalsAgainst,
  }),
})

export const buildGameCreateItems = ({ id, draft, now }) => {
  const gameDraft = normalizeGameCreateDraft(draft)
  const gameInfoItem = buildGameInfoItem({ id, draft: gameDraft, now })
  const gameTimeItem = buildGameTimeItem({ id, draft: gameDraft })
  const gameResultItem = buildGameResultItem({ id, draft: gameDraft })

  return {
    gameDraft,
    gameInfoItem,
    gameTimeItem,
    gameResultItem,
    mergedItem: {
      ...gameInfoItem,
      ...gameTimeItem,
      ...gameResultItem,
    },
  }
}

export const createGameShorts = async ({ draft }) => {
  const id = makeId()
  const now = Date.now()
  const {
    gameInfoItem,
    gameTimeItem,
    gameResultItem,
    mergedItem,
  } = buildGameCreateItems({ id, draft, now })

  await Promise.all([
    createShort({ shortKey: 'games.gameInfo', item: gameInfoItem }),
    createShort({ shortKey: 'games.gameTime', item: gameTimeItem }),
    createShort({ shortKey: 'games.gameResult', item: gameResultItem }),
  ])

  return mergedItem
}

export const createGamesShorts = async ({ draft }) => {
  const rows = Array.isArray(draft?.games) ? draft.games : []

  const created = await Promise.all(rows.map(row => createGameShorts({
    draft: normalizeGameCreateDraft({
      ...draft,
      ...row,
      gameHour: row?.gameHour || draft?.defaults?.gameHour || DEFAULT_GAME_HOUR,
      gameLeagueNum: row?.gameLeagueNum ?? draft?.gameLeagueNum ?? '',
      type: row?.type || draft?.defaults?.type || '',
      gameDuration: row?.gameDuration || draft?.defaults?.gameDuration || '',
      home: row?.home ?? draft?.defaults?.home ?? true,
      goalsFor: row?.goalsFor ?? draft?.goalsFor ?? 0,
      goalsAgainst: row?.goalsAgainst ?? draft?.goalsAgainst ?? 0,
    }),
  })))

  return { total: created.length, items: created }
}

export const buildExternalGameDraft = ({ draft, context, row = {} }) => {
  const player = context?.player || context?.entity || {}
  const merged = { ...draft, ...row }

  return {
    ...merged,
    playerId: clean(merged?.playerId || context?.playerId || player?.id),
    teamId: clean(merged?.teamId || context?.teamId || player?.teamId),
    clubId: clean(merged?.clubId || context?.clubId || player?.clubId),
    teamName: clean(merged?.teamName || player?.teamName || player?.team?.teamName),
    clubName: clean(merged?.clubName || player?.clubName || player?.club?.clubName),
    gameHour: clean(merged?.gameHour) || DEFAULT_GAME_HOUR,
    home: toBool(merged?.home, true),
    goalsFor: toNum(merged?.goalsFor),
    goalsAgainst: toNum(merged?.goalsAgainst),
    result: clean(merged?.result) || resolveResult({
      goalsFor: merged?.goalsFor,
      goalsAgainst: merged?.goalsAgainst,
    }),
    isSelected: toBool(merged?.isSelected, true),
    isStarting: toBool(merged?.isStarting, false),
    goals: toNum(merged?.goals),
    assists: toNum(merged?.assists),
    timePlayed: toNum(merged?.timePlayed),
    gameSource: 'external',
    isExternalGame: true,
  }
}

export const buildExternalGameInfoItem = ({ id, draft, now }) => ({
  ...buildGameInfoItem({ id, draft, now }),
  ...buildGameTimeItem({ id, draft }),
  ...buildGameResultItem({ id, draft }),
  playerId: clean(draft?.playerId),
  teamName: clean(draft?.teamName),
  clubName: clean(draft?.clubName),
  result: clean(draft?.result) || resolveResult({
    goalsFor: draft?.goalsFor,
    goalsAgainst: draft?.goalsAgainst,
  }),
  gameSource: 'external',
  isExternalGame: true,
})

export const buildExternalGamePlayersItem = ({ id, draft }) => {
  const goalsFor = toNum(draft?.goalsFor)

  return {
    id,
    playerId: clean(draft?.playerId),
    isSelected: toBool(draft?.isSelected, true),
    isStarting: toBool(draft?.isStarting, false),
    onSquad: toBool(draft?.isSelected, true),
    onStart: toBool(draft?.isStarting, false),
    goals: Math.min(toNum(draft?.goals), goalsFor),
    assists: Math.min(toNum(draft?.assists), goalsFor),
    timePlayed: toNum(draft?.timePlayed),
  }
}

export const createExternalGameShorts = async ({ draft, context }) => {
  const id = makeId()
  const now = Date.now()
  const externalDraft = buildExternalGameDraft({ draft, context })
  const gameInfoItem = buildExternalGameInfoItem({ id, draft: externalDraft, now })
  const gamePlayersItem = buildExternalGamePlayersItem({ id, draft: externalDraft })

  await Promise.all([
    createShort({ shortKey: 'externalGames.gameInfo', item: gameInfoItem }),
    createShort({ shortKey: 'externalGames.gamePlayers', item: gamePlayersItem }),
  ])

  return { ...gameInfoItem, ...gamePlayersItem }
}

export const createExternalGamesShorts = async ({ draft, context }) => {
  const rows = Array.isArray(draft?.games) ? draft.games : []

  const created = await Promise.all(rows.map(row => createExternalGameShorts({
    draft: {
      ...draft,
      ...row,
      gameHour: row?.gameHour || draft?.defaults?.gameHour || DEFAULT_GAME_HOUR,
      gameLeagueNum: row?.gameLeagueNum ?? draft?.gameLeagueNum ?? '',
      type: row?.type || draft?.defaults?.type || '',
      gameDuration: row?.gameDuration || draft?.defaults?.gameDuration || '',
      home: row?.home ?? draft?.defaults?.home ?? true,
      goalsFor: row?.goalsFor ?? draft?.goalsFor ?? 0,
      goalsAgainst: row?.goalsAgainst ?? draft?.goalsAgainst ?? 0,
    },
    context,
  })))

  return { total: created.length, items: created }
}

const resolveValue = (primaryValue, fallbackValue) => {
  if (primaryValue !== undefined && primaryValue !== null && primaryValue !== '') {
    return primaryValue
  }

  return fallbackValue
}

const resolveBirthValue = (draft = {}) => {
  const birth = clean(draft?.birth)
  if (birth) return birth

  const month = clean(draft?.month).padStart(2, '0')
  const year = clean(draft?.year)

  return month && year ? `${month}-${year}` : ''
}

export const normalizePlayerCreateDraft = (draft = {}) => ({
  playerFirstName: clean(draft.playerFirstName),
  playerLastName: clean(draft.playerLastName),
  clubId: clean(draft.clubId),
  teamId: clean(draft.teamId),
  birth: clean(resolveValue(draft.birth, draft.birthYear)),
  ifaLink: clean(draft.ifaLink),
  active: draft.active !== false,
})

export const buildPlayerCreateItems = ({ id, draft, now }) => {
  const playerDraft = normalizePlayerCreateDraft(draft)
  const infoItem = {
    id,
    active: true,
    createdAt: now,
    updatedAt: now,
    type: 'noneType',
    birth: resolveBirthValue(playerDraft),
    ...(playerDraft.ifaLink ? { ifaLink: playerDraft.ifaLink } : {}),
  }
  const namesItem = {
    id,
    playerFirstName: clean(playerDraft.playerFirstName),
    playerLastName: clean(playerDraft.playerLastName),
  }
  const teamItem = {
    id,
    clubId: clean(playerDraft.clubId),
    teamId: clean(playerDraft.teamId),
  }

  return {
    playerDraft,
    infoItem,
    namesItem,
    teamItem,
    mergedItem: { ...infoItem, ...namesItem, ...teamItem },
  }
}

export const createPlayerShorts = async ({ draft }) => {
  const id = makeId()
  const now = Date.now()
  const { infoItem, namesItem, teamItem, mergedItem } = buildPlayerCreateItems({
    id,
    draft,
    now,
  })

  await Promise.all([
    createShort({ shortKey: 'players.playersInfo', item: infoItem }),
    createShort({ shortKey: 'players.playersNames', item: namesItem }),
    createShort({ shortKey: 'players.playersTeam', item: teamItem }),
  ])

  return mergedItem
}

export const createPlayersShorts = async ({ draft }) => {
  const rows = Array.isArray(draft?.players) ? draft.players : []
  const defaults = draft?.defaults || {}
  const created = []

  for (const row of rows) {
    const item = await createPlayerShorts({
      draft: normalizePlayerCreateDraft({
        ...defaults,
        ...row,
        clubId: resolveValue(row.clubId, resolveValue(draft.clubId, defaults.clubId)),
        teamId: resolveValue(row.teamId, resolveValue(draft.teamId, defaults.teamId)),
      }),
    })
    created.push(item)
  }

  return { total: created.length, items: created }
}

export const buildMeetingStartAtMs = (meetingDate, meetingHour) => {
  const date = clean(meetingDate)
  const hour = clean(meetingHour)

  if (!date || !hour) return null

  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = hour.split(':').map(Number)

  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }

  const time = new Date(year, month - 1, day, hours, minutes, 0, 0).getTime()
  return Number.isNaN(time) ? null : time
}

export const buildTaskCreateItem = ({ id, draft, now = Date.now() }) => {
  const workspace = draft?.workspace || TASK_WORKSPACES.ANALYST

  return normalizeTask({
    id,
    workspace,
    title: clean(draft?.title),
    url: clean(draft?.url),
    description: clean(draft?.description),
    status: draft?.status || TASK_STATUS.NEW,
    priority: draft?.priority || TASK_PRIORITY.MEDIUM,
    complexity: draft?.complexity || TASK_COMPLEXITY.MEDIUM,
    taskType: draft?.taskType || getDefaultTaskTypeByWorkspace(workspace),
    parentTaskId: draft?.parentTaskId || null,
    sortOrder: Number(draft?.sortOrder || 0),
    dueDate: draft?.dueDate || null,
    createdAt: now,
    updatedAt: now,
    doneAt: draft?.status === TASK_STATUS.DONE ? now : null,
    contextArea: clean(draft?.contextArea),
    contextMode: clean(draft?.contextMode),
  }, now)
}
