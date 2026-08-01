// src/features/reports/dashboard/DashboardPage.js

import Box from '@mui/joy/Box'

import DashboardHeader from './components/DashboardHeader.js'
import ReportView from './components/ReportView.js'
import PublicationActionModal from './components/PublicationActionModal.js'
import EditDbSearchMetadataModal from './components/EditDbSearchMetadataModal.js'
import DashboardSidebar from './components/sidebar/DashboardSidebar.js'
import useDashboardPageModel from './dashboardPage.model.js'
import { pageSx as sx } from './sx/page.sx.js'

export default function DashboardPage() {
  const model = useDashboardPageModel()

  return (
    <Box sx={sx.page}>
      <Box sx={sx.workspace}>
        <DashboardHeader title={model.title} subtitle={model.subtitle} />

        <ReportView model={model} />
      </Box>

      <DashboardSidebar
        reports={model.filteredReports}
        categoryOptions={model.categoryOptions}
        selectedCategoryId={model.selectedCategoryId}
        selectedReportId={model.selectedReportId}
        selectedPublicationId={model.selectedPublicationId}
        openReportIds={model.openReportIds}
        onPublicationSelect={model.onPublicationSelect}
        onCategorySelect={model.onCategorySelect}
        onReportToggle={model.onReportToggle}
        onPublicationShare={model.onPublicationShare}
        onPublicationStop={model.onPublicationStop}
        onPublicationDelete={model.onPublicationDelete}
      />

      <EditDbSearchMetadataModal
        open={model.editDbSearchModal.open}
        publication={model.editDbSearchModal.publication}
        loading={model.editDbSearchModal.loading}
        onClose={model.closeDbSearchMetadataEditor}
        onSave={model.saveDbSearchMetadata}
      />

      <PublicationActionModal
        open={model.publicationActionModal.open}
        action={model.publicationActionModal.action}
        publication={model.publicationActionModal.publication}
        loading={model.publicationActionModal.loading}
        onClose={model.closePublicationActionModal}
        onConfirm={model.confirmPublicationAction}
      />
    </Box>
  )
}
