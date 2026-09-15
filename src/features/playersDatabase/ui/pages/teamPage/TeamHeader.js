// src/features/playersDatabase/ui/pages/teamPage/TeamHeader.js

import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/joy'

import PageHeader from '../../components/page/PageHeader.js'
import FavoriteButton from '../../components/actions/FavoriteButton.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import teamLogo from '../../../../../ui/core/images/teamLogo.png'
import { teamHeaderSx as sx } from './sx/teamHeader.sx.js'

export default function TeamHeader({
  breadcrumbs,
  team,
  teamUrl = '',
  seasonKey,
  latestSeason = null,
  favorite = false,
  favoritePending = false,
  onFavoriteToggle,
  onSearch,
  onLeague,
  backLabel = 'חזרה לליגה',
}) {
  const resolvedTeamUrl = String(teamUrl || team?.teamUrl || '').trim()
  const headerLeagueContext = [
    latestSeason?.leagueName || team?.leagueName,
    latestSeason?.ageGroupLabel || latestSeason?.ageGroupId || team?.ageGroupLabel || team?.ageGroupId,
    latestSeason?.seasonKey || seasonKey,
  ].filter(Boolean).join(' · ') || '-'
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

        {resolvedTeamUrl ? (
          <Box
            component='a'
            href={resolvedTeamUrl}
            target='_blank'
            rel='noopener noreferrer'
            referrerPolicy='no-referrer'
            aria-label={`פתיחת קישור הקבוצה ${team.name || ''}`}
            sx={sx.pageTitleLink}
          >
            <Typography data-team-title level='h1' sx={sx.pageTitle}>
              {team.name}
            </Typography>
          </Box>
        ) : (
          <Typography level='h1' sx={sx.pageTitle}>
            {team.name}
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
          {headerLeagueContext}
        </Box>
      </Box>
    </PageHeader>
  )
}



