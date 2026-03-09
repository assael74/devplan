// src/features/players/components/preview/PreviewDomainCard/domains/meetings/components/MeetingsEditDrawer.js
import React, { useMemo } from 'react'
import { Box, Button, Divider, Drawer, Sheet } from '@mui/joy'
import DrawerHeader from './DrawerHeader'

import { MEETING_TYPES } from '../../../../../../../../../shared/meetings/meetings.constants.js'
import { getFullDateIl } from '../../../../../../../../../shared/format/dateUtiles.js'
import { hasStr } from '../../../../../../../../../shared/format/string.js'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { sx } from '../meetingsDomainModal.sx.js'

import DateInputField from '../../../../../../../../../ui/fields/dateUi/DateInputField'
import MeetingTypeSelectField from '../../../../../../../../../ui/fields/selectUi/meetings/MeetingTypeSelectField'
import MeetingStatusSelectField from '../../../../../../../../../ui/fields/checkUi/meetings/MeetingStatusSelector.js'

const typeLabel = (id) => MEETING_TYPES.find((x) => x.id === id)?.labelH || id || '—'

export default function MeetingsEditDrawer({
  player,
  open,
  busy,
  draft,
  onDraft,
  onClose,
  onSave,
  isDirty,
}) {
  const canSave =
    hasStr(draft?.meetingDate) &&
    hasStr(draft?.meetingHour) &&
    hasStr(draft?.type) &&
    hasStr(draft?.statusId)

  const headerMeta = useMemo(() => {
    const d = draft?.meetingDate ? getFullDateIl(draft.meetingDate, false) : '—'
    return `פגישה ${typeLabel(draft?.type)} • ${d}`
  }, [draft])

  const saveDisabled = !isDirty || busy

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      size="lg"
      sx={sx.drawerRoot}
      slotProps={{ content: { sx: sx.drawerContentBasic } }}
    >
      <DrawerHeader
        meta={headerMeta}
        player={player}
        busy={busy}
        onClose={onClose}
        sx={sx.drawerHeaderSx}
      />

      <Divider />

      <Box sx={sx.drawerBody}>
        <Sheet variant="outlined" sx={{ ...sx.card, ...sx.grid3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 2 }}>
            <DateInputField
              context="meeting"
              value={draft?.meetingDate}
              timeValue={draft?.meetingHour}
              onChange={(val) => onDraft({ ...draft, meetingDate: val })}
              onTimeChange={(val) => onDraft({ ...draft, meetingHour: val })}
              size="sm"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 2, position: 'relative', zIndex: 1 }}>
            <MeetingTypeSelectField
              value={draft?.type}
              onChange={(val) => onDraft({ ...draft, type: val })}
              size="sm"
            />
          </Box>

          <Divider orientation="vertical" sx={{ mx: 1, pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <MeetingStatusSelectField
              value={{ id: draft?.status?.current?.id || '' }}
              onChange={(val) =>
                onDraft({
                  ...draft,
                  status: { ...(draft.status || {}), current: { ...(draft.status?.current || {}), id: val.id } },
                })
              }
              size="sm"
              slotProps={{ listbox: { sx: { zIndex: 2000 } }}}
            />
          </Box>
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
