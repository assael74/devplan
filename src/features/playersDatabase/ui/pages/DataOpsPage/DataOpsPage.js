// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsPage.js

import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
} from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PageHeader from '../../components/page/PageHeader.js'
import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  resolveDataOpsReturnPath,
} from '../../logic/routeBuilders.js'
import DataOpsAuditWorkspace from './DataOpsAuditWorkspace.js'
import { DataOpsSummary, DataOpsTabs } from './DataOpsNavigation.js'
import {
  DataOpsCollection,
  DataOpsMaintenance,
  DataOpsOverview,
  DataOpsReceipts,
} from './DataOpsSections.js'
import useWriteActionReceipts from './hooks/useWriteActionReceipts.js'
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'

const PAGE_TITLES = {
  overview: 'מצב כללי של הדאטה',
  entity: 'בדיקת סנכרון לפי ישות',
  collection: 'בדיקת קולקשיין',
  receipts: 'תיקון קבלות',
  maintenance: 'ניקוי ותחזוקת נתונים',
}

function DataOpsContent({ activeTab, onNavigate, receipts }) {
  if (activeTab === 'overview') return <DataOpsOverview onNavigate={onNavigate} />
  if (activeTab === 'collection') return <DataOpsCollection />
  if (activeTab === 'receipts') return <DataOpsReceipts model={receipts} />
  if (activeTab === 'maintenance') {
    return (
      <DataOpsMaintenance
        onNavigate={onNavigate}
        onCompleted={receipts.reload}
      />
    )
  }
  return <DataOpsAuditWorkspace />
}

export default function DataOpsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('entity')
  const receipts = useWriteActionReceipts()
  const title = PAGE_TITLES[activeTab]
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    { label: 'ניהול הדאטה' },
  ])
  const returnPath = resolveDataOpsReturnPath(location.state)

  const actions = (
    <Box sx={sx.headerActions}>
      <Button
        type='button'
        variant='outlined'
        startDecorator={iconUi({ id: 'back', size: 'sm' })}
        onClick={() => navigate(returnPath)}
        sx={sx.backButton}
      >
        חזרה לעמוד הקודם
      </Button>
    </Box>
  )

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <PageHeader breadcrumbs={breadcrumbs} actions={actions}>
          <Box sx={sx.headerTitleRow}>
            <Box sx={sx.headerIcon}>
              {iconUi({ id: 'playersDatabase', size: 'lg' })}
            </Box>
            <Typography level='h2'>{title}</Typography>
          </Box>
        </PageHeader>

        <DataOpsTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          receiptCount={receipts.receipts.length}
        />

        <Box sx={sx.contentArea}>
          <DataOpsSummary
            openReceipts={receipts.receipts.filter(receipt => receipt.status === 'open').length}
          />

          <Box
            className={activeTab === 'entity' ? undefined : 'dpScrollThin'}
            sx={[sx.contentSlot, activeTab !== 'entity' && sx.sectionScroll]}
          >
            <DataOpsContent
              activeTab={activeTab}
              onNavigate={setActiveTab}
              receipts={receipts}
            />
          </Box>
        </Box>
      </Box>
    </PlayersDatabaseLayout>
  )
}
