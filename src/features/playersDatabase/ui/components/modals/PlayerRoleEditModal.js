// src/features/playersDatabase/ui/components/modals/PlayerRoleEditModal.js

import * as React from 'react'
import {
  Box,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import RegularModal from './RegularModal.js'
import {
  POSITION_LAYER_OPTIONS,
  POSITION_OPTIONS,
} from '../playerMeta/playerRole.options.js'
import { playerRoleEditModalSx as sx } from './sx/playerRoleEditModal.sx.js'

const hasOptionValue = (options, value) => (
  options.some(option => option.value === value)
)

export default function PlayerRoleEditModal({
  open,
  playerName = '',
  draft,
  busy = false,
  changed = false,
  onDraftChange,
  onConfirm,
  onClose,
}) {
  const safeDraft = draft || {
    positionLayer: '',
    primaryPosition: '',
  }

  return (
    <RegularModal
      open={Boolean(open)}
      title='עריכת חוליה ועמדה'
      description={playerName}
      iconId='playersDatabase'
      confirmLabel='שמירה'
      confirmIconId='save'
      size='sm'
      busy={busy}
      disabled={!changed}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <Box sx={sx.content}>
        <Box sx={sx.field}>
          <Typography level='body-sm' sx={sx.label}>
            חוליה
          </Typography>

          <Select
            size='sm'
            value={safeDraft.positionLayer}
            disabled={busy}
            onChange={(_, value) => onDraftChange({
              ...safeDraft,
              positionLayer: value || '',
            })}
            sx={sx.select}
          >
            <Option value=''>ללא</Option>

            {safeDraft.positionLayer && !hasOptionValue(POSITION_LAYER_OPTIONS, safeDraft.positionLayer) ? (
              <Option value={safeDraft.positionLayer}>{safeDraft.positionLayer}</Option>
            ) : null}

            {POSITION_LAYER_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>

        <Box sx={sx.field}>
          <Typography level='body-sm' sx={sx.label}>
            עמדה
          </Typography>

          <Select
            size='sm'
            value={safeDraft.primaryPosition}
            disabled={busy}
            onChange={(_, value) => onDraftChange({
              ...safeDraft,
              primaryPosition: value || '',
            })}
            sx={sx.select}
          >
            <Option value=''>ללא</Option>

            {safeDraft.primaryPosition && !hasOptionValue(POSITION_OPTIONS, safeDraft.primaryPosition) ? (
              <Option value={safeDraft.primaryPosition}>{safeDraft.primaryPosition}</Option>
            ) : null}

            {POSITION_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>
      </Box>
    </RegularModal>
  )
}
