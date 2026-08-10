// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterHeader.js

import {
  Button,
  Stack,
  Typography,
} from '@mui/joy'

import PageHeader from '../../components/page/PageHeader.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leagueCenterHeaderSx as sx } from './sx/leagueCenterHeader.sx.js'

export default function LeagueCenterHeader({
  breadcrumbs,
  onNavigateToSearch,
  onNavigateToEntry,
}) {
  const actions = (
    <Stack direction='row' spacing={1} sx={sx.headerActions}>
      <Button
        sx={sx.primaryButton}
        startDecorator={iconUi({id: 'playerDatabase', size: 'sm'})}
        onClick={onNavigateToSearch}
      >
        מעבר לעמוד חיפוש
      </Button>

      <Button
        variant='outlined'
        sx={sx.secondaryButton}
        startDecorator={iconUi({id: 'back', size: 'sm'})}
        onClick={onNavigateToEntry}
      >
        חזרה לדף הפתיחה
      </Button>
    </Stack>
  )

  return (
    <PageHeader
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <Typography level='h1' sx={sx.pageTitle}>
        ניהול נתוני ליגות
      </Typography>
    </PageHeader>
  )
}
