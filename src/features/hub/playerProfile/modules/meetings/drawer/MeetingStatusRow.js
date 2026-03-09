// MeetingStatusRow.js
import React from 'react'
import { Box, Sheet, FormControl, FormLabel, Textarea, Divider } from '@mui/joy'
import { sheetRowProps } from './MeetingEditDrawer.sx.js'
import moment from 'moment'
import 'moment/locale/he'

import MeetingStatusSteps from '../../../../../../ui/fields/checkUi/meetings/MeetingStatusSelector.js'

export default function MeetingStatusRow({ draft, setDraft }) {
  return (
    <Box sx={{ gridColumn: '1 / -1' }}>
      <Divider sx={{ my: 0.25 }} />

      <Box sx={{ mt: 0.75, display: 'flex', gap: 1, alignItems: 'stretch', flexDirection: { xs: 'column', md: 'row' } }}>
        {/* --- סטטוס --- */}
        <Sheet {...sheetRowProps}>
          <MeetingStatusSteps
            value={draft?.status || { id: 'new' }}
            onChange={(next) => {
              const nextId = next?.id || 'new'
              setDraft((p) => ({
                ...p,
                status: { ...(p.status || {}), id: nextId, time: moment().format('DD/MM/YYYY') },
              }))
            }}
            size="sm"
          />
        </Sheet>

        {/* --- notes --- */}
        <Sheet
          variant="soft"
          sx={{
            p: 1,
            borderRadius: 12,
            flex: 1,
            minWidth: 0,
            bgcolor: 'background.level1',
          }}
        >
          <FormControl>
            <FormLabel sx={{ fontSize: 12 }}>הערות</FormLabel>
            <Textarea
              minRows={3}
              variant="soft"
              value={draft?.notes || ''}
              placeholder="סיכום קצר, נקודות חשובות, החלטות..."
              onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
              sx={{
                mt: 0.5,
                bgcolor: 'background.surface',
                '&:hover': { bgcolor: 'background.level2' },
              }}
            />
          </FormControl>
        </Sheet>
      </Box>
    </Box>
  )
}
