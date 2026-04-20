// playerProfile/mobile/modules/trainings/PlayerTrainingsModule.js

import React, { useMemo, useState, useCallback } from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import {
  resolvePlayerTrainingsDomain,
  buildTrainingsModel,
  buildTrainingsHeaderStats,
} from './../../../sharedLogic'

import TrainingWeekDrawer from '../../../../../../ui/patterns/schedule/components/drawer/TrainingWeekDrawer.js'
import EditDayTrainingDrawer from '../../../../../../ui/patterns/schedule/components/editDrawer/EditDayTrainingDrawer.js'

import TrainingsToolbar from './components/TrainingsToolbar.js'
import TrainingsWeekToolbar from './components/TrainingsWeekToolbar.js'
import TrainingsRows from './components/TrainingsRows.js'

import { profileSx as sx } from './../../sx/profile.sx'

export default function PlayerTrainingsModule({ entity, context }) {
  const player = entity || null

  const { summary, state, trainingWeeks } = useMemo(
    () =>
      resolvePlayerTrainingsDomain(player, {}, {
        trainingWeeks: context?.trainingWeeks,
        playerTrainingWeeksById: context?.playerTrainingWeeksById,
      }),
    [player, context]
  )

  const [createOpen, setCreateOpen] = useState(false)
  const [editingDay, setEditingDay] = useState(null)

  const model = useMemo(() => {
    return buildTrainingsModel({
      entity: player,
      trainingWeeks,
    })
  }, [player, trainingWeeks])

  const stats = useMemo(() => buildTrainingsHeaderStats(model), [model])

  const teamId = String(player?.teamId || player?.team?.id || '').trim()

  const handleCreateWeek = useCallback(() => {
    if (!teamId) return
    setCreateOpen(true)
  }, [teamId])

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false)
  }, [])

  const handleEditRow = useCallback((row) => {
    if (!row?.weekId || !row?.dayKey) return
    setEditingDay(row)
  }, [])

  const handleCloseEdit = useCallback(() => {
    setEditingDay(null)
  }, [])

  return (
    <SectionPanelMobile>
      <Box sx={sx.moduleRoot}>
        <TrainingsToolbar
          title="אימונים"
          stats={stats}
          showCreate={Boolean(teamId)}
          onCreate={handleCreateWeek}
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 1, minWidth: 0 }}>
        <Box sx={{ display: 'grid', gap: 0.75, minWidth: 0 }}>
          <TrainingsWeekToolbar
            title="השבוע"
            subtitle={model?.currentWeekRangeLabel || model?.currentWeekId || ''}
            count={model?.summary?.currentWeekCount || 0}
          />

          <TrainingsRows
            rows={model?.currentWeek?.rows || []}
            mode="profile"
            onRowClick={handleEditRow}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 0.75, minWidth: 0 }}>
          <TrainingsWeekToolbar
            title="שבוע הבא"
            subtitle={model?.nextWeekRangeLabel || model?.nextWeekId || ''}
            count={model?.summary?.nextWeekCount || 0}
          />

          <TrainingsRows
            rows={model?.nextWeek?.rows || []}
            mode="profile"
            onRowClick={handleEditRow}
          />
        </Box>
      </Box>

      <TrainingWeekDrawer
        open={createOpen}
        team={player?.team || null}
        onClose={handleCloseCreate}
        onSaved={handleCloseCreate}
        teamId={teamId}
        context={context}
      />

      <EditDayTrainingDrawer
        open={!!editingDay}
        team={player?.team || null}
        week={editingDay}
        onClose={handleCloseEdit}
        onSaved={handleCloseEdit}
        context={context}
      />
    </SectionPanelMobile>
  )
}
