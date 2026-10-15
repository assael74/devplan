// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsLayout.js

import { useLayoutEffect, useRef } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import focusedSyncAuditVisual from '../../../../../ui/core/images/focusedSyncAudit.png'
import receiptMaintenanceVisual from '../../../../../ui/core/images/receiptMaintenance.png'
import systemAuditVisual from '../../../../../ui/core/images/systemAudit.png'
import PageHeader from '../../components/page/PageHeader.js'
import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
  resolveDataOpsReturnPath,
} from '../../logic/routeBuilders.js'
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'

const pageMetaByPath = {
  [PLAYERS_DATABASE_UI_ROUTES.dataOps]: {
    title: 'בקרת נתונים',
  },
  [PLAYERS_DATABASE_UI_ROUTES.dataOpsAudit()]: {
    title: 'בדיקת סנכרון ממוקדת',
    visualSrc: focusedSyncAuditVisual,
  },
  [PLAYERS_DATABASE_UI_ROUTES.dataOpsSystemAudit]: {
    title: 'בדיקת תקינות כוללת',
    visualSrc: systemAuditVisual,
  },
  [PLAYERS_DATABASE_UI_ROUTES.dataOpsReceipts]: {
    title: 'תחזוקת קבלות',
    visualSrc: receiptMaintenanceVisual,
  },
}

export default function DataOpsLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pageBodyRef = useRef(null)
  const isHome = location.pathname === PLAYERS_DATABASE_UI_ROUTES.dataOps
  const pageMeta = pageMetaByPath[location.pathname] || pageMetaByPath[PLAYERS_DATABASE_UI_ROUTES.dataOps]
  const returnPath = isHome
    ? resolveDataOpsReturnPath(location.state)
    : PLAYERS_DATABASE_UI_ROUTES.dataOps
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    isHome
      ? { label: 'בקרת נתונים' }
      : { label: 'בקרת נתונים', to: PLAYERS_DATABASE_UI_ROUTES.dataOps },
    !isHome ? { label: pageMeta.title } : null,
  ])

  useLayoutEffect(() => {
    if (pageBodyRef.current) pageBodyRef.current.scrollTop = 0
  }, [location.pathname])

  const actions = (
    <Button
      type='button'
      size='sm'
      variant='outlined'
      endDecorator={iconUi({ id: 'back', size: 'sm' })}
      onClick={() => navigate(returnPath, { state: location.state })}
      sx={sx.backButton}
    >
      {isHome ? 'חזרה לעמוד הקודם' : 'חזרה למרכז הבקרה'}
    </Button>
  )

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <PageHeader breadcrumbs={breadcrumbs} actions={actions}>
          <Box sx={sx.headerTitleRow}>
            {pageMeta.visualSrc ? (
              <Box sx={sx.headerVisual}>
                <Box
                  component='img'
                  src={pageMeta.visualSrc}
                  alt=''
                  aria-hidden='true'
                  sx={sx.headerVisualImage}
                />
              </Box>
            ) : (
              <Box sx={sx.headerIcon}>
                {iconUi({ id: 'playersDatabase', size: 'lg' })}
              </Box>
            )}
            <Typography level='h1' sx={sx.headerTitle}>{pageMeta.title}</Typography>
          </Box>
        </PageHeader>

        <Box ref={pageBodyRef} className='dpScrollThin' sx={sx.pageBody}>
          <Box key={location.pathname} sx={sx.routeTransition}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </PlayersDatabaseLayout>
  )
}
