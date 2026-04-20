// playerProfile/mobile/modules/payments/components/cardui/ParentCard.js

import React from 'react'
import { Box, Button, Card, Divider, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { formatPhoneNumber } from '../../../../../../../../shared/format/contactUtiles.js'

import { cardSx as sx } from '../../sx/card.sx.js'

import { usePlayerHubUpdate } from '../../../../../../hooks/players/usePlayerHubUpdate.js'

export default function ParentCard({
  player,
  parent,
  onEditParent,
  deleteDisabled = false,
}) {
  const parentRole = parent?.parentRole || 'תפקיד לא הוגדר'
  const parentName = parent?.parentName || 'הורה'
  const parentEmail = parent?.parentEmail || 'לא הוגדר אימייל'
  const parentPhone = formatPhoneNumber(parent?.parentPhone) || 'לא עודכן נייד'

  const { run, pending } = usePlayerHubUpdate(player)

  const handleDeleteLocal = async () => {
    if (!player || !parent?.id) return;

    const currentParents = Array.isArray(player.parents) ? player.parents : [];
    const nextParents = currentParents.filter(p => p.id !== parent.id);

    await run({ parents: nextParents }, {
      section: 'playerParents',
      player,
      createIfMissing: false,
    });
  };

  return (
    <Card variant="outlined" sx={{ p: 1.2, boxShadow: 'sm' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ gap: 0.5 }}>
          <Typography level="title-lg" sx={{ fontWeight: 'md' }}>
            {parentName}
          </Typography>

          <Typography level="body-xs" sx={{ opacity: 0.75 }}>
            {parentRole}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ gap: 1 }}>
          <Typography level="body-sm" startDecorator={iconUi({ id: 'email' })}>
            {parentEmail}
          </Typography>

          <Typography level="body-sm" startDecorator={iconUi({ id: 'phone' })}>
            {parentPhone}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={sx.buttWrap}>
        <Button
          size="sm"
          variant="outlined"
          color="danger"
          onClick={handleDeleteLocal}
          disabled={deleteDisabled || pending}
          loading={pending}
        >
          מחק
        </Button>

        <Button
          size="sm"
          variant="solid"
          onClick={() => onEditParent(parent)}
          disabled={pending}
          sx={sx.conBut}
        >
          ערוך
        </Button>
      </Box>
    </Card>
  )
}
