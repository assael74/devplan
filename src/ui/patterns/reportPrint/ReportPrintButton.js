// src/ui/patterns/reportPrint/ReportPrintButton.js

import React, { useCallback, useRef, useState } from 'react'
import Button from '@mui/joy/Button'
import IconButton from '@mui/joy/IconButton'
import Tooltip from '@mui/joy/Tooltip'
import { useReactToPrint } from 'react-to-print'

import { iconUi } from '../../core/icons/iconUi.js'
import ReportPrintArea from './ReportPrintArea.js'

const printPageStyle = `
  @page {
    size: A4;
    margin: 12mm;
  }

  @media print {
    html,
    body {
      width: auto !important;
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
    }

    #root {
      width: auto !important;
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .dpPrintRoot {
      width: 100% !important;
      max-width: none !important;
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
      position: static !important;
      transform: none !important;
    }

    .dpPrintSection,
    .dpPrintCard,
    .dpPrintRow {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
`

export default function ReportPrintButton({
  label = 'הדפס / PDF',
  tooltip = 'הדפס / שמור PDF',
  documentTitle = 'דוח תובנות',
  disabled = false,
  size = 'sm',
  variant = 'soft',
  color = 'neutral',
  startIcon = 'download',
  iconOnly = false,
  sx = {},
  children,
  renderContent,
}) {
  const contentRef = useRef(null)
  const [printRequested, setPrintRequested] = useState(false)

  const handlePrintDone = useCallback(() => {
    setPrintRequested(false)
  }, [])

  const runPrint = useReactToPrint({
    contentRef,
    documentTitle,
    pageStyle: printPageStyle,
    onAfterPrint: handlePrintDone,
  })

  const handlePrintClick = useCallback(() => {
    if (disabled) return

    setPrintRequested(true)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        runPrint()
      })
    })
  }, [disabled, runPrint])

  const content = typeof renderContent === 'function'
    ? renderContent()
    : children

  const button = iconOnly ? (
    <IconButton
      size={size}
      variant={variant}
      color={color}
      disabled={disabled}
      onClick={handlePrintClick}
      sx={{ ...sx, border: '1px solid', borderColor: 'divider' }}
    >
      {iconUi({ id: startIcon })}
    </IconButton>
  ) : (
    <Button
      size={size}
      variant={variant}
      color={color}
      disabled={disabled}
      startDecorator={iconUi({ id: startIcon })}
      onClick={handlePrintClick}
      sx={{ ...sx, border: '1px solid', borderColor: 'divider' }}
    >
      {label}
    </Button>
  )

  return (
    <>
      {iconOnly ? (
        <Tooltip title={tooltip} variant="soft">
          <span>{button}</span>
        </Tooltip>
      ) : button}

      {printRequested && (
        <ReportPrintArea contentRef={contentRef}>
          {content}
        </ReportPrintArea>
      )}
    </>
  )
}
