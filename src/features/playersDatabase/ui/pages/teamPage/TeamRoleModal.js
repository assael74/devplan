// features/playersDatabase/ui/pages/teamPage/TeamRoleModal.js

import * as React from 'react'
import {
  Box,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'

import PlayersDatabaseModal from '../../components/modals/PlayersDatabaseModal.js'
import {
  POSITION_LAYER_OPTIONS,
  POSITION_OPTIONS,
} from './logic/teamPage.constants.js'
import { hasOptionValue } from './logic/teamPage.utils.js'
import { teamModalsSx as sx } from './sx/teamModals.sx.js'

export default function TeamRoleModal({
  row,
  draft,
  busy,
  changed,
  onDraftChange,
  onConfirm,
  onClose,
}) {
  return (
    <PlayersDatabaseModal
      open={Boolean(row)}
      title='עריכת חוליה ועמדה'
      description={row?.fullName || ''}
      iconId='playersDatabase'
      confirmLabel='אישור שינוי'
      confirmIconId='save'
      size='sm'
      busy={busy}
      disabled={!changed}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <Stack spacing={1.25} sx={sx.roleModalContent}>
        <Box sx={sx.roleModalField}>
          <Typography level='body-sm' sx={sx.roleModalLabel}>
            חוליה
          </Typography>

          <Select
            size='sm'
            value={draft.positionLayer}
            disabled={busy}
            onChange={(_, value) => onDraftChange({
              ...draft,
              positionLayer: value || '',
            })}
            sx={sx.roleModalSelect}
          >
            <Option value=''>ללא</Option>

            {draft.positionLayer && !hasOptionValue(POSITION_LAYER_OPTIONS, draft.positionLayer) ? (
              <Option value={draft.positionLayer}>{draft.positionLayer}</Option>
            ) : null}

            {POSITION_LAYER_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>

        <Box sx={sx.roleModalField}>
          <Typography level='body-sm' sx={sx.roleModalLabel}>
            עמדה
          </Typography>

          <Select
            size='sm'
            value={draft.primaryPosition}
            disabled={busy}
            onChange={(_, value) => onDraftChange({
              ...draft,
              primaryPosition: value || '',
            })}
            sx={sx.roleModalSelect}
          >
            <Option value=''>ללא</Option>

            {draft.primaryPosition && !hasOptionValue(POSITION_OPTIONS, draft.primaryPosition) ? (
              <Option value={draft.primaryPosition}>{draft.primaryPosition}</Option>
            ) : null}

            {POSITION_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>
      </Stack>
    </PlayersDatabaseModal>
  )
}
