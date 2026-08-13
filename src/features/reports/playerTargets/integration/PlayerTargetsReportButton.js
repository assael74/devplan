// src/features/reports/playerTargets/integration/PlayerTargetsReportButton.js

import React from 'react'
import {
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { devPlanColors } from '../../../../ui/core/theme/Colors.js'

import {
  publishPlayerTargetsReport,
} from '../publishPlayerTargetsReport.js'

function getPublishTooltip(publishState) {
  if (publishState.error) {
    return 'יצירת הקישור נכשלה'
  }

  if (publishState.loading) {
    return 'מייצרים דוח שחקן חדש'
  }

  if (publishState.success && publishState.debug) {
    return 'מצב דיבאג: הדוח נבנה ללא כתיבה לפיירסטור'
  }

  if (publishState.success) {
    return 'הדוח נוצר ונפתח בכרטיסיה חדשה'
  }

  return 'צור דוח יעדים ציבורי לשחקן'
}

function closePublishWindow(nextWindow) {
  try {
    if (nextWindow && !nextWindow.closed) {
      nextWindow.close()
    }
  } catch (error) {
    console.warn('[PlayerTargetsReportButton] Failed to close placeholder tab', error)
  }
}

function logPublishDebugResult({ input, result }) {
  console.group('[PlayerTargetsReportButton] Publish debug result')
  console.log('input:', input)
  console.log('result:', result)
  console.groupEnd()
}

function openPublishWindow() {
  if (typeof window === 'undefined') return null

  return window.open('', '_blank')
}

const reportButtonSx = {
  bgcolor: devPlanColors.tertiaryLight,
  color: devPlanColors.primary,
  fontWeight: 700,
  border: '1px solid',
  borderColor: 'rgba(47, 134, 199, 0.22)',
  boxShadow: '0 6px 14px rgba(47, 134, 199, 0.12)',

  '&:hover': {
    bgcolor: devPlanColors.tertiary,
    color: '#fff',
  },

  '&.Mui-disabled': {
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.subText,
    borderColor: 'transparent',
    boxShadow: 'none',
  },
}

const reportIconButtonSx = {
  ...reportButtonSx,
  minWidth: 32,
  minHeight: 32,
}

export default function PlayerTargetsReportButton({
  player,
  team,
  disabled = false,
  iconOnly = false,
}) {
  const [publishState, setPublishState] = React.useState({
    loading: false,
    success: false,
    error: false,
    debug: false,
  })

  const handlePublishReport = async () => {
    if (disabled || publishState.loading) return

    const nextWindow = openPublishWindow()

    if (!nextWindow) {
      setPublishState({
        loading: false,
        success: false,
        error: true,
        debug: false,
      })

      return
    }

    setPublishState({
      loading: true,
      success: false,
      error: false,
      debug: false,
    })

    try {
      const response = await publishPlayerTargetsReport({
        player,
        team,
      })

      const publishResult = response && response.result ? response.result : {}

      if (publishResult.writeSkipped) {
        logPublishDebugResult({
          input: response.input,
          result: publishResult,
        })

        closePublishWindow(nextWindow)

        setPublishState({
          loading: false,
          success: true,
          error: false,
          debug: true,
        })

        return
      }

      const targetUrl = publishResult.currentUrl || ''

      if (!targetUrl) {
        throw new Error('[PlayerTargetsReportButton] Missing currentUrl from publish result')
      }

      nextWindow.location.href = targetUrl

      setPublishState({
        loading: false,
        success: true,
        error: false,
        debug: false,
      })
    } catch (error) {
      console.error('[PlayerTargetsReportButton] Failed to publish report', error)

      closePublishWindow(nextWindow)

      setPublishState({
        loading: false,
        success: false,
        error: true,
        debug: false,
      })
    }
  }

  const publishTooltip = getPublishTooltip(publishState)
  const isDisabled = disabled || publishState.loading
  const icon = publishState.loading ? <CircularProgress size='sm' /> : iconUi({ id: 'share' })

  return (
    <Tooltip title={publishTooltip} placement='top'>
      <span>
        {iconOnly ? (
          <IconButton
            size='sm'
            variant='soft'
            color={publishState.error ? 'danger' : 'primary'}
            disabled={isDisabled}
            onClick={handlePublishReport}
            sx={reportIconButtonSx}
            aria-label='יצירת קישור דוח יעדים ציבורי לשחקן'
          >
            {icon}
          </IconButton>
        ) : (
          <Button
            size='sm'
            variant='soft'
            color={publishState.error ? 'danger' : 'primary'}
            disabled={isDisabled}
            startDecorator={icon}
            onClick={handlePublishReport}
            sx={reportButtonSx}
          >
            צור דוח יעדים
          </Button>
        )}
      </span>
    </Tooltip>
  )
}
