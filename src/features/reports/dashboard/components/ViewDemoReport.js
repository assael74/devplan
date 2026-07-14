// src/features/reports/dashboard/components/ViewDemoReport.js

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import ManagementReportRoot from '../../../hub/teamProfile/sharedUi/management/print/ReportRoot.js'
import TeamPlayersPrintReport from '../../../hub/teamProfile/sharedUi/players/print/ReportRoot.js'

import {
  TEAM_PLAYERS_PRINT_MODES,
} from '../../../hub/teamProfile/sharedLogic/players/print/index.js'

import {
  PLAYER_REPORT_OPTIONS,
  buildDemoInputModel,
  isManagementPreviewReport,
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
  const resolvedPlayerMode = previewPlayerMode
  const isPlayersPreview = isPlayersPreviewReport(report, publication)
  const isManagementPreview = isManagementPreviewReport(report)

  useEffect(() => {
    const nextMode = resolvePlayerPreviewMode(report, publication)

    if (nextMode) {
      setPreviewPlayerMode(nextMode)
    }
  }, [publication, report])

  const playerReportRootProps = useMemo(() => {
    if (!isPlayersPreview) return null

    return {
      inputModel: buildDemoInputModel({ mode: resolvedPlayerMode, entity, publication }),
      presentation: 'url',
      device: resolvedIsMobile ? 'mobile' : 'desktop',
      reportOptions: PLAYER_REPORT_OPTIONS,
      selectedReportValue: resolvedPlayerMode,
      onReportChange: setPreviewPlayerMode,
    }
  }, [ entity, isPlayersPreview, publication, resolvedIsMobile, resolvedPlayerMode ])

  const managementReportRootProps = useMemo(() => {
    if (!isManagementPreview) return null

    return {
      team: entity || {},
      draft: null,
      presentation: 'url',
      isMobile: resolvedIsMobile,
    }
  }, [ entity, isManagementPreview, resolvedIsMobile ])

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
                הדוח המוצג כאן הוא תצוגה מקדימה בלבד. הדוח שפורסם נטען רק בלחיצה על &quot;פתח דוח&quot;.
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
        {playerReportRootProps ? (
          <Box
            sx={{
              ...sx.demoReportRoot,
              ...(resolvedIsMobile ? sx.demoReportRootMobile : {}),
            }}
          >
            <TeamPlayersPrintReport {...playerReportRootProps} />
          </Box>
        ) : managementReportRootProps ? (
          <Box
            sx={{
              ...sx.demoReportRoot,
              ...(resolvedIsMobile ? sx.demoReportRootMobile : {}),
            }}
          >
            <ManagementReportRoot {...managementReportRootProps} />
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
