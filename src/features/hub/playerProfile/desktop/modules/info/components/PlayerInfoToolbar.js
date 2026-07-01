// features/hub/playerProfile/desktop/modules/info/PlayerInfoToolbar.js

import React, { useMemo } from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { PlayerTargetsPrintButton } from '../../../../sharedUi/info/print/index.js'

import { toolbarSx as sx } from './sx/toolbar.sx.js'

export default function PlayerInfoToolbar({
  activeTab,
  player,
  team,
  draft,
  isDirty,
  canSave,
  pending,
  onReset,
  onSave,
}) {
  const isTargetsTab = activeTab?.id === 'targets'

  const livePlayer = useMemo(() => {
    return {
      ...(player || {}),
      ...(draft || {}),
    }
  }, [player, draft])

  return (
    <Box sx={sx.toolbar(false)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={sx.headerDot} />

        <Typography level='title-sm' sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
          {activeTab?.labelH || ''}
        </Typography>

        <Box sx={{ pl: 2 }}>
          {isDirty ? (
            <Chip size='sm' variant='soft' color='warning'>
              לא נשמר
            </Chip>
          ) : (
            <Chip size='sm' variant='soft' color='success'>
              שמור
            </Chip>
          )}
        </Box>
      </Box>

      <Box sx={sx.toolbarActions}>
        {isTargetsTab ? (
          <PlayerTargetsPrintButton
            player={livePlayer}
            team={team}
            disabled={pending}
          />
        ) : null}

        <Button
          size='sm'
          variant='soft'
          color='neutral'
          disabled={!isDirty || pending}
          onClick={onReset}
          startDecorator={iconUi({ id: 'reset' })}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          איפוס
        </Button>

        <Button
          size='sm'
          variant='solid'
          disabled={!canSave}
          loading={pending}
          onClick={onSave}
          sx={sx.confBtn}
          startDecorator={iconUi({ id: 'save' })}
        >
          שמירה
        </Button>
      </Box>
    </Box>
  )
}
