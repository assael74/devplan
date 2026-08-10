// src/features/playersDatabase/ui/components/page/PageHeader.js

import {
  Box,
  Stack,
} from '@mui/joy'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import { pageHeaderSx as sx } from './sx/pageHeader.sx.js'

export default function PageHeader({
  breadcrumbs = [],
  children,
  actions,
  sx: externalSx,
}) {
  return (
    <Box sx={[sx.header, externalSx]}>
      <Stack sx={sx.copy}>
        <Breadcrumbs items={breadcrumbs} />
        {children}
      </Stack>

      {actions ? (
        <Box sx={sx.actions}>
          {actions}
        </Box>
      ) : null}
    </Box>
  )
}
