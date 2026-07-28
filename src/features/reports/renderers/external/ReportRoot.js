// features/reports/renderers/external/ReportRoot.js

import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import {
  ReportShell,
  REPORT_STATUS,
} from '../../../../ui/patterns/reports/index.js'

import ReportContent from './ReportContent.js'
import { EXTERNAL_REPORT_BRAND } from './reportBrand.js'

function getMeta(model = {}) {
  return model.meta || {}
}

export default function ReportRoot({
  payload = {},
  presentation = 'url',
  device = '',
  actions = null,
  reportOptions = [],
  selectedReportValue = null,
  onReportChange = null,
}) {
  const theme = useTheme()
  const mediaMobile = useMediaQuery(theme.breakpoints.down('md'))
  const resolvedDevice = device || (mediaMobile ? 'mobile' : 'desktop')
  const meta = getMeta(payload)

  return (
    <ReportShell
      title={meta.title || 'מפרט חיצוני'}
      reportDate={meta.reportDate || ''}
      reportType={payload.reportType}
      presentation={presentation}
      isMobile={resolvedDevice === 'mobile'}
      status={REPORT_STATUS.ACTIVE}
      entity={payload.entity || null}
      showEntity={meta.showEntity !== false}
      metaItems={Array.isArray(meta.items) ? meta.items : []}
      metaColumns={Math.min(Number(meta.columns) || 2, 4)}
      brand={EXTERNAL_REPORT_BRAND}
      actions={actions}
      reportOptions={reportOptions}
      selectedReportValue={selectedReportValue}
      onReportChange={onReportChange}
    >
      <ReportContent model={payload} />
    </ReportShell>
  )
}
