// src/features/playersDatabase/ui/pages/teamPage/TeamHeader.js

import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/joy'

import PageHeader from '../../components/page/PageHeader.js'
import FavoriteButton from '../../components/actions/FavoriteButton.js'
import TeamName from '../../components/entities/TeamName.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import teamLogo from '../../../../../ui/core/images/teamLogo.png'
import { teamHeaderSx as sx } from './sx/teamHeader.sx.js'

export default function TeamHeader({
  breadcrumbs,
  team,
  clubUrl = '',
  seasonKey,
  favorite = false,
  favoritePending = false,
  onFavoriteToggle,
  onSearch,
  onLeague,
  backLabel = 'חזרה לליגה',
}) {
  const resolvedClubUrl = String(clubUrl || '').trim()
  const headerSeason = String(seasonKey || '').trim() || '-'
  const actions = (
    <Stack sx={sx.headerActionsPanel}>

      <Stack direction='row' spacing={1} sx={sx.headerActions}>
        <Button
          sx={sx.primaryButton}
          startDecorator={iconUi({id: 'playerDatabase', size: 'sm'})}
          onClick={onSearch}
        >
          מעבר לעמוד חיפוש
        </Button>

        <Button
          variant='outlined'
          sx={sx.secondaryButton}
          startDecorator={iconUi({id: 'back', size: 'sm'})}
          onClick={onLeague}
        >
          {backLabel}
        </Button>
      </Stack>
    </Stack>
  )

  return (
    <PageHeader
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <Box sx={sx.titleRow}>
        <Box
          component='img'
          src={teamLogo}
          alt=''
          sx={sx.teamLogo}
        />

        {resolvedClubUrl ? (
          <Box
            component='a'
            href={resolvedClubUrl}
            target='_blank'
            rel='noopener noreferrer'
            referrerPolicy='no-referrer'
            aria-label={`פתיחת קישור המועדון ${team.name || ''}`}
            sx={sx.pageTitleLink}
          >
            <Typography data-team-title level='h1' sx={sx.pageTitle}>
              <TeamName
                value={team.name}
                slot={team.teamSlot || team.birthTeamSlot}
                nameSx={sx.pageTitle}
              />
            </Typography>
          </Box>
        ) : (
          <Typography level='h1' sx={sx.pageTitle}>
            <TeamName
              value={team.name}
              slot={team.teamSlot || team.birthTeamSlot}
              nameSx={sx.pageTitle}
            />
          </Typography>
        )}

        <FavoriteButton
          favorite={favorite}
          loading={favoritePending}
          label={team.name}
          onToggle={onFavoriteToggle}
          sx={sx.favoriteButton}
        />

        <Box sx={[sx.contextChip, sx.birthYearChip]}>
          שנתון {team.birthYear}
        </Box>

        <Box sx={sx.contextChip}>
          עונה {headerSeason}
        </Box>
      </Box>
    </PageHeader>
  )
}



