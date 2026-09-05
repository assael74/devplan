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
  favorite = false,
  favoritePending = false,
  onFavoriteToggle,
  onSearch,
  onLeague,
}) {
  const resolvedTeamUrl = String(teamUrl || team?.teamUrl || '').trim()
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
          חזרה לליגה
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
        />

        <Box sx={[sx.contextChip, sx.birthYearChip]}>
          שנתון {team.birthYear}
        </Box>

        <Box sx={sx.contextChip}>
          {[team.leagueName, team.ageGroupLabel || team.ageGroupId]
            .filter(Boolean)
            .join(' · ') || '-'}
        </Box>
      </Box>
    </PageHeader>
  )
}



