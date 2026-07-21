// features/playersDatabase/ui/pages/teamPage/TeamHeader.js

import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/joy'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import ActivityStatusChip from '../../components/status/ActivityStatusChip.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamPageSx as sx } from './sx/teamPage.sx.js'

export default function TeamHeader({
  breadcrumbs,
  team,
  active,
  onSearch,
  onLeague,
}) {
  return (
    <Box sx={sx.header}>
      <Stack sx={sx.headerCopy}>
        <Breadcrumbs items={breadcrumbs} />

        <Box sx={sx.titleRow}>
          <Typography level='h1' sx={sx.pageTitle}>
            {team.name}
          </Typography>

          <Box sx={sx.birthYearChip}>
            שנתון {team.birthYear}
          </Box>
        </Box>
      </Stack>

      <Stack sx={sx.headerActionsPanel}>
        <ActivityStatusChip active={active} />

        <Stack direction='row' spacing={1} sx={sx.headerActions}>
          <Button
            sx={sx.primaryButton}
            startDecorator={iconUi({ id: 'playerDatabase', size: 'sm' })}
            onClick={onSearch}
          >
            מעבר לעמוד חיפוש
          </Button>

          <Button
            variant='outlined'
            sx={sx.secondaryButton}
            startDecorator={iconUi({ id: 'back', size: 'sm' })}
            onClick={onLeague}
          >
            חזרה לליגה
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
