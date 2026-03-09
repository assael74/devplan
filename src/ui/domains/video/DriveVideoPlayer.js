// src/ui/video/DriveVideoPlayer.js
import React, { useMemo, useRef, useState } from 'react'
import {
  Box,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogActions,
  IconButton,
  Tooltip,
  ModalClose,
  Snackbar,
} from '@mui/joy'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DriveVideoEmbed from './DriveVideoEmbed'
import { getDrivePreviewUrl } from '../../../shared/media/driveLinks'
import { driveVideoPlayerSx as sx } from './driveVideoPlayer.sx'

export default function DriveVideoPlayer({
  open,
  onClose,
  videoLink,
  videoName,
  variant = 'general',
}) {
  const containerRef = useRef(null)
  const isAnalysis = variant === 'analysis'

  const previewUrl = useMemo(() => getDrivePreviewUrl(videoLink), [videoLink])
  const [toast, setToast] = useState({ open: false, msg: '' })

  const embedProps = isAnalysis
    ? { height: 520, radius: 10 }
    : { height: 520, radius: 14 }

  const dialogVariantSx = isAnalysis ? sx.dialogAnalysis : sx.dialogGeneral

  const handleFullScreen = () => {
    const el = containerRef.current
    if (!el) return
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen
    if (req) req.call(el)
  }

  const handleCopy = async () => {
    try {
      if (!previewUrl) return
      await navigator.clipboard.writeText(previewUrl)
      setToast({ open: true, msg: 'הקישור הועתק (ודא הרשאות צפייה ב-Drive)' })
    } catch (e) {
      setToast({ open: true, msg: 'שגיאה בהעתקה' })
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} sx={sx.modal}>
        <ModalDialog sx={{ ...sx.dialogBase(isAnalysis), ...dialogVariantSx }}>
          <DialogTitle sx={sx.title}>{videoName}</DialogTitle>
          <ModalClose sx={sx.close} variant="outlined" />

          <Box ref={containerRef} sx={sx.videoWrap}>
            <DriveVideoEmbed link={videoLink} {...embedProps} />
          </Box>

          <DialogActions sx={sx.actions}>
            <Tooltip title="מסך מלא">
              <IconButton sx={sx.actionBtn} size="sm" variant="soft" onClick={handleFullScreen}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="העתק קישור לשיתוף">
              <IconButton sx={sx.actionBtn} size="sm" variant="soft" onClick={handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </DialogActions>
        </ModalDialog>
      </Modal>

      <Snackbar
        open={toast.open}
        onClose={() => setToast({ open: false, msg: '' })}
        autoHideDuration={2500}
        variant="soft"
        sx={sx.snackbar}
      >
        {toast.msg}
      </Snackbar>
    </>
  )
}
