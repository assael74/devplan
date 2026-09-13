import { memo } from 'react'
import { Box, CircularProgress, Typography } from '@mui/joy'

import { CollapseBox } from '../../../../../../ui/patterns/collapseBox/index.js'
import ClubExpandedRow from './ClubExpandedRow.js'
import ClubSummaryRow from './ClubSummaryRow.js'
import { clubsPageSx as sx } from '../sx/clubsPage.sx.js'

const ClubCollectionItem = memo(function ClubCollectionItem({
  group,
  expanded,
  hasExpandedClub,
  onToggleClub,
  onOpenTeam,
  onOpenClub,
}) {
  const clubId = group.club.clubId

  return (
    <CollapseBox
      open={expanded}
      onToggle={() => onToggleClub(clubId)}
      headerLeft={(
        <ClubSummaryRow
          club={group.club}
          model={group.summaryModel}
        />
      )}
      rootSx={[
        sx.collectionItem,
        hasExpandedClub && !expanded && sx.collectionItemMuted,
      ]}
      headerSx={[sx.collectionSummaryHeader, sx.summaryHeader]}
      indicatorSx={sx.collectionIndicator}
      contentSx={sx.collectionContent(expanded)}
      innerSx={sx.collectionInner}
    >
      {expanded ? (
        <ClubExpandedRow
          club={group.club}
          model={{
            expandedModels: group.expandedModels,
            seasonOptions: group.seasonOptions,
          }}
          onOpenTeam={onOpenTeam}
          onOpenClub={onOpenClub}
        />
      ) : null}
    </CollapseBox>
  )
})

export default function ClubsCollection({
  loading,
  error,
  groups,
  expandedClubId,
  onToggleClub,
  onOpenTeam,
  onOpenClub,
}) {
  if (loading) {
    return (
      <Box sx={sx.stateBox}>
        <CircularProgress size='sm' />
        <Typography level='body-sm'>
          טוען מועדונים...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={sx.stateBox}>
        <Typography level='body-sm' color='danger'>
          {error}
        </Typography>
      </Box>
    )
  }

  if (!groups.length) {
    return (
      <Box sx={sx.stateBox}>
        <Typography level='title-sm'>
          לא נמצאו מועדונים להצגה
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={sx.collection}>
      {groups.map(group => (
        <ClubCollectionItem
          key={group.club.clubId}
          group={group}
          expanded={expandedClubId === group.club.clubId}
          hasExpandedClub={Boolean(expandedClubId)}
          onToggleClub={onToggleClub}
          onOpenTeam={onOpenTeam}
          onOpenClub={onOpenClub}
        />
      ))}
    </Box>
  )
}
