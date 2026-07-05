// features/playersDatabase/components/profilesPage/list/ProfilesList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import ListToolbar from './listToolbar/ListToolbar.js'
import PlayerResultSelectable from './PlayerResultSelectable.js'
import { listSx as sx } from './sx/list.sx.js'

export default function ProfilesList({ model, onEditLink }) {
  const selectedProfile = model.selectedProfile
  const selectedProfileIds = model.selectedProfilesById[selectedProfile?.id] || []
  const selectedProfileResult = model.profileResultsById[selectedProfile?.id]

  return (
    <Box sx={sx.root}>
      <ListToolbar
        profile={selectedProfile}
        selectedProfileResult={selectedProfileResult}
        selectedProfileIds={selectedProfileIds}
        selectionReady={Boolean(model.previewState?.chipsReady)}
        loading={Boolean(selectedProfileResult?.loading)}
        removingProfileId={model.removingProfileId}
        sortBy={model.sortBy}
        sortDirection={model.sortDirection}
        sortOptions={model.sortOptions}
        onChangeSortBy={model.setSortBy}
        onChangeSortDirection={model.setSortDirection}
        onLoadDocuments={model.loadProfileDocuments}
        onToggleProfile={model.toggleProfileForLoad}
      />

      <Box className="dpScrollThin" sx={sx.content}>
        {model.error ? (
          <Typography sx={sx.error}>{model.error}</Typography>
        ) : null}

        {model.indicatorError ? (
          <Typography sx={sx.error}>{model.indicatorError}</Typography>
        ) : null}

        <Box sx={sx.resultsArea}>
          {selectedProfileResult?.loading ? (
            <Box sx={sx.placeholder}>
              <Typography level="title-sm" sx={sx.placeholderTitle}>
                טוען מסמכים...
              </Typography>

              <Typography level="body-sm" sx={sx.placeholderText}>
                נא להמתין עד שהמסמכים ייטענו.
              </Typography>
            </Box>
          ) : selectedProfileResult?.rows?.length ? (
            selectedProfileResult.rows.map(player => (
              <PlayerResultSelectable
                key={`${player.searchDocId || player.id}-${player.profileId}-${player.teamSeasonKey}`}
                player={player}
                result={selectedProfileResult}
                removingProfileId={model.removingProfileId}
                selected={false}
                selectionMode={false}
                onToggleSelect={() => {}}
                onEditLink={playerRow => onEditLink(selectedProfile, playerRow)}
                onRemoveProfile={(playerRow, profileId) =>
                  model.removeProfileFromLoadedDocuments(
                    selectedProfile,
                    playerRow,
                    profileId
                  )
                }
              />
            ))
          ) : (
            <Box sx={sx.placeholder}>
              <Typography level="title-sm" sx={sx.placeholderTitle}>
                בחר פרופילים ולחץ על טעינה
              </Typography>

              <Typography level="body-sm" sx={sx.placeholderText}>
                כאן יופיעו שורות השחקנים שייטענו מהפרופילים שנבחרו.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
