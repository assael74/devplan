import { useCallback, useMemo, useState } from 'react'

import { buildSquadTargetSimulatorModel } from '../../engine/simulator.model.js'
import {
  DEFAULT_SIMULATOR_STATE,
  FORMATION_OPTIONS,
  SIMULATOR_POSITION_OPTIONS,
} from '../simulatorUi.constants.js'
import {
  createPlayerBankFromTeamPlayers,
  createFormationRows,
  createDraftPlayer,
  createInitialPlayerBank,
  getBenchmarkCountStatus,
} from '../simulatorUi.utils.js'

const MINUTES_DISTRIBUTION_ITEMS = [
  {
    id: 'playersOver2000Minutes',
    label: '+2000',
    minMinutes: 2000,
  },
  {
    id: 'playersOver1500Minutes',
    label: '+1500',
    minMinutes: 1500,
  },
  {
    id: 'playersOver1000Minutes',
    label: '+1000',
    minMinutes: 1000,
  },
]

function getPositionCountStatus({ actualCount, targetCount }) {
  const gap = Math.abs(Number(actualCount || 0) - Number(targetCount || 0))

  if (gap >= 2) return 'danger'
  if (gap === 1) return 'warning'
  return 'success'
}

const MODEL_POSITION_BY_SIMULATOR_POSITION = {
  MC: 'MCR',
}

const resolveModelPositionCode = positionCode => {
  return MODEL_POSITION_BY_SIMULATOR_POSITION[positionCode] || positionCode
}

export function useSquadSimulatorPageModel() {
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [teamName, setTeamName] = useState(DEFAULT_SIMULATOR_STATE.teamName)
  const [targetMode, setTargetMode] = useState(DEFAULT_SIMULATOR_STATE.targetMode)
  const [targetProfile, setTargetProfile] = useState(DEFAULT_SIMULATOR_STATE.targetProfile)
  const [targetPosition, setTargetPosition] = useState(DEFAULT_SIMULATOR_STATE.targetPosition)
  const [leagueNumGames, setLeagueNumGames] = useState(DEFAULT_SIMULATOR_STATE.leagueNumGames)
  const [leagueGameTime, setLeagueGameTime] = useState(DEFAULT_SIMULATOR_STATE.leagueGameTime)
  const [formation, setFormation] = useState(DEFAULT_SIMULATOR_STATE.formation)
  const [playerBank, setPlayerBank] = useState(() => createInitialPlayerBank())
  const [rosterRows, setRosterRows] = useState(() =>
    createFormationRows(DEFAULT_SIMULATOR_STATE.formation)
  )

  const playersForModel = useMemo(() => {
    const playersById = playerBank.reduce((acc, player) => {
      acc[player.id] = player
      return acc
    }, {})

    return rosterRows.map(row => {
      const selectedPlayer = playersById[row.selectedPlayerId] || {}

      const simulatorPosition = row.primaryPosition || selectedPlayer.primaryPosition || ''

      return {
        ...selectedPlayer,
        id: row.id,
        fullName: selectedPlayer.fullName || '',
        squadRole: row.squadRole,
        confidenceLevel: row.confidenceLevel,
        primaryPosition: resolveModelPositionCode(simulatorPosition),
        formationSlot: row.slotId,
        formationSlotLabel: row.slotLabel,
        selectedPlayerId: row.selectedPlayerId,
      }
    })
  }, [playerBank, rosterRows])

  const model = useMemo(() => {
    return buildSquadTargetSimulatorModel({
      team: {
        name: teamName,
        targetPositionMode: targetMode,
        targetPosition: targetMode === 'exact' ? Number(targetPosition) : targetProfile,
        targetPositionProfile: targetMode === 'range' ? targetProfile : '',
        targetProfileId: targetMode === 'range' ? targetProfile : '',
        leagueNumGames: Number(leagueNumGames),
        leagueGameTime: Number(leagueGameTime),
      },
      players: playersForModel,
    })
  }, [leagueGameTime, leagueNumGames, playersForModel, targetMode, targetPosition, targetProfile, teamName])

  const displayRows = useMemo(() => {
    return rosterRows.map((row, index) => ({
      ...row,
      fullName: playersForModel[index]?.fullName || '',
      photo: playersForModel[index]?.photo || '',
      model: model.rows[index] || {},
    }))
  }, [model.rows, playersForModel, rosterRows])

  const goalsKpi = useMemo(() => {
    return {
      allocated: model.totals.playerGoalsTotal,
      target: model.totals.teamGoalsTarget,
      status: model.totals.status,
      coveragePct: model.totals.coveragePct,
      guaranteed: model.totals.guaranteedGoalsTotal,
      guaranteedCoveragePct: model.totals.guaranteedCoveragePct,
      guaranteedStatus: model.totals.guaranteedStatus,
      riskGap: model.totals.riskGoalsGap,
    }
  }, [model.totals])

  const confidenceKpi = useMemo(() => {
    return {
      scorePct: model.totals.confidenceScorePct,
      guaranteedGoals: model.totals.guaranteedGoalsTotal,
      theoreticalGoals: model.totals.playerGoalsTotal,
      riskGoalsGap: model.totals.riskGoalsGap,
      ratedRows: model.totals.confidenceRatedRows,
      targetRows: model.totals.targetRows,
      status:
        model.totals.targetRows && model.totals.confidenceRatedRows < model.totals.targetRows ? 'neutral'
          : model.totals.confidenceScorePct >= 85 ? 'success'
          : model.totals.confidenceScorePct >= 65 ? 'warning'
            : model.totals.playerGoalsTotal ? 'danger' : 'neutral',
    }
  }, [model.totals])

  const minutesKpi = useMemo(() => {
    const allocated = model.rows.reduce((sum, row) => {
      return sum + Number(row.minutesTarget || 0)
    }, 0)
    const target = Number(model.seasonContext?.totalTeamMinutes || 0)
    const coveragePct = target ? Math.round((allocated / target) * 100) : 0

    return {
      allocated,
      target,
      coveragePct,
      status: allocated > target ? 'above' : allocated < target ? 'below' : 'ok',
    }
  }, [model.rows, model.seasonContext])

  const bankKpi = useMemo(() => {
    const namedPlayers = playerBank.filter(player => String(player.fullName || '').trim()).length
    const selectedRows = rosterRows.filter(row => row.selectedPlayerId).length
    const uniqueSelectedPlayers = new Set(
      rosterRows
        .map(row => row.selectedPlayerId)
        .filter(Boolean)
    ).size

    return {
      namedPlayers,
      selectedRows,
      uniqueSelectedPlayers,
      totalRows: rosterRows.length,
    }
  }, [playerBank, rosterRows])

  const positionOptions = useMemo(() => {
    const isBackFive = String(formation || '').startsWith('5-')

    return SIMULATOR_POSITION_OPTIONS.map(option => {
      const isBackFourFullback = option.value === 'DR' || option.value === 'DL'
      const isBackFiveWingback = option.value === 'DMR' || option.value === 'DML'

      return {
        ...option,
        disabled: isBackFive ? isBackFourFullback : isBackFiveWingback,
      }
    })
  }, [formation])

  const minutesDistribution = useMemo(() => {
    const balance = model.teamBenchmark?.squadBalance || {}

    return MINUTES_DISTRIBUTION_ITEMS.map(item => {
      const actualCount = model.rows.filter(row => {
        return Number(row.minutesTarget || 0) >= item.minMinutes
      }).length
      const benchmark = balance[item.id] || null

      return {
        ...item,
        actualCount,
        targetCount: Number(benchmark?.target || 0),
        status: getBenchmarkCountStatus({ actual: actualCount, benchmark }),
      }
    })
  }, [model.rows, model.teamBenchmark])

  const positionDistribution = useMemo(() => {
    const counts = rosterRows.reduce((acc, row) => {
      if (!row.selectedPlayerId || row.rowType !== 'lineup') return acc
      const key = row.slotId || '-'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const selectedFormation = FORMATION_OPTIONS.find(option => option.value === formation)
      || FORMATION_OPTIONS[0]
    const targets = selectedFormation.slots.reduce((acc, slot) => {
      acc[slot.slotId] = (acc[slot.slotId] || 0) + 1
      return acc
    }, {})

    return Object.keys(targets).map(slotId => {
      const actualCount = Number(counts[slotId] || 0)
      const targetCount = targets[slotId] * 2

      return {
        id: slotId,
        actualCount,
        targetCount,
        status: getPositionCountStatus({
          actualCount,
          targetCount,
        }),
      }
    })
  }, [formation, rosterRows])

  const handleRosterRowChange = useCallback((id, patch) => {
    setRosterRows(current => {
      return current.map(row => (row.id === id ? { ...row, ...patch } : row))
    })
  }, [])

  const handleRemoveRosterRow = useCallback(id => {
    setRosterRows(current => current.filter(row => row.id !== id))
  }, [])

  const handleAddRosterRow = useCallback(() => {
    setRosterRows(current => [
      ...current,
      {
        id: `bench-${Date.now()}`,
        rowType: 'bench',
        slotNumber: current.length + 1,
        slotId: 'SUB',
        slotLabel: 'מחליף',
        selectedPlayerId: '',
        fullName: '',
        squadRole: '',
        confidenceLevel: '',
        primaryPosition: '',
      },
    ])
  }, [])

  const handlePlayerBankChange = useCallback((id, patch) => {
    setPlayerBank(current => {
      return current.map(player => (player.id === id ? { ...player, ...patch } : player))
    })
  }, [])

  const handleAddBankPlayer = useCallback(() => {
    setPlayerBank(current => [...current, createDraftPlayer()])
  }, [])

  const handleRemoveBankPlayer = useCallback(id => {
    setPlayerBank(current => current.filter(player => player.id !== id))
    setRosterRows(current => current.map(row => (
      row.selectedPlayerId === id ? { ...row, selectedPlayerId: '' } : row
    )))
  }, [])

  const handleFormationChange = useCallback(nextFormation => {
    setFormation(nextFormation)
    setRosterRows(createFormationRows(nextFormation))
  }, [])

  const handleTeamSelect = useCallback((team = null, allPlayers = []) => {
    const teamId = String(team?.id || team?.teamId || '').trim()
    const nextTeamName = (
      team?.teamName ||
      team?.fullName ||
      team?.name ||
      ''
    ).trim()
    const directPlayers = [
      ...(Array.isArray(team?.players) ? team.players : []),
      ...(Array.isArray(team?.teamPlayers) ? team.teamPlayers : []),
      ...(Array.isArray(team?.squad) ? team.squad : []),
    ]
    const teamPlayers = directPlayers.length
      ? directPlayers
      : (Array.isArray(allPlayers) ? allPlayers : []).filter(player => {
        return String(player?.teamId || player?.team?.id || '').trim() === teamId
      })

    setSelectedTeamId(teamId)
    setTeamName(nextTeamName)
    setPlayerBank(createPlayerBankFromTeamPlayers(teamPlayers))
    setRosterRows(current => current.map(row => ({
      ...row,
      selectedPlayerId: '',
    })))
  }, [])

  const handleReset = useCallback(() => {
    setRosterRows(createFormationRows(formation))
  }, [formation])

  return {
    selectedTeamId,
    teamName,
    targetMode,
    targetProfile,
    targetPosition,
    leagueNumGames,
    leagueGameTime,
    formation,
    playerBank,
    model,
    displayRows,
    goalsKpi,
    confidenceKpi,
    minutesKpi,
    bankKpi,
    minutesDistribution,
    positionDistribution,
    positionOptions,
    setTeamName,
    setTargetMode,
    setTargetProfile,
    setTargetPosition,
    setLeagueNumGames,
    setLeagueGameTime,
    setFormation: handleFormationChange,
    setSelectedTeamId,
    handleTeamSelect,
    handlePlayerBankChange,
    handleAddBankPlayer,
    handleRemoveBankPlayer,
    handlePlayerChange: handleRosterRowChange,
    handleRemovePlayer: handleRemoveRosterRow,
    handleAddPlayer: handleAddRosterRow,
    handleReset,
  }
}
