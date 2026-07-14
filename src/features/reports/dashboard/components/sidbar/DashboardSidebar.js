// src/features/reports/dashboard/components/sidbar/DashboardSidebar.js

import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import { getFullDateIl } from '../../../../../shared/format/dateUtiles.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import { sidebarSx as sx } from './sx/sidebar.sx.js'
import CategorySection from './CategorySection.js'
import ReportsSection from './ReportsSection.js'

function formatPublicationDate(publication = {}) {
  const rawDate = publication.publishedAt || ''
  const dateValue = typeof rawDate?.toDate === 'function' ? rawDate.toDate() : rawDate
  const formattedDate = getFullDateIl(dateValue, false)

  return formattedDate && formattedDate !== 'ג€”'
    ? formattedDate
    : 'תאריך לא זמין'
}

export default function DashboardSidebar({
  reports = [],
  categoryOptions = [],
  selectedCategoryId = 'all',
  selectedReportId = '',
  selectedPublicationId = '',
  openReportIds = [],
  onPublicationSelect,
  onCategorySelect,
  onReportToggle,
  onPublicationShare,
  onPublicationStop,
  onPublicationDelete,
}) {
  return (
    <Box sx={sx.sidebar} className='dpScrollThin'>
      <Box sx={sx.sidebarHeader}>
        <Box sx={sx.sidebarHeading}>
          <Box sx={sx.sidebarHeadingText}>
            <Typography level='title-md' sx={sx.sidebarTitle}>
              בחירת דוח
            </Typography>

            <Typography level='body-xs' sx={sx.sidebarSubtitle}>
              בחר סוג דוח ולאחר מכן פרסום
            </Typography>
          </Box>

          <Box sx={sx.sidebarIcon}>
            {iconUi({ id: 'report', size: 'lg' })}
          </Box>
        </Box>

      </Box>

      <CategorySection
        categoryOptions={categoryOptions}
        onCategorySelect={onCategorySelect}
        selectedCategoryId={selectedCategoryId}
      />

      <Box sx={sx.reportsShell}>
        <ReportsSection
          reports={reports}
          openReportIds={openReportIds}
          onReportToggle={onReportToggle}
          selectedReportId={selectedReportId}
          onPublicationSelect={onPublicationSelect}
          selectedPublicationId={selectedPublicationId}
          onPublicationShare={onPublicationShare}
          onPublicationStop={onPublicationStop}
          onPublicationDelete={onPublicationDelete}
        />
      </Box>
    </Box>
  )
}
