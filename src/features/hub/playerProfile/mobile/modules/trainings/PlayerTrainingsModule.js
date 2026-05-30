// playerProfile/mobile/modules/trainings/PlayerTrainingsModule.js

import React from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import TrainingWeekDrawer from '../../../../../../ui/patterns/schedule/components/drawer/TrainingWeekDrawer.js'
import EditDayTrainingDrawer from '../../../../../../ui/patterns/schedule/components/editDrawer/EditDayTrainingDrawer.js'

import TrainingsToolbar from './components/TrainingsToolbar.js'
import TrainingsWeekToolbar from './components/TrainingsWeekToolbar.js'
import TrainingsRows from './components/TrainingsRows.js'

import { usePlayerTrainingsModuleModel } from '../../../sharedModules/trainings'

import { profileSx as sx } from './../../sx/profile.sx'

export default function PlayerTrainingsModule({ entity, context }) {
  const {
    player,
    teamId,

    model,
    stats,

    createOpen,
    editingDay,

    handleCreateWeek,
    handleCloseCreate,
    handleEditRow,
    handleCloseEdit,
  } = usePlayerTrainingsModuleModel({
    entity,
    context,
    buildMobileModel: true,
  })

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
