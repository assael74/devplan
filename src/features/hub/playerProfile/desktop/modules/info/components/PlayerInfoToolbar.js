// features/hub/playerProfile/desktop/modules/info/PlayerInfoToolbar.js

import React, { useMemo } from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { PlayerTargetsReportButton } from '../../../../../../reports/publicApi.js'

import { toolbarSx as sx } from './sx/toolbar.sx.js'

const TEXT = {
  fallbackTitle: '\u05de\u05d9\u05d3\u05e2 \u05d0\u05d9\u05e9\u05d9 \u05d5\u05db\u05dc\u05dc\u05d9 \u05e9\u05dc \u05d4\u05e9\u05d7\u05e7\u05df',
  detailsSubtitle: '\u05e4\u05e8\u05d8\u05d9\u05dd, \u05e7\u05e9\u05e8, \u05e9\u05d9\u05d5\u05da \u05d5\u05de\u05e6\u05d1 \u05de\u05e7\u05e6\u05d5\u05e2\u05d9',
  positionSubtitle: '\u05e2\u05de\u05d3\u05d5\u05ea, \u05e9\u05db\u05d1\u05ea \u05d9\u05e2\u05d3 \u05d5\u05ea\u05e4\u05e7\u05d9\u05d3 \u05d1\u05e1\u05d2\u05dc',
  targetsSubtitle: '\u05d9\u05e2\u05d3\u05d9\u05dd \u05d0\u05d9\u05e9\u05d9\u05d9\u05dd \u05dc\u05e4\u05d9 \u05e2\u05de\u05d3\u05d4 \u05d5\u05d9\u05e2\u05d3 \u05e7\u05d1\u05d5\u05e6\u05d4',
  saved: '\u05e9\u05de\u05d5\u05e8',
  unsaved: '\u05e9\u05d9\u05e0\u05d5\u05d9\u05d9\u05dd \u05dc\u05d0 \u05e0\u05e9\u05de\u05e8\u05d5',
  reset: '\u05d1\u05d9\u05d8\u05d5\u05dc',
  save: '\u05e9\u05de\u05d9\u05e8\u05d4',
}

const SUBTITLE_BY_TAB = {
  details: TEXT.detailsSubtitle,
  position: TEXT.positionSubtitle,
  targets: TEXT.targetsSubtitle,
}

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

  const subtitle = SUBTITLE_BY_TAB[activeTab?.id] || TEXT.detailsSubtitle

  return (
    <Box sx={sx.toolbar(false)}>
      <Box sx={sx.titleArea}>
        <Box sx={sx.headerDot} />

        <Box sx={sx.titleCopy}>
          <Typography level='title-sm' sx={sx.title}>
            {activeTab?.labelH || TEXT.fallbackTitle}
          </Typography>

          <Typography level='body-xs' sx={sx.subtitle}>
            {subtitle}
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.toolbarActions}>
        <Chip size='sm' variant='soft' color={isDirty ? 'warning' : 'success'} sx={sx.statusChip}>
          {isDirty ? TEXT.unsaved : TEXT.saved}
        </Chip>

        {isTargetsTab ? (
          <PlayerTargetsReportButton
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
          sx={sx.secondaryAction}
        >
          {TEXT.reset}
        </Button>

        <Button
          size='sm'
          variant='solid'
          disabled={!canSave}
          loading={pending}
          onClick={onSave}
          sx={sx.confBtn(canSave)}
          startDecorator={iconUi({ id: 'save' })}
        >
          {TEXT.save}
        </Button>
      </Box>
    </Box>
  )
}
