// features/playersDatabase/components/profilesPage/ProfilesPage.js

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Sheet } from '@mui/joy'

import { useProfileRowLinks, useProfilesPage } from './hooks/index.js'
import { ProfilesList } from './list/index.js'
import { ProfileRowLinksModal } from './modals/index.js'
import ProfilePreview from './preview/ProfilePreview.js'
import ProfilesPageHeader from './ProfilesPageHeader.js'
import { pageSx as sx } from './sx/page.sx.js'
import ProfilesToolbar from './toolbar/ProfilesToolbar.js'

export default function ProfilesPage() {
  const navigate = useNavigate()
  const model = useProfilesPage()
  const rowLinks = useProfileRowLinks(model.invalidateProfileDocuments)

  return (
    <Box sx={sx.root}>
      <Sheet sx={sx.shell}>
        <ProfilesPageHeader
          kpis={model.kpis}
          onBack={() => navigate('/players-database')}
        />

        <ProfilesToolbar model={model} />

        <Box sx={sx.body}>
          <ProfilesList model={model} onEditLink={rowLinks.open} />

          <ProfilePreview
            profile={model.selectedProfile}
            previewState={model.previewState}
            onOpen={model.openProfile}
          />
        </Box>

        <ProfileRowLinksModal
          open={Boolean(rowLinks.row)}
          row={rowLinks.row?.playerRow || null}
          saving={rowLinks.saving}
          error={rowLinks.error}
          onClose={rowLinks.close}
          onSave={rowLinks.save}
        />
      </Sheet>
    </Box>
  )
}
