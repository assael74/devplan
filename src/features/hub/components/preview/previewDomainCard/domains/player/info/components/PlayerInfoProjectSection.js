// preview/previewDomainCard/domains/player/info/components/PlayerInfoProjectSection.js

import React from 'react'
import { Box } from '@mui/joy'
import { ProjectStatusSelectField, PlayerIfaLinkField } from '../../../../../../../../../ui/fields'
import { sx } from '../sx/playerInfo.domain.sx.js'

export default function PlayerInfoProjectSection({ form, pending, setField }) {
  return (
    <Box sx={sx.projectBox}>
      <ProjectStatusSelectField
        value={form.projectStatus}
        onChange={(v) => setField('projectStatus', v)}
        size="sm"
        disabled={pending}
      />

      <PlayerIfaLinkField
        value={form.ifaLink}
        onChange={(v) => setField('ifaLink', v)}
        size="sm"
        disabled={pending}
      />
    </Box>
  )
}
