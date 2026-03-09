// C:\projects\devplan\src\ui\patterns\schedule\TrainingSchedulePreview.js
import React, { useMemo, useCallback, useState } from 'react'
import { Box, Chip, Sheet, Typography, IconButton, Tooltip } from '@mui/joy'

import ScheduleWeekBlock from './ScheduleWeekBlock.js'
import TrainingWeekDrawer from './TrainingWeekDrawer.js'
import { buildScheduleHeaderStats, buildScheduleModel } from './schedule.logic.js'
import { schedulePreviewSx as sx } from './sx/schedulePreview.sx.js'
import { getEntityColors } from '../../core/theme/Colors.js'
import { iconUi } from '../../core/icons/iconUi.js'

const c = getEntityColors('training')

export default function TrainingSchedulePreview({
  entity = null,
  trainingWeeks = null,
  selectedWeekId = '',
  mode = 'profile',
  title = 'אימונים',
  showHeader = true,
  showStats = true,
  showNextWeek = true,
  showCreate = true,
  drawerWidth = 620,
  drawerAnchor = 'right',
  onDone,
  context,
}) {
  const [createOpen, setCreateOpen] = useState(false)

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

  return (
    <>
      <Box sx={sx.root(mode)}>
        {showHeader ? (
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
              {showStats ? (
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
              ) : null}

              {showCreate ? (
                <Tooltip title="הוספת שבוע אימונים">
                  <IconButton
                    size="sm"
                    variant="solid"
                    onClick={handleCreateWeek}
                    disabled={!teamId}
                    sx={sx.createBtn(c)}
                  >
                    {iconUi({ id: 'add' })}
                  </IconButton>
                </Tooltip>
              ) : null}
            </Box>
          </Sheet>
        ) : null}

        <Box sx={sx.weeksGrid(mode)}>
          <ScheduleWeekBlock
            title="השבוע"
            rows={model?.currentWeek?.rows || []}
            count={model?.summary?.currentWeekCount || 0}
            mode={mode}
          />

          {showNextWeek ? (
            <ScheduleWeekBlock
              title="שבוע הבא"
              rows={model?.nextWeek?.rows || []}
              count={model?.summary?.nextWeekCount || 0}
              mode={mode}
            />
          ) : null}
        </Box>
      </Box>

      <TrainingWeekDrawer
        open={createOpen}
        onClose={handleCloseDrawer}
        onDone={handleCreateDone}
        teamId={teamId}
        width={drawerWidth}
        anchor={drawerAnchor}
        context={context}
      />
    </>
  )
}
