// src/features/playersDatabase/components/scan/ScanProfilesList.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import ScanProfileRow from './ScanProfileRow.js'
import { scanPageSx as sx } from './sx/page.sx.js'

export default function ScanProfilesList({ model, onEditLink }) {
  return (
    <Box sx={sx.listPanel}>
      <Box sx={sx.listHeader}>
        <Typography level="title-md" sx={sx.title}>פרופילים לסריקה</Typography>
        <Chip size="sm" variant="soft" color="neutral">{model.filteredProfiles.length} בתצוגה</Chip>
      </Box>

      <Box className="dpScrollThin" sx={sx.list}>
        {model.error ? <Typography sx={sx.error}>{model.error}</Typography> : null}
        {model.indicatorError ? <Typography sx={sx.error}>{model.indicatorError}</Typography> : null}

        {model.filteredProfiles.map(row => (
          <ScanProfileRow key={row.id} row={row} selected={row.id === model.selectedProfile?.id} expanded={Boolean(model.expandedIds[row.id])} selectedProfileIds={model.selectedProfilesById[row.id] || []} result={model.scanResultsById[row.id]} onSelect={model.setSelectedId} onToggle={model.openProfile} onToggleProfile={model.toggleProfileForLoad} onLoadDocuments={model.loadProfileDocuments} onEditLink={onEditLink} onRemoveProfile={model.removeProfileFromLoadedDocuments} />
        ))}
      </Box>
    </Box>
  )
}
