import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi'
import PlayerTypeSelector from '../../../../../../../../../../ui/fields/checkUi/players/PlayerTypeSelector.js'
import PlayerActiveSelector from '../../../../../../../../../../ui/fields/checkUi/players/PlayerActiveSelector.js'
import PlayerKeyPlayerSelector from '../../../../../../../../../../ui/fields/checkUi/players/PlayerKeyPlayerSelector.js'
import ProjectStatusSelectField from '../../../../../../../../../../ui/fields/checkUi/players/ProjectStatusSelectField.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawerStatus({ draft, setDraft }) {
  return (
    <Box sx={sx.sectionCardSx}>
      <Typography sx={sx.sectionTitleSx}>סטטוס מהיר</Typography>

      <Box sx={sx.boolRowSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', pt: 4, gap: 1 }}>
          <PlayerActiveSelector
            size="sm"
            value={draft.active}
            onChange={() => setDraft((prev) => ({ ...prev, active: !prev.active }))}
          />

          <PlayerKeyPlayerSelector
            size="sm"
            value={draft.isKey}
            onChange={() => setDraft((prev) => ({ ...prev, isKey: !prev.isKey }))}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <PlayerTypeSelector
            size="sm"
            value={draft.type}
            onChange={(next) => setDraft((p) => ({ ...p, type: next || 'noneType' }))}
          />
        </Box>
      </Box>

      <Box sx={sx.sectionStatusCardSx}>
        <ProjectStatusSelectField
          value={draft.projectStatus}
          onChange={(v) => setDraft((p) => ({ ...p, projectStatus: v }))}
          size="sm"
        />
      </Box>
    </Box>
  )
}
