// src/application/actions/entities/createEntity.builders.js

import { createShortItems } from '../../../services/firestore/shorts/shortsCreate.js'
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

const valueOr = (value, fallback) => value == null ? fallback : value

export function resolveCreateIdentity(request, index) {
  if (!request?.id) return { id: makeId(), now: Date.now() }
  if (!Number.isFinite(request.startedAt)) throw new Error('[createEntity] Invalid request timestamp')
  const id = index == null ? request.id : `${request.id}_${index}`
  return { id, now: request.startedAt }
}

async function writeCreateRecords(records, request) {
  await createShortItems({
    entries: records.flatMap(record => record.entries),
    allowExisting: Boolean(request?.id),
  })
  return records.map(record => record.item)
}

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
  gameLeagueNum: valueOr(draft?.gameLeagueNum, ''),
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

const buildGameCreateRecord = ({ draft, request, index }) => {
  const { id, now } = resolveCreateIdentity(request, index)
  const {
    gameInfoItem,
    gameTimeItem,
    gameResultItem,
    mergedItem,
  } = buildGameCreateItems({ id, draft, now })

  return {
    item: mergedItem,
    entries: [
      { shortKey: 'games.gameInfo', item: gameInfoItem },
      { shortKey: 'games.gameTime', item: gameTimeItem },
      { shortKey: 'games.gameResult', item: gameResultItem },
    ],
  }
}

export const createGameShorts = async ({ draft, request }) => {
  const [game] = await writeCreateRecords([buildGameCreateRecord({ draft, request })], request)
  return game
}

const buildGameRowDraft = (draft, row) => ({
  ...draft,
  ...row,
  gameHour: row?.gameHour || draft?.defaults?.gameHour || DEFAULT_GAME_HOUR,
  gameLeagueNum: valueOr(row?.gameLeagueNum, valueOr(draft?.gameLeagueNum, '')),
  type: row?.type || draft?.defaults?.type || '',
  gameDuration: row?.gameDuration || draft?.defaults?.gameDuration || '',
  home: valueOr(row?.home, valueOr(draft?.defaults?.home, true)),
  goalsFor: valueOr(row?.goalsFor, valueOr(draft?.goalsFor, 0)),
  goalsAgainst: valueOr(row?.goalsAgainst, valueOr(draft?.goalsAgainst, 0)),
})

async function createGameRows({ draft, context, request, buildRecord }) {
  const rows = Array.isArray(draft?.games) ? draft.games : []
  const records = rows.map((row, index) => buildRecord({
    draft: buildGameRowDraft(draft, row),
    context,
    request,
    index,
  }))
  const created = await writeCreateRecords(records, request)
  return { total: created.length, items: created }
}

export const createGamesShorts = ({ draft, request }) =>
  createGameRows({ draft, request, buildRecord: buildGameCreateRecord })

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

const buildExternalGameCreateRecord = ({ draft, context, request, index }) => {
  const { id, now } = resolveCreateIdentity(request, index)
  const externalDraft = buildExternalGameDraft({ draft, context })
  const gameInfoItem = buildExternalGameInfoItem({ id, draft: externalDraft, now })
  const gamePlayersItem = buildExternalGamePlayersItem({ id, draft: externalDraft })

  return {
    item: { ...gameInfoItem, ...gamePlayersItem },
    entries: [
      { shortKey: 'externalGames.gameInfo', item: gameInfoItem },
      { shortKey: 'externalGames.gamePlayers', item: gamePlayersItem },
    ],
  }
}

export const createExternalGameShorts = async ({ draft, context, request }) => {
  const record = buildExternalGameCreateRecord({ draft, context, request })
  const [game] = await writeCreateRecords([record], request)
  return game
}

export const createExternalGamesShorts = ({ draft, context, request }) =>
  createGameRows({ draft, context, request, buildRecord: buildExternalGameCreateRecord })

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
  month: clean(draft.month),
  year: clean(draft.year),
  ifaLink: clean(draft.ifaLink),
  active: draft.active !== false,
})

export const buildPlayerCreateItems = ({ id, draft, now }) => {
  const playerDraft = normalizePlayerCreateDraft(draft)
  const infoItem = {
    id,
    active: playerDraft.active,
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

const buildPlayerCreateRecord = ({ draft, request, index }) => {
  const { id, now } = resolveCreateIdentity(request, index)
  const { infoItem, namesItem, teamItem, mergedItem } = buildPlayerCreateItems({ id, draft, now })

  return {
    item: mergedItem,
    entries: [
      { shortKey: 'players.playersInfo', item: infoItem },
      { shortKey: 'players.playersNames', item: namesItem },
      { shortKey: 'players.playersTeam', item: teamItem },
    ],
  }
}

export const createPlayerShorts = async ({ draft, request }) => {
  const [player] = await writeCreateRecords([buildPlayerCreateRecord({ draft, request })], request)
  return player
}

export const createPlayersShorts = async ({ draft, request }) => {
  const rows = Array.isArray(draft?.players) ? draft.players : []
  const defaults = draft?.defaults || {}
  const records = rows.map((row, index) => buildPlayerCreateRecord({
    draft: {
      ...defaults,
      ...row,
      clubId: resolveValue(row.clubId, resolveValue(draft.clubId, defaults.clubId)),
      teamId: resolveValue(row.teamId, resolveValue(draft.teamId, defaults.teamId)),
    },
    request,
    index,
  }))

  const created = await writeCreateRecords(records, request)
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
    workContext: draft?.workContext || null,
  }, now)
}
