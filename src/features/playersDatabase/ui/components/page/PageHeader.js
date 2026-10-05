// src/features/playersDatabase/ui/components/page/PageHeader.js

import {
  Box,
  Stack,
} from '@mui/joy'
import { useLocation } from 'react-router-dom'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../../logic/routeBuilders.js'
import DataOpsQuickAccessButton from './DataOpsQuickAccessButton.js'
import { pageHeaderSx as sx } from './sx/pageHeader.sx.js'

export default function PageHeader({
  breadcrumbs = [],
  children,
  actions,
  sx: externalSx,
}) {
  const location = useLocation()
  const showDataOpsAccess = location.pathname !== PLAYERS_DATABASE_UI_ROUTES.dataOps

  return (
    <Box sx={[sx.header, externalSx]}>
      <Stack sx={sx.copy}>
        <Breadcrumbs items={breadcrumbs} />
        {children}
      </Stack>

      {actions || showDataOpsAccess ? (
        <Box sx={sx.actions}>
          {showDataOpsAccess ? <DataOpsQuickAccessButton /> : null}
          {actions}
        </Box>
      ) : null}
    </Box>
  )
}
