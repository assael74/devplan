// src/features/playersDatabase/components/scan/ScanCenterPage.js

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Sheet } from '@mui/joy'

import ScanCenterHeader from './ScanCenterHeader.js'
import ScanCenterToolbar from './ScanCenterToolbar.js'
import ScanProfilesList from './ScanProfilesList.js'
import ScanProfileDetails from './ScanProfileDetails.js'
import ScanRowLinksModal from './ScanRowLinksModal.js'
import { useScanCenter } from './hooks/useScanCenter.js'
import { useScanRowLinks } from './hooks/useScanRowLinks.js'
import { scanPageSx as sx } from './sx/page.sx.js'

export default function ScanCenterPage() {
  const navigate = useNavigate()
  const model = useScanCenter()
  const rowLinks = useScanRowLinks(model.invalidateProfileDocuments)

  return (
    <Box sx={sx.root}>
      <Sheet sx={sx.shell}>
        <ScanCenterHeader kpis={model.kpis} onBack={() => navigate('/players-database')} />
        <ScanCenterToolbar model={model} />

        <Box sx={sx.body}>
          <ScanProfilesList model={model} onEditLink={rowLinks.open} />
          <ScanProfileDetails profile={model.selectedProfile} onOpen={model.openProfile} />
        </Box>

        <ScanRowLinksModal open={Boolean(rowLinks.row)} row={rowLinks.row?.playerRow || null} saving={rowLinks.saving} error={rowLinks.error} onClose={rowLinks.close} onSave={rowLinks.save} />
      </Sheet>
    </Box>
  )
}
