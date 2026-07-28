// src/features/reports/dashboard/components/ViewDemoReport.js

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import PublicReportRenderer from '../../public/PublicReportRenderer.js'
import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../performance/index.js'

import {
  PLAYER_REPORT_OPTIONS,
  buildDemoReportDraft,
  buildManagementDemoDraft,
  buildPlayerTargetsDemoDraft,
  isManagementPreviewReport,
  isPlayerTargetsPreviewReport,
  isPlayersPreviewReport,
  resolvePlayerPreviewMode,
} from '../logic/viewDemoReport.logic.js'

import { demoSx as sx } from './sx/demo.sx.js'

export default function ViewDemoReport({ report, publication, entity }) {
  const initialPlayerMode =
    resolvePlayerPreviewMode(report, publication) ||
    TEAM_PLAYERS_PRINT_MODES.SEASON_PLAN

  const [previewDevice, setPreviewDevice] = useState('desktop')
  const [previewPlayerMode, setPreviewPlayerMode] = useState(initialPlayerMode)

  const resolvedIsMobile = previewDevice === 'mobile'
  const isPlayersPreview = isPlayersPreviewReport(report, publication)
  const isManagementPreview = isManagementPreviewReport(report)
  const isPlayerTargetsPreview = isPlayerTargetsPreviewReport(report)
  const publishedContent = publication && publication.reportContent
    ? publication.reportContent
    : null
  const publishedReportType = publication?.reportType || report?.id || ''

  useEffect(() => {
    const nextMode = resolvePlayerPreviewMode(report, publication)

    if (nextMode) {
      setPreviewPlayerMode(nextMode)
    }
  }, [publication, report])

  const playerPreviewDraft = useMemo(() => {
    if (!isPlayersPreview || publishedContent) return null

    return buildDemoReportDraft({
      mode: previewPlayerMode,
      entity,
      publication,
    })
  }, [
    entity,
    isPlayersPreview,
    previewPlayerMode,
    publication,
    publishedContent,
  ])

  const managementPreviewDraft = useMemo(() => {
    if (!isManagementPreview || publishedContent) return null

    return buildManagementDemoDraft({
      entity,
      publication,
    })
  }, [
    entity,
    isManagementPreview,
    publication,
    publishedContent,
  ])

  const playerTargetsPreviewDraft = useMemo(() => {
    if (!isPlayerTargetsPreview || publishedContent) return null

    return buildPlayerTargetsDemoDraft({
      entity,
      publication,
    })
  }, [
    entity,
    isPlayerTargetsPreview,
    publication,
    publishedContent,
  ])

  const previewDraft =
    playerPreviewDraft ||
    managementPreviewDraft ||
    playerTargetsPreviewDraft

  const rendererReportType = publishedContent
    ? publishedReportType
    : previewDraft?.reportType || ''

  const rendererPayload = publishedContent
    ? publishedContent
    : previewDraft?.reportContent || null

  return (
    <Box sx={sx.previewRoot}>
      <Box sx={sx.previewHeader}>
        <Box sx={sx.previewHeaderMain}>
          <Box sx={sx.previewHeaderIcon}>
            {iconUi({ id: 'view', size: 'sm' })}
          </Box>

          <Box sx={sx.previewHeaderText}>
            <Typography level='title-md' sx={sx.previewTitle}>
              תצוגה מקדימה
            </Typography>

            <Box sx={sx.previewNoticeInline}>
              <Typography level='body-xs' sx={sx.previewNoticeText}>
                {publishedContent
                  ? 'מוצגת הגרסה שפורסמה באמצעות אותו Renderer של הקישור הציבורי.'
                  : isPlayersPreview || isManagementPreview || isPlayerTargetsPreview
                    ? 'מוצגת טיוטה מקומית באמצעות אותו Renderer של הקישור הציבורי.'
                    : 'טרם נבחר פרסום. מוצגת תצוגת הכנה מקומית בלבד.'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={sx.previewDeviceGroup}>
          <Chip
            size='sm'
            variant={previewDevice === 'desktop' ? 'soft' : 'plain'}
            color={previewDevice === 'desktop' ? 'primary' : 'neutral'}
            onClick={() => setPreviewDevice('desktop')}
            sx={sx.previewDeviceChip}
          >
            Desktop
          </Chip>

          <Chip
            size='sm'
            variant={previewDevice === 'mobile' ? 'soft' : 'plain'}
            color={previewDevice === 'mobile' ? 'primary' : 'neutral'}
            onClick={() => setPreviewDevice('mobile')}
            sx={sx.previewDeviceChip}
          >
            Mobile
          </Chip>
        </Box>
      </Box>

      <Box sx={sx.previewCanvas}>
        {rendererPayload && rendererReportType ? (
          <Box
            sx={{
              ...sx.demoReportRoot,
              ...(resolvedIsMobile ? sx.demoReportRootMobile : {}),
            }}
          >
            <PublicReportRenderer
              reportType={rendererReportType}
              payload={rendererPayload}
              presentation='url'
              device={resolvedIsMobile ? 'mobile' : 'desktop'}
              isMobile={resolvedIsMobile}
              reportOptions={
                !publishedContent && isPlayersPreview
                  ? PLAYER_REPORT_OPTIONS
                  : []
              }
              selectedReportValue={
                !publishedContent && isPlayersPreview
                  ? previewPlayerMode
                  : null
              }
              onReportChange={
                !publishedContent && isPlayersPreview
                  ? setPreviewPlayerMode
                  : null
              }
            />
          </Box>
        ) : (
          <Box sx={sx.previewEmpty}>
            <Box sx={sx.previewEmptyIcon}>
              {iconUi({ id: 'report' })}
            </Box>

            <Typography level='title-md' sx={sx.previewEmptyTitle}>
              בחר סוג דוח
            </Typography>

            <Typography level='body-sm' sx={sx.previewEmptyText}>
              לאחר בחירת סוג דוח יוצג כאן השלב המותאם
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
