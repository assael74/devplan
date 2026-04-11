import React from 'react'
import { Box, Typography, Chip } from '@mui/joy'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi'
import PlayerTypeSelector from '../../../../../../../../../../ui/fields/checkUi/players/PlayerTypeSelector.js'
import PlayerActiveSelector from '../../../../../../../../../../ui/fields/checkUi/players/PlayerActiveSelector.js'
import SquadRoleSelectField from '../../../../../../../../../../ui/fields/selectUi/players/SquadRoleSelectField.js'
import ProjectStatusSelectField from '../../../../../../../../../../ui/fields/selectUi/players/ProjectStatusSelectField.js'
import { drawerSx as sx } from '../../sx/editDrawer.sx.js'

export default function EditDrawerStatus({ draft, setDraft }) {
  return (
    <Box sx={sx.sectionCardSx}>
      <Box sx={sx.boolRowSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', pt: 3, gap: 1 }}>
          <PlayerActiveSelector
            size="sm"
            value={draft.active}
            onChange={() => setDraft((prev) => ({ ...prev, active: !prev.active }))}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 140, maxWidth: 140 }}>
            <SquadRoleSelectField
              size="sm"
              value={draft?.squadRole}
              onChange={(value) => setDraft((prev) => ({ ...prev, squadRole: value }))}
            />
          </Box>

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
