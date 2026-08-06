// features/playersDatabase/ui/pages/searchPage/SearchHeader.js

import { Box, Button, Stack, Typography } from '@mui/joy'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { searchHeaderSx as sx } from './sx/searchHeader.sx.js'

export default function SearchHeader({
  breadcrumbs,
  onLeagues,
  onReport,
  reportDisabled = false,
}) {
  return (
    <Box sx={sx.root}>
      <Stack sx={sx.copy}>
        <Breadcrumbs items={breadcrumbs} />

        <Typography level='h1' sx={sx.title}>
          חיפוש במאגר
        </Typography>
      </Stack>

      <Stack direction='row' spacing={1} sx={sx.actions}>
        <Button
          variant='solid'
          disabled={reportDisabled}
          sx={sx.reportButton}
          startDecorator={iconUi({ id: 'print', size: 'sm' })}
          onClick={onReport}
        >
          תצוגה ופרסום דוח
        </Button>

        <Button
          variant='outlined'
          sx={sx.leaguesButton}
          startDecorator={iconUi({ id: 'back', size: 'sm' })}
          onClick={onLeagues}
        >
          פריסת ליגות
        </Button>
      </Stack>
    </Box>
  )
}
