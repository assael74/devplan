import { memo, useEffect, useState } from 'react'
import { Box, CircularProgress, Typography } from '@mui/joy'

import { CollapseBox } from '../../../../../../ui/patterns/collapseBox/index.js'
import ClubExpandedRow from './ClubExpandedRow.js'
import ClubSummaryRow from './ClubSummaryRow.js'
import { clubsPageSx as sx } from '../sx/clubsPage.sx.js'

const COLLAPSE_TRANSITION_MS = 240

const ClubCollectionItem = memo(function ClubCollectionItem({
  group,
  expanded,
  onToggleClub,
  onOpenClub,
}) {
  const clubId = group.club.clubId
  const [keepExpandedContent, setKeepExpandedContent] = useState(expanded)

  useEffect(() => {
    if (expanded) {
      setKeepExpandedContent(true)
      return undefined
    }

    const timeoutId = setTimeout(() => setKeepExpandedContent(false), COLLAPSE_TRANSITION_MS)
    return () => clearTimeout(timeoutId)
  }, [expanded])

  return (
    <CollapseBox
      open={expanded}
      disableHover
      onToggle={() => onToggleClub(clubId)}
      headerLeft={(
        <ClubSummaryRow
          club={group.club}
          model={group.summaryModel}
        />
      )}
      rootSx={[
        sx.collectionItem,
        expanded && sx.collectionItemOpen,
      ]}
      headerSx={[
        sx.collectionSummaryHeader,
        sx.summaryHeader,
        expanded && sx.collectionSummaryHeaderOpen,
      ]}
      contentSx={sx.collectionContent}
      indicatorSx={sx.collectionIndicator}
      innerSx={sx.collectionInner}
    >
      {expanded || keepExpandedContent ? (
        <ClubExpandedRow
          club={group.club}
          model={{
            intelligence: group.intelligence,
            seasonOptions: group.seasonOptions,
          }}
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
          onToggleClub={onToggleClub}
          onOpenClub={onOpenClub}
        />
      ))}
    </Box>
  )
}
