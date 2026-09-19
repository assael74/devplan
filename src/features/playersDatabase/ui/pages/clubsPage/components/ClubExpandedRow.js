// src/features/playersDatabase/ui/pages/clubsPage/components/ClubExpandedRow.js
import { useMemo } from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import { buildClubCollapseSignalCardsModel } from '../../../../model/pages/clubPresentation.model.js'
import { getClubCollapseView } from '../../../../domain/clubIntelligence/index.js'
import ClubAgeGroupSignalCards from './ClubAgeGroupSignalCards.js'
import { clubExpandedRowSx as sx } from './sx/clubExpandedRow.sx.js'

export default function ClubExpandedRow({ club, model, onOpenClub }) {
  const collapseView = useMemo(() => (
    getClubCollapseView(model.intelligence)
  ), [model.intelligence])
  const cards = useMemo(() => buildClubCollapseSignalCardsModel({
    teams: collapseView.currentTeams,
    spotlights: collapseView.spotlights,
    signalCoverage: collapseView.signalCoverage,
    seasonKey: model.seasonOptions?.find(option => option.value === 'current')?.seasonKey,
  }), [collapseView, model.seasonOptions])

  return (
    <Box className='dpScrollThin' sx={sx.expanded}>
      <Box sx={sx.expandedSeasonHeader}>
        <Typography level='title-sm' sx={sx.expandedSeasonTitle}>
          איתותים לפי קבוצת גיל · עונה נוכחית
        </Typography>
        <Box sx={sx.expandedSeasonActions}>
          <Button
            size='sm'
            variant='plain'
            sx={sx.expandedSeasonClubButton}
            onClick={() => onOpenClub(club)}
          >
            {`לעמוד ${club?.name || 'המועדון'}`}
          </Button>
        </Box>
      </Box>

      <ClubAgeGroupSignalCards cards={cards} />
    </Box>
  )
}
