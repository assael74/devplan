// C:\projects\devplan\src\ui\patterns\schedule\TrainingSchedulePreview.js

import React, { useMemo, useCallback, useState } from 'react'
import { Box, Chip, Sheet, Typography, IconButton, Tooltip } from '@mui/joy'

import ScheduleWeekBlock from './ScheduleWeekBlock.js'
import TrainingWeekDrawer from './components/drawer/TrainingWeekDrawer.js'
import EditDayTrainingDrawer from './components/editDrawer/EditDayTrainingDrawer.js'

import { buildScheduleHeaderStats, buildScheduleModel } from './logic/schedule.logic.js'
import { schedulePreviewSx as sx } from './sx/schedulePreview.sx.js'

import { getEntityColors } from '../../core/theme/Colors.js'
import { iconUi } from '../../core/icons/iconUi.js'

const c = getEntityColors('training')

export default function TrainingSchedulePreview({
  entity = null,
  entityType = 'team',
  trainingWeeks = null,
  selectedWeekId = '',
  mode = 'profile',
  title = 'אימונים',
  showNextWeek = true,
  showCreate = true,
  onDone,
  context,
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingDay, setEditingDay] = useState(null)

  const model = useMemo(
    () => buildScheduleModel({ entity, trainingWeeks, selectedWeekId }),
    [entity, trainingWeeks, selectedWeekId]
  )

  const stats = useMemo(() => buildScheduleHeaderStats(model), [model])

  const teamId = String(entity?.id || entity?.teamId || '').trim()

  const handleCreateWeek = useCallback(() => {
    if (!teamId) return
    setCreateOpen(true)
  }, [teamId])

  const handleCloseDrawer = useCallback(() => {
    setCreateOpen(false)
  }, [])

  const handleCreateDone = useCallback(
    (res) => {
      setCreateOpen(false)
      if (onDone) onDone(res)
    },
    [onDone]
  )

  const handleEditRow = useCallback((row) => {
    if (!row?.weekId || !row?.dayKey) return
    setEditingDay(row)
  }, [])

  const handleCloseEditDay = useCallback(() => {
    setEditingDay(null)
  }, [])

  const handleEditDaySaved = useCallback(
    (res) => {
      setEditingDay(null)
      if (onDone) onDone(res)
    },
    [onDone]
  )

  return (
    <>
      <Box sx={sx.root(mode)}>
        <Sheet variant="plain" sx={sx.header(mode)}>
          <Box sx={sx.headerTitleWrap}>
            <Box sx={sx.headerDot} />

            <Typography
              level={mode === 'modal' ? 'title-sm' : 'title-md'}
              sx={{ fontWeight: 600 }}
            >
              {title}
            </Typography>
          </Box>

          <Box sx={sx.headerRight}>
            <Box sx={sx.headerStats(mode)}>
              {stats.map((item) => (
                <Chip
                  key={item.id}
                  size="sm"
                  variant={item.id === 'current' ? 'solid' : 'soft'}
                  color={item.color}
                  sx={sx.statChip(mode)}
                >
                  {`${item.label}: ${item.value}`}
                </Chip>
              ))}
            </Box>

            {showCreate ? (
              <Tooltip title="הוספת שבוע אימונים">
                <IconButton
                  size="md"
                  variant="outlined"
                  onClick={handleCreateWeek}
                  disabled={!teamId}
                  sx={sx.createBtn}
                >
                  {iconUi({ id: 'addTraining', size: 'lg', sx: { color: '#f3f6f4' } })}
                </IconButton>
              </Tooltip>
            ) : null}
          </Box>
        </Sheet>

        <Box sx={sx.weeksGrid(mode)}>
          <ScheduleWeekBlock
            title="השבוע"
            subtitle={model?.currentWeekRangeLabel || model?.currentWeekId || ''}
            rows={model?.currentWeek?.rows || []}
            count={model?.summary?.currentWeekCount || 0}
            mode={mode}
            onRowClick={handleEditRow}
          />

          {showNextWeek ? (
            <ScheduleWeekBlock
              title="שבוע הבא"
              subtitle={model?.nextWeekRangeLabel || model?.nextWeekId || ''}
              rows={model?.nextWeek?.rows || []}
              count={model?.summary?.nextWeekCount || 0}
              mode={mode}
              onRowClick={handleEditRow}
            />
          ) : null}
        </Box>
      </Box>

      <TrainingWeekDrawer
        open={createOpen}
        team={entity}
        onClose={handleCloseDrawer}
        onSaved={handleCreateDone}
        teamId={teamId}
        context={context}
      />

      <EditDayTrainingDrawer
        open={!!editingDay}
        team={entity}
        week={editingDay}
        onClose={handleCloseEditDay}
        onSaved={handleEditDaySaved}
        context={context}
      />
    </>
  )
}
