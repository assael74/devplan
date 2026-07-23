// features/playersDatabase/ui/pages/searchPage/SearchHeader.js

import { Box, Button, Stack, Typography } from '@mui/joy'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

export default function SearchHeader({ breadcrumbs, onImport, onLeagues }) {
  return (
    <Box sx={sx.header}>
      <Stack sx={sx.headerCopy}>
        <Breadcrumbs items={breadcrumbs} />

        <Typography level='h1' sx={sx.pageTitle}>
          חיפוש שחקנים
        </Typography>
      </Stack>

      <Stack direction='row' spacing={1} sx={sx.headerActions}>
        <Button
          sx={sx.primaryButton}
          startDecorator={iconUi({ id: 'upload', size: 'sm' })}
          onClick={onImport}
        >
          טעינת מסמכים
        </Button>

        <Button
          variant='outlined'
          sx={sx.secondaryButton}
          startDecorator={iconUi({ id: 'league', size: 'sm' })}
          onClick={onLeagues}
        >
          פריסת ליגות
        </Button>
      </Stack>
    </Box>
  )
}
