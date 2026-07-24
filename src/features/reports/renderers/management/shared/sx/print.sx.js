// src/features/hub/teamProfile/sharedUi/management/print/shared/sx/print.sx.js

import { printDesktopSx } from './print.desktop.sx.js'
import { printMobileSx } from './print.mobile.sx.js'
import { printPdfSx } from './print.pdf.sx.js'

const isPdfPresentation = presentation => (
  presentation === 'pdf' ||
  presentation === 'print'
)

export const getPrintSx = ({ isMobile, presentation }) => {
  if (isPdfPresentation(presentation)) {
    return printPdfSx
  }

  if (isMobile) {
    return printMobileSx
  }

  return printDesktopSx
}
