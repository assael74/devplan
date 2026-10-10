// src/features/playersDatabase/ui/components/sync/SyncStageCards.js

import { Box, Card, Chip, Stack, Typography } from '@mui/joy'

import { syncStageCardsSx as sx } from './syncStageCards.sx.js'

const stageState = (state, index) => {
  if (state === 'completed') return { color: 'success', label: 'הושלם', marker: '✓' }
  if (state === 'failed') return { color: 'danger', label: 'נעצר', marker: `${index + 1}` }
  if (state === 'running') return { color: 'primary', label: 'בביצוע', marker: `${index + 1}` }

  return { color: 'neutral', label: 'ממתין', marker: `${index + 1}` }
}

function SyncStageCards({ stages, compact = false }) {
  const safeStages = Array.isArray(stages) ? stages : []

  return (
    <Box sx={sx.root}>
      {safeStages.map((stage, index) => {
        const presentation = stageState(stage.state, index)

        return (
          <Card
            key={stage.id || `${stage.title}-${index}`}
            variant='outlined'
            sx={[
              sx.card,
              compact ? sx.cardCompact : null,
              stage.state === 'running' ? sx.cardActive : null,
            ]}
          >
            <Stack spacing={compact ? 0.5 : 1} sx={sx.content}>
              <Box sx={sx.header}>
                <Stack direction='row' spacing={0.75} alignItems='center'>
                  <Box sx={[
                    sx.marker,
                    compact ? sx.markerCompact : null,
                    stage.state === 'completed' ? sx.markerCompleted : null,
                  ]}>
                    {presentation.marker}
                  </Box>
                  <Typography level='title-sm'>{stage.title}</Typography>
                </Stack>
                <Chip size='sm' variant='soft' color={presentation.color}>
                  {presentation.label}
                </Chip>
              </Box>
              <Typography level='body-xs'>{stage.target}</Typography>
            </Stack>
          </Card>
        )
      })}
    </Box>
  )
}

export default SyncStageCards
