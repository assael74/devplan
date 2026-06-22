// src/features/playersDatabase/components/modals/playerStats/PlayerStatsModal.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Table,
  Tooltip,
  Typography,
} from '@mui/joy'

import { formatLtrNumber } from '../../../../../shared/format/direction.js'
import {
  buildPlayerScoutSignals,
  buildScoutMetrics,
  TEAM_FILTER,
} from '../../../../../shared/players/scouting/index.js'
import {
  addPlayerToTeam,
  findPlayersByNames,
  savePlayerStatsRows,
} from '../../../services/pdbPlayers.firestore.js'
import { buildPlayerStatsPreview } from './playerStatsPreview.js'
import { playerStatsModalSx as sx } from './sx/playerStatsModal.sx.js'

const ph = [
  'שם שחקן',
  'משחקים',
  'שערים',
  'צהובים ליגה/גביע',
  'צהובים טוטו',
  'אדומים',
  'הרכב פותח',
  'נכנס כמחליף',
  'הוחלף',
  'דקות משחק',
].join(' | ')

const actOpt = {
  ADD: 'add',
  SKIP: 'skip',
}

const addOpt = {
  PLAYING_UP: 'playing_up',
  TRANSFER_IN: 'transfer_in',
  MISSING_ROSTER: 'missing_roster',
}

const skipOpt = {
  IRRELEVANT: 'irrelevant',
  BAD_ROW: 'bad_row',
  TRANSFER_OUT: 'transfer_out',
}

const snapOpt = {
  ROUND: 'round',
  CURRENT: 'season_current',
  FINAL: 'season_final',
}

const issueText = row => {
  if (row.skip) return 'נמחק מהטעינה'
  if (!row.issues?.length) return 'תקין'
  if (row.issues.includes('missingPlayerName')) return 'חסר שם שחקן'
  if (row.issues.includes('ambiguousPlayerName')) return 'כמה שחקנים דומים'
  if (row.issues.includes('playerResolveRequired')) return 'בחר טיפול'
  if (row.issues.includes('playerNotInRoster')) return 'נמצא, לא בסגל'
  if (row.issues.includes('playerNotFound')) return 'שחקן לא נמצא בקבוצה'
  return 'שגיאה'
}

const norm = value =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[׳³'"]/g, '')
    .replace(/\s+/g, ' ')

const nkey = value =>
  norm(value)
    .split(' ')
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'he'))
    .join('|')

const key = player => player?.id || player?.playerSeasonId || ''

const lbl = player =>
  String(player?.fullName || player?.playerName || player?.externalPlayerId || '').trim()

const statNum = value => {
  const n = Number(String(value ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

const pct = value => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'

  return `${Math.round(n * 100)}%`
}

const reliabilityColor = level => {
  if (level === 'high') return 'success'
  if (level === 'medium') return 'warning'
  if (level === 'low') return 'danger'

  return 'neutral'
}

const teamFilterPass = ({ filter, team }) => {
  const attack = Number(team.attackEdge)
  const defense = Number(team.defenseEdge)
  const attackOk = Number.isFinite(attack) && attack > 0
  const defenseOk = Number.isFinite(defense) && defense > 0
  const clearOk =
    (Number.isFinite(attack) && attack >= 0.1) ||
    (Number.isFinite(defense) && defense >= 0.1)

  if (!filter || filter === TEAM_FILTER.ANY) return true
  if (filter === TEAM_FILTER.ANY_POSITIVE) return attackOk || defenseOk
  if (filter === TEAM_FILTER.DEFENSE_POSITIVE) return defenseOk
  if (filter === TEAM_FILTER.CLEAR_POSITIVE) return clearOk

  return false
}

const splitSignalsByTeam = ({ signals = [], team = {} }) => {
  const eligible = []
  const blocked = []

  signals.forEach(signal => {
    if (teamFilterPass({ filter: signal.teamFilter, team })) {
      eligible.push(signal)
      return
    }

    blocked.push(signal)
  })

  return {
    eligible,
    blocked,
  }
}

const ageGroupYear = team => {
  const explicit = statNum(team.birthYear || team.ageGroupYear)
  if (explicit) return explicit

  const seasonStart = String(team.seasonId || '').match(/^(\d{4})/)?.[1]
  const age = String(team.ageGroupId || '').match(/u(\d+)/i)?.[1]
  const startYear = Number(seasonStart)
  const ageNumber = Number(age)

  if (!Number.isFinite(startYear) || !Number.isFinite(ageNumber)) return 0

  return startYear - ageNumber + 1
}

const lowerBirthYear = team => {
  const year = ageGroupYear(team)
  return year ? year + 1 : 0
}

const slug = value =>
  norm(value)
    .replace(/[^a-z0-9א-ת]+/gi, '-')
    .replace(/^-+|-+$/g, '')

const playerFromRow = (row, team) => {
  const stats = row.stats || {}
  const externalPlayerId = String(stats.externalPlayerId || '').trim()
  const name = String(stats.playerName || '').trim()
  const fallbackId = [
    slug(name),
    slug(team.teamSeasonKey || team.leagueId || 'team'),
  ].filter(Boolean).join('__')
  const id = externalPlayerId ? `fb_${externalPlayerId}` : `local_${fallbackId}`

  if (!id || !name) return null

  return {
    id,
    playerId: id,
    externalPlayerId,
    fullName: name,
    playerName: name,
    source: {
      provider: 'football_org_il',
      playerUrl: stats.playerUrl || '',
    },
  }
}

const buildScoutPreview = (row, player, team) => {
  if (!row.valid || row.skip || !player) {
    return {
      metrics: {},
      signals: [],
      best: null,
      profileText: '-',
      reliabilityText: '-',
      metricsText: '-',
    }
  }

  const stats = row.stats || {}
  const teamBirthYear = ageGroupYear(team)
  const playerData = {
    ...player,
    id: player.playerId || player.id,
    playerId: player.playerId || player.id,
    minutes: statNum(stats.minutes),
    games: statNum(stats.games),
    goals: statNum(stats.goals),
    yellowCards: statNum(stats.yellowLeagueCup),
    starts: statNum(stats.starts),
    subIn: statNum(stats.subIn),
    subOut: statNum(stats.subOut),
    birthYear: statNum(player.birthYear || player.playerBirthYear),
    yearOfBirth: statNum(player.birthYear || player.playerBirthYear),
    playingUpMinutes: player.plannedReason === addOpt.PLAYING_UP
      ? statNum(stats.minutes)
      : statNum(player.playingUpMinutes),
  }
  const teamData = {
    ...team,
    games: statNum(team.games),
    gamesPlayed: statNum(team.games),
    goalsFor: statNum(team.goalsFor),
    goalsAgainst: statNum(team.goalsAgainst),
    teamGoals: statNum(team.goalsFor),
    attackEdge: Number(team.attackEdge),
    defenseEdge: Number(team.defenseEdge),
    birthYear: teamBirthYear,
    ageGroupYear: teamBirthYear,
  }
  const metrics = buildScoutMetrics({
    player: playerData,
    team: teamData,
  })
  const signals = buildPlayerScoutSignals({
    player: playerData,
    team: teamData,
    perspective: team.perspective || '',
  })
  const { eligible, blocked } = splitSignalsByTeam({
    signals,
    team: teamData,
  })
  const best = eligible[0] || signals[0] || null
  const extraCount = Math.max(0, (eligible.length || signals.length) - 1)
  const profileText = best
    ? `${best.profileLabel}${extraCount ? ` +${extraCount}` : ''}${eligible.length ? '' : ' (אישי)'}`
    : 'אין פרופיל'
  const reliabilityText = best
    ? `${best.reliability?.level || '-'} ${best.reliability?.score ?? '-'}`
    : metrics.hasPosition ? '-' : 'חסרה עמדה'
  const metricsText = [
    `דק׳ ${pct(metrics.minutesPct)}`,
    `הרכב ${pct(metrics.startsPct)}`,
    `סאב ${pct(metrics.subInPct)}`,
    `ג/90 ${Number(metrics.goalsPer90 || 0).toFixed(2)}`,
    `חלק שערים ${pct(metrics.goalsShareOfTeam)}`,
  ].join(' | ')

  return {
    metrics,
    signals,
    eligible,
    blocked,
    best,
    profileText,
    reliabilityText,
    metricsText,
    allProfilesText: signals
      .map(signal => {
        const status = eligible.some(item => item.profileId === signal.profileId)
          ? 'עבר'
          : 'נחסם הקשר קבוצתי'

        return `${signal.profileLabel} (${signal.score}) - ${status}`
      })
      .join(' | '),
  }
}

const plannedSeasonId = (player, team) =>
  `${key(player)}__${String(team.teamSeasonKey || '').trim()}`

const plannedSeason = (player, team, reason) => ({
  ...player,
  id: plannedSeasonId(player, team),
  playerId: key(player),
  fullName: lbl(player),
  playerName: lbl(player),
  teamContext: team,
  teamSeasonKey: team.teamSeasonKey,
  teamSlotId: team.teamSlotId,
  teamId: team.teamId || team.teamSlotId,
  clubId: team.clubId,
  clubName: team.clubName || team.teamName,
  leagueId: team.leagueId,
  leagueName: team.leagueName,
  ageGroupId: team.ageGroupId,
  birthYear: player.birthYear || player.playerBirthYear || (
    reason === addOpt.PLAYING_UP ? lowerBirthYear(team) : ''
  ),
  playerBirthYear: player.birthYear || player.playerBirthYear || (
    reason === addOpt.PLAYING_UP ? lowerBirthYear(team) : ''
  ),
  teamSlot: team.teamSlot,
  plannedReason: reason,
})

const fix = (row, player, rosterIds, action) => {
  if (action === actOpt.ADD && player) {
    return {
      ...row,
      playerId: player.playerId || player.id || '',
      playerSeasonId: player.id || '',
      pendingPlayerId: '',
      teamContext: player.teamContext || player,
      valid: true,
      issues: [],
    }
  }

  if (action === actOpt.SKIP) {
    return {
      ...row,
      skip: true,
      valid: true,
      issues: [],
    }
  }

  if (!player) return row

  const isRoster = rosterIds.has(key(player))
  const issues = row.issues.filter(issue => (
    issue !== 'playerNotFound' &&
    issue !== 'ambiguousPlayerName' &&
    issue !== 'playerNotInRoster'
  ))

  if (!isRoster && action !== actOpt.ADD) issues.push('playerResolveRequired')
  if (!isRoster && action === actOpt.ADD) issues.push('playerNotInRoster')

  return {
    ...row,
    playerId: player.playerId || player.id || '',
    playerSeasonId: isRoster ? player.id || '' : '',
    pendingPlayerId: isRoster ? '' : player.id || '',
    valid: issues.length === 0,
    issues,
  }
}

export default function PlayerStatsModal({
  open,
  teamContext = {},
  teamOptions = [],
  existingPlayers = [],
  onClose,
  onAdded,
  onSaved,
}) {
  const [pasteText, setPasteText] = useState('')
  const [pick, setPick] = useState({})
  const [act, setAct] = useState({})
  const [ext, setExt] = useState([])
  const [added, setAdded] = useState([])
  const [addedRows, setAddedRows] = useState({})
  const [addedPlans, setAddedPlans] = useState({})
  const [adding, setAdding] = useState({})
  const [undoing, setUndoing] = useState({})
  const [actionMode, setActionMode] = useState({})
  const [addReason, setAddReason] = useState({})
  const [skipReason, setSkipReason] = useState({})
  const [targetTeam, setTargetTeam] = useState({})
  const [saving, setSaving] = useState(false)
  const [snap, setSnap] = useState(snapOpt.ROUND)
  const [round, setRound] = useState('')
  const [openPick, setOpenPick] = useState('')

  const preview = useMemo(
    () => buildPlayerStatsPreview(pasteText, existingPlayers),
    [pasteText, existingPlayers]
  )

  useEffect(() => {
    let alive = true
    const names = preview.rows
      .filter(row => row.issues.includes('playerNotFound'))
      .map(row => row.stats.playerName)
      .filter(Boolean)

    if (!names.length) {
      setExt([])
      return () => {
        alive = false
      }
    }

    findPlayersByNames(names)
      .then(rows => {
        if (alive) setExt(rows)
      })
      .catch(() => {
        if (alive) setExt([])
      })

    return () => {
      alive = false
    }
  }, [preview.rows])

  useEffect(() => {
    if (!openPick) return undefined

    const closePick = event => {
      const target = event.target
      if (
        target?.closest?.('[data-player-pick-root]') ||
        target?.closest?.('[role="listbox"]')
      ) {
        return
      }

      setOpenPick('')
    }

    document.addEventListener('pointerdown', closePick, true)

    return () => {
      document.removeEventListener('pointerdown', closePick, true)
    }
  }, [openPick])

  const players = useMemo(
    () => [...existingPlayers, ...added].filter(player => key(player) && lbl(player)),
    [added, existingPlayers]
  )

  const rosterIds = useMemo(
    () => new Set(players.map(key).filter(Boolean)),
    [players]
  )

  const extPlayers = useMemo(
    () => ext.filter(player => key(player) && lbl(player) && !rosterIds.has(key(player))),
    [ext, rosterIds]
  )

  const allPlayers = useMemo(
    () => [...players, ...extPlayers],
    [extPlayers, players]
  )

  const teams = useMemo(
    () => teamOptions
      .filter(team => team?.teamSeasonKey && team.teamSeasonKey !== teamContext.teamSeasonKey),
    [teamContext.teamSeasonKey, teamOptions]
  )

  const rows = useMemo(
    () => preview.rows.map(row => {
      const player = allPlayers.find(item => key(item) === pick[row.rowId])
      const fixed = fix(row, player, rosterIds, act[row.rowId])
      const fixedPlayer = allPlayers.find(item => (
        key(item) === fixed.playerSeasonId ||
        key(item) === fixed.playerId ||
        key(item) === pick[row.rowId]
      ))

      return {
        ...fixed,
        scoutPreview: buildScoutPreview(fixed, fixedPlayer, fixed.teamContext || teamContext),
      }
    }),
    [act, allPlayers, pick, preview.rows, rosterIds, teamContext]
  )

  const sum = useMemo(() => ({
    total: rows.length,
    valid: rows.filter(row => row.valid && !row.skip).length,
    error: rows.filter(row => !row.valid).length,
    matchedPlayers: rows.filter(row => row.playerId).length,
    skipped: rows.filter(row => row.skip).length,
  }), [rows])

  const metaOk = snap !== snapOpt.ROUND || Boolean(String(round).trim())

  const rowPlayers = row => {
    const rowName = row.stats.playerName
    const current = allPlayers.find(player => key(player) === row.playerSeasonId)
    const matches = allPlayers.filter(player => (
      norm(lbl(player)) === norm(rowName) ||
      nkey(lbl(player)) === nkey(rowName)
    ))
    const rowsById = new Map()

    ;[current, ...matches, ...players].forEach(player => {
      if (player && key(player)) rowsById.set(key(player), player)
    })

    return Array.from(rowsById.values())
  }

  const pickedPlayer = row =>
    allPlayers.find(item => key(item) === (pick[row.rowId] || row.pendingPlayerId))

  const planAdd = (row, reason, team = teamContext) => {
    const player = pickedPlayer(row) || playerFromRow(row, teamContext)
    if (!player || rosterIds.has(key(player))) return

    setOpenPick('')
    const season = plannedSeason(player, team, reason)

    setAdded(prev => [...prev.filter(item => key(item) !== season.id), season])
    setPick(prev => ({
      ...prev,
      [row.rowId]: season.id,
    }))
    setAddedRows(prev => ({
      ...prev,
      [row.rowId]: season,
    }))
    setAddedPlans(prev => ({
      ...prev,
      [row.rowId]: {
        player,
        team,
        reason,
      },
    }))
    setAct(prev => ({
      ...prev,
      [row.rowId]: actOpt.ADD,
    }))
    setActionMode(prev => ({
      ...prev,
      [row.rowId]: '',
    }))
  }

  const save = async () => {
    if (!rows.length || sum.error > 0 || sum.valid === 0 || !metaOk) return

    setSaving(true)

    try {
      const plans = Object.values(addedPlans)

      for (const plan of plans) {
        await addPlayerToTeam(plan.player, plan.team, {
          rosterStatus: 'active',
          reason: plan.reason,
          isPlayingUp: plan.reason === addOpt.PLAYING_UP,
        })
      }

      await savePlayerStatsRows(rows, teamContext, {
        snapshotType: snap,
        roundNumber: round,
      })
      onSaved?.()
      close()
    } finally {
      setSaving(false)
    }
  }

  const skipRow = rowId => {
    setOpenPick('')
    setAct(prev => ({
      ...prev,
      [rowId]: actOpt.SKIP,
    }))
    setActionMode(prev => ({
      ...prev,
      [rowId]: '',
    }))
  }

  const startAdd = rowId => {
    setActionMode(prev => ({
      ...prev,
      [rowId]: 'add',
    }))
    setAddReason(prev => ({
      ...prev,
      [rowId]: prev[rowId] || addOpt.PLAYING_UP,
    }))
  }

  const startSkip = rowId => {
    setActionMode(prev => ({
      ...prev,
      [rowId]: 'skip',
    }))
    setSkipReason(prev => ({
      ...prev,
      [rowId]: prev[rowId] || skipOpt.IRRELEVANT,
    }))
  }

  const cancelAction = rowId => {
    setActionMode(prev => ({
      ...prev,
      [rowId]: '',
    }))
  }

  const confirmAdd = row => {
    planAdd(row, addReason[row.rowId] || addOpt.PLAYING_UP)
  }

  const confirmSkip = row => {
    const reason = skipReason[row.rowId] || skipOpt.IRRELEVANT
    const team = teams.find(item => item.teamSeasonKey === targetTeam[row.rowId])

    if (reason === skipOpt.TRANSFER_OUT && team) {
      planAdd(row, skipOpt.TRANSFER_OUT, team)
      return
    }

    skipRow(row.rowId)
  }

  const undoSkip = rowId => {
    setAct(prev => ({
      ...prev,
      [rowId]: '',
    }))
  }

  const undoAdd = row => {
    const season = addedRows[row.rowId]
    if (!season) return

    setAdded(prev => prev.filter(item => key(item) !== key(season)))
    setAddedRows(prev => {
      const next = { ...prev }
      delete next[row.rowId]
      return next
    })
    setAddedPlans(prev => {
      const next = { ...prev }
      delete next[row.rowId]
      return next
    })
    setPick(prev => {
      const next = { ...prev }
      delete next[row.rowId]
      return next
    })
    setAct(prev => {
      const next = { ...prev }
      delete next[row.rowId]
      return next
    })
  }

  const clearContent = () => {
    setPasteText('')
    setPick({})
    setAct({})
    setExt([])
    setAdded([])
    setAddedRows({})
    setAddedPlans({})
    setAdding({})
    setUndoing({})
    setActionMode({})
    setAddReason({})
    setSkipReason({})
    setTargetTeam({})
    setSaving(false)
    setSnap(snapOpt.ROUND)
    setRound('')
    setOpenPick('')
  }

  const close = () => {
    clearContent()
    onClose?.()
  }

  return (
    <Modal open={open} onClose={close}>
      <ModalDialog sx={sx.dialog}>
        <ModalClose />

        <Typography level="title-lg" sx={sx.title}>
          טעינת סטטיסטיקה
        </Typography>

        <Typography level="body-sm" sx={sx.meta}>
          הדבק כאן טבלת סטטיסטיקה לקבוצה {teamContext.clubName || teamContext.teamName || ''}
        </Typography>

        <Box sx={sx.snapRow}>
          <Select
            size="sm"
            value={snap}
            sx={sx.snapSelect}
            onChange={(event, value) => {
              event?.stopPropagation?.()
              setSnap(value || snapOpt.ROUND)
            }}
          >
            <Option value={snapOpt.ROUND}>מחזור</Option>
            <Option value={snapOpt.CURRENT}>מצב נוכחי</Option>
            <Option value={snapOpt.FINAL}>סוף עונה</Option>
          </Select>

          <Input
            size="sm"
            type="number"
            value={round}
            disabled={snap !== snapOpt.ROUND}
            placeholder="מספר מחזור"
            sx={sx.roundInput}
            slotProps={{
              input: {
                min: 1,
              },
            }}
            onChange={event => setRound(event.target.value)}
          />

          {snap === snapOpt.ROUND && !metaOk ? (
            <Typography level="body-xs" color="danger">
              חובה להזין מספר מחזור
            </Typography>
          ) : null}
        </Box>

        <Sheet variant="outlined" sx={sx.pasteZone}>
          <Box
            component="textarea"
            className="dpScrollThin"
            value={pasteText}
            onChange={event => setPasteText(event.target.value)}
            placeholder={ph}
            sx={sx.pasteBox}
          />
        </Sheet>

        <Sheet variant="outlined" sx={sx.previewZone}>
          <Box sx={sx.summaryChips}>
            <Chip size="sm" variant="soft">
              {formatLtrNumber(sum.total)} שורות
            </Chip>

            <Chip size="sm" color="success" variant="soft">
              {formatLtrNumber(sum.valid)} תקינות
            </Chip>

            <Chip size="sm" color="danger" variant="soft">
              {formatLtrNumber(sum.error)} שגיאות
            </Chip>

            <Chip size="sm" color="primary" variant="soft">
              {formatLtrNumber(sum.matchedPlayers)} שחקנים זוהו
            </Chip>

            <Chip size="sm" color="neutral" variant="soft">
              {formatLtrNumber(sum.skipped)} נמחקו מהטעינה
            </Chip>
          </Box>

          <Sheet variant="outlined" className="dpScrollThin" sx={sx.tableWrap}>
            <Table size="sm" stickyHeader sx={sx.table}>
              <thead>
                <tr>
                  <th>סטטוס</th>
                  <th>שם שחקן</th>
                  <th>שחקן במערכת</th>
                  <th>פעולה</th>
                  <th>פרופיל סקאוט</th>
                  <th>ודאות</th>
                  <th>חישוב</th>
                  <th>משחקים</th>
                  <th>שערים</th>
                  <th>צהובים</th>
                  <th>אדומים</th>
                  <th>הרכב</th>
                  <th>נכנס</th>
                  <th>הוחלף</th>
                  <th>דקות</th>
                </tr>
              </thead>

              <tbody>
                {!rows.length ? (
                  <tr>
                    <td colSpan={15}>אין עדיין שורות להצגה</td>
                  </tr>
                ) : rows.map(row => (
                  <tr key={row.rowId}>
                    <td className={row.valid ? '' : 'isError'}>
                      {issueText(row)}
                    </td>
                    <td>{row.stats.playerName || '-'}</td>
                    <td>
                      {addedRows[row.rowId] ? (
                        <Chip size="sm" color="success" variant="soft" sx={sx.addedPlayerChip}>
                          {lbl(addedRows[row.rowId]) || row.stats.playerName || '-'}
                        </Chip>
                      ) : (
                        <Box data-player-pick-root>
                          <Select
                            size="sm"
                            variant="outlined"
                            value={pick[row.rowId] || row.playerSeasonId || ''}
                            placeholder="בחר שחקן"
                            listboxOpen={openPick === row.rowId}
                            sx={sx.playerSelect}
                            onListboxOpenChange={isOpen => {
                              setOpenPick(isOpen ? row.rowId : '')
                            }}
                            onChange={(event, value) => {
                              setPick(prev => ({
                                ...prev,
                                [row.rowId]: value || '',
                              }))
                              setOpenPick('')
                            }}
                          >
                            {rowPlayers(row).map(player => (
                              <Option key={key(player)} value={key(player)}>
                                {lbl(player)}
                              </Option>
                            ))}
                          </Select>
                        </Box>
                      )}

                    </td>
                    <td>
                      {row.skip ? (
                        <Box sx={sx.rowActions}>
                        <Chip size="sm" color="neutral" variant="soft">
                          הוסר
                        </Chip>

                          <Button
                            size="sm"
                            color="neutral"
                            variant="plain"
                            sx={sx.undoBtn}
                            onClick={event => {
                              event.stopPropagation()
                              undoSkip(row.rowId)
                            }}
                          >
                            בטל
                          </Button>
                        </Box>
                      ) : addedRows[row.rowId] ? (
                        <Box sx={sx.rowActions}>
                          <Chip size="sm" color="success" variant="soft">
                            נוסף לסגל
                          </Chip>

                          <Button
                            size="sm"
                            color="neutral"
                            variant="plain"
                            loading={Boolean(undoing[row.rowId])}
                            sx={sx.undoBtn}
                            onClick={event => {
                              event.stopPropagation()
                              undoAdd(row)
                            }}
                          >
                            בטל
                          </Button>
                        </Box>
                      ) : row.valid ? '-' : (
                        <Box sx={sx.rowActions}>
                          {actionMode[row.rowId] === 'add' ? (
                            <>
                              <Select
                                size="sm"
                                value={addReason[row.rowId] || addOpt.PLAYING_UP}
                                sx={sx.reasonSelect}
                                onChange={(event, value) => {
                                  event?.stopPropagation?.()
                                  setAddReason(prev => ({
                                    ...prev,
                                    [row.rowId]: value || addOpt.PLAYING_UP,
                                  }))
                                }}
                              >
                                <Option value={addOpt.PLAYING_UP}>שנתון מתחת</Option>
                                <Option value={addOpt.TRANSFER_IN}>הגיע ממועדון אחר</Option>
                                <Option value={addOpt.MISSING_ROSTER}>חסר בסגל</Option>
                              </Select>

                              <Button
                                size="sm"
                                color="success"
                                variant="soft"
                                sx={sx.actBtn}
                                onClick={event => {
                                  event.stopPropagation()
                                  confirmAdd(row)
                                }}
                              >
                                אשר
                              </Button>

                              <Button
                                size="sm"
                                color="neutral"
                                variant="plain"
                                sx={sx.undoBtn}
                                onClick={event => {
                                  event.stopPropagation()
                                  cancelAction(row.rowId)
                                }}
                              >
                                בטל
                              </Button>
                            </>
                          ) : null}

                          {actionMode[row.rowId] === 'skip' ? (
                            <>
                              <Select
                                size="sm"
                                value={skipReason[row.rowId] || skipOpt.IRRELEVANT}
                                sx={sx.reasonSelect}
                                onChange={(event, value) => {
                                  event?.stopPropagation?.()
                                  setSkipReason(prev => ({
                                    ...prev,
                                    [row.rowId]: value || skipOpt.IRRELEVANT,
                                  }))
                                }}
                              >
                                <Option value={skipOpt.IRRELEVANT}>פרש / לא רלוונטי</Option>
                                <Option value={skipOpt.BAD_ROW}>שורה שגויה</Option>
                                <Option value={skipOpt.TRANSFER_OUT}>עבר לקבוצה אחרת</Option>
                              </Select>

                              {skipReason[row.rowId] === skipOpt.TRANSFER_OUT ? (
                                <Select
                                  size="sm"
                                  value={targetTeam[row.rowId] || ''}
                                  placeholder="קבוצה חדשה"
                                  sx={sx.teamSelect}
                                  onChange={(event, value) => {
                                    event?.stopPropagation?.()
                                    setTargetTeam(prev => ({
                                      ...prev,
                                      [row.rowId]: value || '',
                                    }))
                                  }}
                                >
                                  {teams.map(team => (
                                    <Option key={team.teamSeasonKey} value={team.teamSeasonKey}>
                                      {team.clubName || team.teamName || team.teamSeasonKey}
                                    </Option>
                                  ))}
                                </Select>
                              ) : null}

                              <Button
                                size="sm"
                                color="success"
                                variant="soft"
                                sx={sx.actBtn}
                                onClick={event => {
                                  event.stopPropagation()
                                  confirmSkip(row)
                                }}
                              >
                                אשר
                              </Button>

                              <Button
                                size="sm"
                                color="neutral"
                                variant="plain"
                                sx={sx.undoBtn}
                                onClick={event => {
                                  event.stopPropagation()
                                  cancelAction(row.rowId)
                                }}
                              >
                                בטל
                              </Button>
                            </>
                          ) : null}

                          {!actionMode[row.rowId] ? (
                            <>
                          <Button
                            size="sm"
                            color="primary"
                            variant="soft"
                            disabled={false}
                            loading={Boolean(adding[row.rowId])}
                            sx={sx.actBtn}
                            onClick={event => {
                              event.stopPropagation()
                              startAdd(row.rowId)
                            }}
                          >
                            הוסף לסגל
                          </Button>

                          <Button
                            size="sm"
                            color="danger"
                            variant="soft"
                            sx={sx.actBtn}
                            onClick={event => {
                              event.stopPropagation()
                              startSkip(row.rowId)
                            }}
                          >
                            הסר מהרשימה
                          </Button>
                            </>
                          ) : null}
                        </Box>
                      )}
                    </td>
                    <td>
                      {row.scoutPreview?.best ? (
                        <Tooltip
                          arrow
                          variant="outlined"
                          title={row.scoutPreview.allProfilesText || row.scoutPreview.profileText}
                        >
                          <Chip
                            size="sm"
                            color="primary"
                            variant="soft"
                            sx={sx.scoutChip}
                          >
                            {row.scoutPreview.profileText}
                          </Chip>
                        </Tooltip>
                      ) : (
                        row.scoutPreview?.profileText || '-'
                      )}
                    </td>
                    <td>
                      {row.scoutPreview?.best ? (
                        <Tooltip
                          arrow
                          variant="outlined"
                          title={(row.scoutPreview.best.warnings || []).join(' | ') || 'ללא אזהרות'}
                        >
                          <Chip
                            size="sm"
                            color={reliabilityColor(row.scoutPreview.best.reliability?.level)}
                            variant="soft"
                            sx={sx.reliabilityChip}
                          >
                            {row.scoutPreview.reliabilityText}
                          </Chip>
                        </Tooltip>
                      ) : (
                        row.scoutPreview?.reliabilityText || '-'
                      )}
                    </td>
                    <td>
                      <Tooltip
                        arrow
                        variant="outlined"
                        title={row.scoutPreview?.metricsText || '-'}
                      >
                        <Box component="span" sx={sx.metricsCell}>
                          {row.scoutPreview?.metricsText || '-'}
                        </Box>
                      </Tooltip>
                    </td>
                    <td className="isLtr">{formatLtrNumber(row.stats.games)}</td>
                    <td className="isLtr">{formatLtrNumber(row.stats.goals, { signed: true })}</td>
                    <td className="isLtr">{formatLtrNumber(row.stats.yellowLeagueCup)}</td>
                    <td className="isLtr">{formatLtrNumber(row.stats.redCards)}</td>
                    <td className="isLtr">{formatLtrNumber(row.stats.starts)}</td>
                    <td className="isLtr">{formatLtrNumber(row.stats.subIn)}</td>
                    <td className="isLtr">{formatLtrNumber(row.stats.subOut)}</td>
                    <td className="isLtr">{formatLtrNumber(row.stats.minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Sheet>
        </Sheet>

        <Box sx={sx.actions}>
          <Button
            size="sm"
            color="success"
            disabled={!rows.length || sum.error > 0 || sum.valid === 0 || !metaOk || saving}
            loading={saving}
            onClick={save}
          >
            שמור סטטיסטיקה
          </Button>

          <Button size="sm" color="neutral" variant="plain" onClick={close}>
            סגור
          </Button>

          <Box sx={sx.spacer} />

          <Button
            size="sm"
            color="neutral"
            variant="soft"
            disabled={!pasteText}
            onClick={clearContent}
          >
            נקה תוכן
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
