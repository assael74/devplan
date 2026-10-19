// src/features/playersDatabase/ui/pages/clubsPage/components/ClubExpandedRow.js
import { useMemo } from 'react'
import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import { buildClubCollapseSignalCardsModel } from '../../../../model/pages/clubPresentation.model.js'
import { getClubCollapseView } from '../../../../domain/clubIntelligence/index.js'
import ClubAgeGroupSignalCards from './ClubAgeGroupSignalCards.js'
import { clubExpandedRowSx as sx } from './sx/clubExpandedRow.sx.js'

export default function ClubExpandedRow({ club, model, onOpenClub, onEditClub }) {
  const collapseView = useMemo(() => (
    getClubCollapseView(model.intelligence)
  ), [model.intelligence])
  const cards = useMemo(() => buildClubCollapseSignalCardsModel({
    teams: collapseView.currentTeams,
    signalCoverage: collapseView.signalCoverage,
    seasonKey: model.seasonOptions?.find(option => option.value === 'current')?.seasonKey,
  }), [collapseView, model.seasonOptions])
  const investigationCount = collapseView.currentTeams.filter(team => team.showInvestigationIndicator === true).length

  return (
    <Box className='dpScrollThin' sx={sx.expanded}>
      <Box sx={sx.expandedSeasonHeader}>
        <Typography level='title-sm' sx={sx.expandedSeasonTitle}>
          איתותים לפי קבוצת גיל · עונה נוכחית
        </Typography>
        {investigationCount > 0 ? (
          <Chip size='sm' variant='soft' color='primary' startDecorator={iconUi({ id: 'notes', size: 'sm' })}>
            {`${investigationCount} קבוצות בחקירה`}
          </Chip>
        ) : null}
        <Box sx={sx.expandedSeasonActions}>
          <Button size='sm' variant='outlined' onClick={() => onEditClub?.(club)}>
            עריכת שמות
          </Button>
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
