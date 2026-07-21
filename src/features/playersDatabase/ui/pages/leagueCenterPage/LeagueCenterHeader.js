// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterHeader.js

import { Box, Button, Stack, Typography } from '@mui/joy'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueCenterPageSx as sx } from './sx/leagueCenterPage.sx.js'

export default function LeagueCenterHeader({ breadcrumbs, onNavigateToSearch, onNavigateToEntry }) {
  return (
    <Box sx={sx.header}>
      <Stack sx={sx.headerCopy}>
        <Breadcrumbs items={breadcrumbs} />

        <Typography level='h1' sx={sx.pageTitle}>
          מרכז ליגות
        </Typography>
      </Stack>

      <Stack direction='row' spacing={1} sx={sx.headerActions}>
        <Button
          sx={sx.primaryButton}
          startDecorator={iconUi({ id: 'playerDatabase', size: 'sm' })}
          onClick={onNavigateToSearch}
        >
          מעבר לעמוד חיפוש
        </Button>

        <Button
          variant='outlined'
          sx={sx.secondaryButton}
          startDecorator={iconUi({ id: 'back', size: 'sm' })}
          onClick={onNavigateToEntry}
        >
          חזרה לדף הפתיחה
        </Button>
      </Stack>
    </Box>
  )
}
