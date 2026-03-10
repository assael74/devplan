// C:\projects\devplan\src\ui\forms\ui\abilities\StickyHeaderSection.js

import React, { useMemo } from 'react'
import { Box, Typography, Sheet, Divider, Chip, Tooltip, IconButton } from '@mui/joy'

import PlayerSelectField from '../../../fields/selectUi/players/PlayerSelectField.js'
import RoleSelectField from '../../../fields/selectUi/roles/RoleSelectField.js'
import JoyStarRatingStatic from '../../../domains/ratings/JoyStarRating.js'
import { iconUi } from '../../../core/icons/iconUi'
import { getFullDateIl } from '../../../../shared/format/dateUtiles.js'

export default function StickyHeaderSection({
  vaSx,
  draft,
  bits,
  context,
  players,
  canInteract,
  overallScore,
  overallStars,
  onSetPlayerId,
  onSetRoleId,
  onResetAll,
}) {
  const roles = useMemo(() => context?.roles || [], [context])

  return (
    <Box sx={vaSx.stickyHeader}>
      <Sheet variant="soft" sx={vaSx.datePill}>
        <Typography level="body-sm" startDecorator={iconUi({ id: 'date' })}>
          {getFullDateIl(bits.evalDate) || 'היום'}
        </Typography>
      </Sheet>

      <Divider sx={vaSx.divider} />

      <Box sx={vaSx.topRow}>
        <PlayerSelectField
          value={bits.playerId}
          onChange={(val) => onSetPlayerId(val || '')}
          options={players}
          context={context}
          disabled={bits.lockPlayerId}
          readOnly={bits.lockPlayerId}
          required
          size="sm"
        />

        <RoleSelectField
          value={draft?.roleId || ''}
          onChange={(roleId) => onSetRoleId(roleId)}
          options={roles}
          disabled={!canInteract}
          required
          size="sm"
        />
      </Box>

      <Divider sx={vaSx.divider} />

      <Box sx={vaSx.headerBar}>
        <Typography level="title-md">דומיינים וקבוצות יכולות</Typography>

        <Box sx={vaSx.overallScore}>
          <JoyStarRatingStatic value={overallStars} readOnly precision={0.5} size="lg" />

          <Chip size="lg" variant="soft" sx={vaSx.overallChip}>
            {overallScore == null ? '—' : overallScore}
          </Chip>

          <Tooltip title="איפוס">
            <IconButton
              size="sm"
              variant="soft"
              disabled={!canInteract}
              onClick={onResetAll}
              sx={vaSx.resetBtn}
            >
              {iconUi({ id: 'reset' })}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}
