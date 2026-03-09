// 📁 DriveVideoPlayer.js
import React, { useRef, useMemo } from 'react';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { modalDialogProps, iconFullScreenProps, iconCopyProps } from './X_Style';
import {
  Box,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogActions,
  IconButton,
  Tooltip,
  Typography,
  ModalClose,
} from '@mui/joy';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getDrivePreviewLink } from './helpers/getDrivePreviewLink.js';

export default function DriveVideoPlayer({ open, onClose, videoLink, videoName }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const iframeRef = useRef(null);

  const previewUrl = useMemo(() => getDrivePreviewLink(videoLink), [videoLink]);

  const handleFullScreen = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const requestFullScreen =
      iframe.requestFullscreen ||
      iframe.webkitRequestFullscreen ||
      iframe.mozRequestFullScreen ||
      iframe.msRequestFullscreen;

    if (requestFullScreen) {
      requestFullScreen.call(iframe);
    } else {
      alert('הדפדפן שלך לא תומך במסך מלא עבור iframe');
    }
  };

  const handleCopyLink = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl)
        .then(() => alert('הקישור הועתק – ודא שהשיתוף פתוח לצפייה לכולם'))
        .catch(() => alert('שגיאה בהעתקת הקישור'));
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ mx: isMobile ? 1 : 0 }}>
      <ModalDialog {...modalDialogProps}>
        <DialogTitle sx={{ px: 2, pt: 2 }}>{videoName}</DialogTitle>
        <ModalClose variant="outlined" />
        {previewUrl ? (
          <Box>
            <iframe
              ref={iframeRef}
              src={previewUrl}
              width="100%"
              height={isMobile ? 220 : 360}
              style={{ border: 'none', borderRadius: 8 }}
              allow="fullscreen"
            />
          </Box>
        ) : (
          <Typography level="body-md" p={2}>
            לא ניתן להציג את הוידאו – הקישור שגוי או חסר
          </Typography>
        )}
        <DialogActions sx={{ display: 'flex', flexDirection: 'row', py: 2 }}>
          <Tooltip title="מסך מלא">
            <IconButton {...iconFullScreenProps} onClick={handleFullScreen}>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="העתק קישור לשיתוף">
            <IconButton {...iconCopyProps} onClick={handleCopyLink}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
