// features/playersDatabase/components/profilesPage/ProfilesPage.js

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Sheet } from '@mui/joy'

import { useProfileRowLinks, useProfilesPage } from './hooks/index.js'
import { ProfilesList } from './list/index.js'
import PreviewArea from './preview/PreviewArea.js'
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

          <PreviewArea
            profile={model.selectedProfile}
            selectedProfileResult={
              model.profileResultsById[model.selectedProfile?.id]
            }
            previewState={model.previewState}
            previewContentCleared={model.previewContentCleared}
            previewPlayerRow={model.previewPlayerRow}
            rowLinks={rowLinks}
            onRefreshDocuments={() =>
              model.loadProfileDocuments(model.selectedProfile, { force: true })
            }
            onRemoveProfile={(
              playerRow,
              profileId
            ) =>
              model.removeProfileFromLoadedDocuments(
                model.selectedProfile,
                playerRow,
                profileId
              )
            }
            onOpen={model.openProfile}
          />
        </Box>
      </Sheet>
    </Box>
  )
}
