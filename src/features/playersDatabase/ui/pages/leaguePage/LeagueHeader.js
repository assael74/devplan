// src/features/playersDatabase/ui/pages/leaguePage/LeagueHeader.js

import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/joy'

import PageHeader from '../../components/page/PageHeader.js'
import ActivityStatusChip from '../../components/page/ActivityStatusChip.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueHeaderSx as sx } from './sx/leagueHeader.sx.js'

function TitleChip({ children, tone = 'primary' }) {
  return (
    <Box
      sx={[
        sx.titleChip,
        tone === 'tertiary' && sx.titleChipTertiary,
      ]}
    >
      {children}
    </Box>
  )
}

export default function LeagueHeader({
  breadcrumbs = [],
  title = '',
  region = '',
  ageGroup = '',
  birthYear = '',
  active = false,
  seasonKey = '',
  onSearch,
  onBack,
}) {
  const seasonChipLabel = [
    seasonKey ? `עונה ${seasonKey}` : '',
    birthYear ? `שנתון ${birthYear}` : '',
  ].filter(Boolean).join(' · ')

  const actions = (
    <Stack sx={sx.actionsPanel}>
      <ActivityStatusChip
        active={active}
        activeLabel='ליגה פעילה'
        inactiveLabel='ליגה לא פעילה'
      />

      <Stack direction='row' spacing={1} sx={sx.actions}>
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
          onClick={onBack}
        >
          חזרה למרכז ליגות
        </Button>
      </Stack>
    </Stack>
  )

  return (
    <PageHeader
      breadcrumbs={breadcrumbs}
      sx={sx.header}
      actions={actions}
    >
      <Box sx={sx.titleRow}>
        <Typography level='h1' sx={sx.pageTitle}>
          {title}
          {region ? (
            <Box component='span' sx={sx.titleRegion}>
              {' - '}
              {region}
            </Box>
          ) : null}
        </Typography>

        <Box sx={sx.titleChips}>
          <TitleChip tone='tertiary'>{ageGroup}</TitleChip>
          {seasonChipLabel ? (
            <TitleChip>{seasonChipLabel}</TitleChip>
          ) : null}
        </Box>
      </Box>
    </PageHeader>
  )
}
