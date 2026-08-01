import {
  Box,
  Button,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy'

import { devPlanColors } from '../../../../ui/core/theme/Colors.js'
import PublicReportRenderer from '../../public/PublicReportRenderer.js'

export default function DbSearchReportPreviewModal({
  open,
  draft,
  busy = false,
  error = '',
  onPublish,
  onClose,
}) {
  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <ModalDialog
        layout='fullscreen'
        sx={{
          p: 0,
          bgcolor: devPlanColors.primaryLight,
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
            borderBottom: `1px solid ${devPlanColors.primaryLight}`,
          }}
        >
          <Box>
            <Typography level='title-md' sx={{ color: devPlanColors.primary }}>
              תצוגה מקדימה לדוח
            </Typography>
            <Typography level='body-xs' sx={{ color: devPlanColors.secondary }}>
              לאחר הפרסום הדוח ייפתח בכרטיסייה חדשה עם כתובת URL קבועה.
            </Typography>
            {error ? (
              <Typography level='body-xs' color='danger' sx={{ mt: 0.5 }}>
                {error}
              </Typography>
            ) : null}
          </Box>

          <Button
            loading={busy}
            disabled={!draft || busy || typeof onPublish !== 'function'}
            onClick={onPublish}
            sx={{
              ml: 5,
              minWidth: '132px',
              bgcolor: devPlanColors.tertiary,
              '&:hover': { bgcolor: devPlanColors.primary },
            }}
          >
            {busy ? 'מפרסם דוח' : 'פרסום ופתיחת דוח'}
          </Button>
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
