// teamProfile/mobile/modules/trainings/TeamTrainingsModule.js

import React from 'react'
import { Box } from '@mui/joy'

import SectionPanelMobile from '../../../../sharedProfile/mobile/SectionPanelMobile.js'

import TrainingWeekDrawer from '../../../../../../ui/patterns/schedule/components/drawer/TrainingWeekDrawer.js'
import EditDayTrainingDrawer from '../../../../../../ui/patterns/schedule/components/editDrawer/EditDayTrainingDrawer.js'

import TrainingsToolbar from './components/TrainingsToolbar.js'
import TrainingsWeekToolbar from './components/TrainingsWeekToolbar.js'
import TrainingsRows from './components/TrainingsRows.js'

import { useTeamTrainingsModuleModel } from '../../../sharedModules/trainings'

import { profileSx as sx } from './../../sx/profile.sx'

export default function TeamTrainingsModule({ entity, context }) {
  const {
    liveTeam,
    teamId,

    model,
    stats,

    createOpen,
    editingDay,

    handleCreateWeek,
    handleCloseCreate,
    handleEditRow,
    handleCloseEdit,
  } = useTeamTrainingsModuleModel({
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
        team={liveTeam}
        onClose={handleCloseCreate}
        onSaved={handleCloseCreate}
        teamId={teamId}
        context={context}
      />

      <EditDayTrainingDrawer
        open={!!editingDay}
        team={liveTeam}
        week={editingDay}
        onClose={handleCloseEdit}
        onSaved={handleCloseEdit}
        context={context}
      />
    </SectionPanelMobile>
  )
}
