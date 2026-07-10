// src/features/hub/playerProfile/sharedUi/info/print/PlayerTargetsUrlButton.js

import React from 'react'
import {
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import {
  publishPlayerTargetsReport,
} from '../../../../../reports/flows/players/info/index.js'

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
    console.warn('[PlayerTargetsUrlButton] Failed to close placeholder tab', error)
  }
}

function logPublishDebugResult({ input, result }) {
  console.group('[PlayerTargetsUrlButton] Publish debug result')
  console.log('input:', input)
  console.log('result:', result)
  console.groupEnd()
}

function openPublishWindow() {
  if (typeof window === 'undefined') return null

  return window.open('', '_blank')
}

export default function PlayerTargetsUrlButton({
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
        throw new Error('[PlayerTargetsUrlButton] Missing currentUrl from publish result')
      }

      nextWindow.location.href = targetUrl

      setPublishState({
        loading: false,
        success: true,
        error: false,
        debug: false,
      })
    } catch (error) {
      console.error('[PlayerTargetsUrlButton] Failed to publish report', error)

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
          >
            צור דוח יעדים
          </Button>
        )}
      </span>
    </Tooltip>
  )
}
