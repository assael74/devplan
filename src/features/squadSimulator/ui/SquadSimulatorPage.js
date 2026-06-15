// src/features/squadSimulator/ui/SquadSimulatorPage.js

import { useCallback, useEffect, useMemo } from 'react'
import { Box, CircularProgress, Sheet, Typography } from '@mui/joy'

import { useAuth } from '../../../app/AuthProvider.js'
import {
  canAccessSquadSimulator,
  getSquadSimulatorTeamIds,
  isAdminAuthUser,
} from '../../../shared/access/index.js'
import { useCoreData } from '../../coreData/CoreDataProvider.js'

import { squadSimulatorSx as sx } from './components/sx/squadSimulator.sx.js'
import { GoalTiersPanel, RosterPanel, SimulatorHeader, SimulatorToolbar } from './components/index.js'
import { useSquadSimulatorPageModel } from './hooks/useSquadSimulatorPageModel.js'
import { SquadSimulatorPrintReport } from './print/index.js'

export default function SquadSimulatorPage() {
  const vm = useSquadSimulatorPageModel()
  const { user } = useAuth()

  const {
    teams = [],
    players = [],
    roles = [],
    primaryLoading,
  } = useCoreData()

  const isAdmin = isAdminAuthUser(user, roles)
  const canUseSimulator = canAccessSquadSimulator(user, roles)

  const allowedTeamIds = useMemo(() => (
    getSquadSimulatorTeamIds(user, roles)
  ), [roles, user])

  const allowedTeamIdSet = useMemo(() => (
    new Set(allowedTeamIds.map(String))
  ), [allowedTeamIds])

  const visibleTeams = useMemo(() => {
    if (isAdmin) return teams

    return teams.filter(team => {
      return allowedTeamIdSet.has(String(team?.id || team?.teamId || ''))
    })
  }, [allowedTeamIdSet, isAdmin, teams])

  const visiblePlayers = useMemo(() => {
    if (isAdmin) return players

    return players.filter(player => {
      return allowedTeamIdSet.has(String(player?.teamId || player?.team?.id || ''))
    })
  }, [allowedTeamIdSet, isAdmin, players])

  const applyTeamSelect = vm.handleTeamSelect
  const selectedTeamId = vm.selectedTeamId

  const handleTeamSelect = useCallback((teamId) => {
    const safeTeamId = String(teamId || '')

    if (!isAdmin && !allowedTeamIdSet.has(safeTeamId)) return

    const nextTeam = visibleTeams.find(team => {
      return String(team?.id || team?.teamId || '') === safeTeamId
    }) || null

    applyTeamSelect(nextTeam, visiblePlayers)
  }, [allowedTeamIdSet, applyTeamSelect, isAdmin, visiblePlayers, visibleTeams])

  useEffect(() => {
    if (isAdmin) return
    if (!canUseSimulator) return
    if (selectedTeamId && !allowedTeamIdSet.has(String(selectedTeamId))) {
      applyTeamSelect(null, [])
      return
    }
    if (selectedTeamId) return
    if (visibleTeams.length !== 1) return

    applyTeamSelect(visibleTeams[0], visiblePlayers)
  }, [
    allowedTeamIdSet,
    applyTeamSelect,
    canUseSimulator,
    isAdmin,
    selectedTeamId,
    visiblePlayers,
    visibleTeams,
  ])

  if (primaryLoading) {
    return (
      <Sheet sx={sx.page}>
        <Box
          sx={{
            ...sx.shell,
            minHeight: 320,
            alignContent: 'center',
            justifyItems: 'center',
            textAlign: 'center',
            gap: 1,
          }}
        >
          <CircularProgress size="lg" />
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            Loading squad data...
          </Typography>
        </Box>
      </Sheet>
    )
  }

  if (!isAdmin && (!canUseSimulator || visibleTeams.length === 0)) {
    return (
      <Sheet sx={sx.page}>
        <Box
          sx={{
            ...sx.shell,
            minHeight: 320,
            alignContent: 'center',
            justifyItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography level="h3">אין הרשאה לסימולטור</Typography>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            לא שויכה לך קבוצה או שלא הופעלה עבורך הרשאת סימולטור בניית סגל.
          </Typography>
        </Box>
      </Sheet>
    )
  }

  return (
    <Sheet sx={sx.page}>
      <Box sx={sx.shell}>
        <SimulatorHeader
          onAddPlayer={vm.handleAddPlayer}
          onReset={vm.handleReset}
          renderPrintContent={() => (
            <SquadSimulatorPrintReport
              teamName={vm.teamName}
              targetMode={vm.targetMode}
              targetProfile={vm.targetProfile}
              targetPosition={vm.targetPosition}
              leagueNumGames={vm.leagueNumGames}
              leagueGameTime={vm.leagueGameTime}
              formation={vm.formation}
              model={vm.model}
              rows={vm.displayRows}
              goalsKpi={vm.goalsKpi}
              confidenceKpi={vm.confidenceKpi}
              minutesKpi={vm.minutesKpi}
              bankKpi={vm.bankKpi}
              positionDistribution={vm.positionDistribution}
              minutesDistribution={vm.minutesDistribution}
            />
          )}
        />

        <SimulatorToolbar
          selectedTeamId={vm.selectedTeamId}
          teams={visibleTeams}
          targetMode={vm.targetMode}
          targetProfile={vm.targetProfile}
          targetPosition={vm.targetPosition}
          leagueNumGames={vm.leagueNumGames}
          leagueGameTime={vm.leagueGameTime}
          formation={vm.formation}
          targetContext={vm.model.targetContext}
          onTeamSelect={handleTeamSelect}
          onTargetModeChange={vm.setTargetMode}
          onTargetProfileChange={vm.setTargetProfile}
          onTargetPositionChange={vm.setTargetPosition}
          onLeagueNumGamesChange={vm.setLeagueNumGames}
          onLeagueGameTimeChange={vm.setLeagueGameTime}
          onFormationChange={vm.setFormation}
        />

        <Box sx={sx.layout}>
          <GoalTiersPanel
            playerBank={vm.playerBank}
            totals={vm.model.totals}
            goalTiers={vm.model.summaries.goalTiers}
            minutesDistribution={vm.minutesDistribution}
            onPlayerBankChange={vm.handlePlayerBankChange}
            onAddBankPlayer={vm.handleAddBankPlayer}
            onRemoveBankPlayer={vm.handleRemoveBankPlayer}
          />

          <RosterPanel
            rows={vm.displayRows}
            playerBank={vm.playerBank}
            goalsKpi={vm.goalsKpi}
            confidenceKpi={vm.confidenceKpi}
            minutesKpi={vm.minutesKpi}
            bankKpi={vm.bankKpi}
            positionDistribution={vm.positionDistribution}
            positionOptions={vm.positionOptions}
            onPlayerChange={vm.handlePlayerChange}
            onRemovePlayer={vm.handleRemovePlayer}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
