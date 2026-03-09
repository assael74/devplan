// src/features/players/components/preview/PreviewDomainCard/domains/meetings/components/MeetingsEditNotesDrawer.js
import React, { useMemo } from 'react'
import { Box, Divider, Drawer, Sheet, Textarea, Typography, Button } from '@mui/joy'
import DrawerHeader from './DrawerHeader'

import { MEETING_STATUSES, MEETING_TYPES } from '../../../../../../../../../shared/meetings/meetings.constants.js'
import { getFullDateIl } from '../../../../../../../../../shared/format/dateUtiles.js'
import { sx } from '../meetingsDomainModal.sx.js'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { hasStr } from '../../../../../../../../../shared/format/string.js'

const typeLabel = (id) => MEETING_TYPES.find((x) => x.id === id)?.labelH || id || '—'
const statusLabel = (id) => MEETING_STATUSES.find((x) => x.id === id)?.labelH || id || '—'

export default function MeetingsEditNotesDrawer({ player, open, busy, draft, onDraft, onClose, onSave, isDirty }) {
  const canSave = hasStr(draft?.notes)

  const saveDisabled = !canSave || !isDirty || busy

  const headerMeta = useMemo(() => {
    const d = draft?.meetingDate ? getFullDateIl(draft.meetingDate, false) : '—'
    return `${typeLabel(draft?.typeId)} • ${statusLabel(draft?.statusId)} • ${d}`
  }, [draft])

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      size="lg"
      sx={sx.drawerRoot}
      slotProps={{ content: { sx: sx.drawerContent } }}
    >
      <DrawerHeader
        meta={headerMeta}
        player={player}
        busy={busy}
        canSave={canSave}
        isDirty={isDirty}
        onSave={onSave}
        onClose={onClose}
        sx={sx.drawerHeaderSx}
      />

      <Divider />

      <Box sx={sx.drawerBody}>
        <Sheet variant="outlined" sx={sx.card}>
          <Typography level="title-sm" sx={sx.cardTitle}>הערות</Typography>
          <Textarea
            minRows={4}
            size="sm"
            placeholder="הערות לפגישה..."
            value={draft?.notes || ''}
            onChange={(e) => onDraft({ ...draft, notes: e.target.value })}
            disabled={busy}
          />
        </Sheet>
      </Box>

      {/* Footer actions inside drawer */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          p: 1,
          ml: 2
        }}
      >
        <Button
          size="sm"
          variant="solid"
          startDecorator={iconUi({ id: 'save' })}
          loading={busy}
          loadingPosition="center"
          disabled={saveDisabled}
          onClick={onSave}
        >
          שמירה
        </Button>

        <Button
          size="sm"
          variant="outlined"
          onClick={onClose}
          disabled={busy}
        >
          ביטול
        </Button>

      </Box>
    </Drawer>
  )
}
