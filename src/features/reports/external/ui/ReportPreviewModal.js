// features/reports/external/ui/ReportPreviewModal.js

import {
  Box,
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy'

import PublicReportRenderer from '../../public/PublicReportRenderer.js'

export default function ReportPreviewModal({
  open,
  draft,
  busy = false,
  publication = null,
  onClose,
}) {
  const currentUrl = publication?.currentUrl || ''

  const copyUrl = async () => {
    if (!currentUrl || typeof navigator === 'undefined' || !navigator.clipboard) return
    await navigator.clipboard.writeText(currentUrl)
  }

  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <ModalDialog
        layout='fullscreen'
        sx={{
          p: 0,
          bgcolor: '#EEF3F7',
          overflow: 'hidden',
        }}
      >
        <ModalClose disabled={busy} sx={{ zIndex: 4 }} />

        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          spacing={1}
          sx={{
            px: 2,
            py: 1.25,
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #D9E2E8',
          }}
        >
          <Box>
            <Typography level='title-md'>תצוגה מקדימה לדוח</Typography>
            <Typography level='body-xs'>תצוגת פיתוח מקומית ללא כתיבה למסד.</Typography>
          </Box>

          <Stack direction='row' spacing={1} sx={{ pl: 5 }}>
            {currentUrl ? (
              <>
                <Button variant='outlined' onClick={copyUrl}>
                  העתקת קישור
                </Button>
                <Button
                  variant='outlined'
                  component='a'
                  href={currentUrl}
                  target='_blank'
                  rel='noreferrer'
                >
                  פתיחת URL
                </Button>
              </>
            ) : null}

          </Stack>
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0, width: '100%', overflow: 'auto' }}>
          {draft ? (
            <PublicReportRenderer
              reportType={draft.reportType}
              payload={draft.reportContent}
              presentation='url'
            />
          ) : null}
        </Box>
      </ModalDialog>
    </Modal>
  )
}
