// src/features/players/components/preview/PreviewDomainCard/domains/meetings/components/MeetingsEditVLinkDrawer.js
import React, { useMemo } from 'react'
import { Box, Button, Divider, Drawer, IconButton, Sheet, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import DrawerHeader from './DrawerHeader'

import { MEETING_STATUSES, MEETING_TYPES } from '../../../../../../../../../shared/meetings/meetings.constants.js'
import { getFullDateIl } from '../../../../../../../../../shared/format/dateUtiles.js'
import { clean } from '../../../../../../../../../shared/format/string.js'
import { sx } from '../meetingsDomainModal.sx.js'
import { hasStr } from '../../../../../../../../../shared/format/string.js'
import VideoLinkField from '../../../../../../../../../ui/fields/inputUi/videos/VideoLinkField'

const typeLabel = (id) => MEETING_TYPES.find((x) => x.id === id)?.labelH || id || '—'
const statusLabel = (id) => MEETING_STATUSES.find((x) => x.id === id)?.labelH || id || '—'

export default function MeetingsEditVLinkDrawer({ player, open, busy, draft, onDraft, onClose, onSave, isDirty }) {
  const canSave = hasStr(draft?.video)
  const saveDisabled = !canSave || !isDirty || busy

  const headerMeta = useMemo(() => {
    const d = draft?.meetingDate ? getFullDateIl(draft.meetingDate, false) : '—'
    return `${typeLabel(draft?.typeId)} • ${statusLabel(draft?.statusId)} • ${d}`
  }, [draft])

  const addVideo = () => {
    const next = { id: `v${(draft?.videos?.length || 0) + 1}`, url: '', title: '' }
    onDraft({ ...draft, videos: [...(draft?.videos || []), next] })
  }

  const removeVideo = (vid) => {
    onDraft({ ...draft, videos: (draft?.videos || []).filter((v) => v.id !== vid) })
  }

  const changeVideo = (vid, patch) => {
    onDraft({
      ...draft,
      videos: (draft?.videos || []).map((v) => (v.id === vid ? { ...v, ...patch } : v)),
    })
  }

  const safeVideos = (draft?.videos || []).map((v) => ({
    ...v,
    url: clean(v.url),
    title: clean(v.title),
  }))

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
        onSave={onSave}
        onClose={onClose}
        sx={sx.drawerHeaderSx}
      />

      <Divider />

      <Box sx={sx.drawerBody}>
        <Sheet variant="outlined" sx={sx.card}>
          <Box sx={sx.videosHeader}>
            <Typography level="title-sm" sx={{ flex: 1 }}>קטעי וידאו</Typography>
            <Button
              size="sm"
              variant="outlined"
              startDecorator={iconUi({ id: 'add' })}
              onClick={addVideo}
              disabled={busy}
            >
              הוסף קטע
            </Button>
          </Box>

          <Box sx={sx.videosList}>
            {safeVideos.length === 0 ? (
              <Typography level="body-sm" sx={sx.emptyText}>אין קטעי וידאו.</Typography>
            ) : null}

            {safeVideos.map((v) => (
              <Sheet key={v.id} variant="soft" sx={sx.videoRow}>
                <Box sx={sx.videoRowGrid}>
                  <VideoLinkField
                    size="sm"
                    placeholder="קישור לוידאו"
                    value={v.url || ''}
                    onChange={(val) => changeVideo(v.id, { url: val })}
                    disabled={busy}
                  />

                  <IconButton
                    size="sm"
                    variant="soft"
                    color="danger"
                    onClick={() => removeVideo(v.id)}
                    disabled={busy}
                    sx={{ alignSelf: 'center', height: 40 }}
                  >
                    {iconUi({ id: 'delete' })}
                  </IconButton>
                </Box>
              </Sheet>
            ))}
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
