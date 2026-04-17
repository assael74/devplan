// teamProfile/modules/games/components/entryDrawer/EntryEditHeaderDrawer.js

import React from 'react'
import { Avatar, Box, Chip, DialogTitle, ModalClose, Typography } from '@mui/joy'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { entryEditDrawerSx as sx } from './sx/entryEditDrawer.sx.js'

const c = getEntityColors('teams')

export default function EntryEditHeaderDrawer({
  game,
  draft,
  context,
  onClose,
}) {
  const team = context?.team || game?.team || {}

  const src = resolveEntityAvatar({
    entityType: 'team',
    entity: team,
    parentEntity: team?.club,
    subline: team?.club?.name,
  })

  return (
    <DialogTitle sx={sx.dialogTitle}>
      <Box sx={sx.titleWrap}>
        <Box sx={sx.titleMain}>
          <Avatar src={src} sx={sx.titleAvatar} />

          <Box sx={sx.titleTextWrap}>
            <Typography level="title-md" sx={sx.formNameSx}>
              {team?.teamName || team?.name || 'קבוצה'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap:1 }}>
              <Typography
                level="body-sm"
                sx={sx.formSubNameSx}
                startDecorator={iconUi({ id: 'games' })}
              >
                {draft?.rival || 'משחק'} - {draft?.gameDateLabel || ''}
              </Typography>

              <Typography
                level="body-sm"
                variant='outlined'
                sx={{...sx.formSubNameSx, borderRadius: 'sm', ml: 1 }}
                startDecorator={iconUi({ id: 'result' })}
              >
                {game?.score || 'משחק'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={sx.titleActions}>
          <Chip
            size="sm"
            color={draft?.isPlayed ? 'success' : 'warning'}
            variant="soft"
            startDecorator={iconUi({ id: draft?.isPlayed ? 'success' : 'calendar' })}
          >
            {draft?.isPlayed ? 'משחק שוחק' : 'משחק עתידי'}
          </Chip>

          <ModalClose sx={sx.modalCloseSx} onClick={onClose} />
        </Box>
      </Box>
    </DialogTitle>
  )
}
