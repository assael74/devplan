// src/ui/entityImage/EntityImageCrop.js

import React, { useCallback, useMemo, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Modal, ModalDialog, Stack, Button, Typography } from '@mui/joy'
import { cropImageToFile } from './entityImage.logic.js'

const cropDialogSx = {
  width: '92vw',
  height: { xs: '72vh', sm: '70vh' },
  maxWidth: 860,
  p: 1,
  borderRadius: 14,
  bgcolor: '#000',
  overflow: 'hidden',
  zIndex: 1901,
}

const cropAreaSx = {
  position: 'relative',
  flex: 1,
  minHeight: 240,
}

const footerSx = {
  p: 1,
  bgcolor: 'rgba(0,0,0,0.6)',
  borderTop: '1px solid rgba(255,255,255,0.12)',
}

export default function EntityImageCrop({ open, imageSrc, aspect = 1, onCancel, onDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [pending, setPending] = useState(false)

  const canRender = useMemo(() => open && !!imageSrc, [open, imageSrc])

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const handleDone = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setPending(true)
    try {
      const file = await cropImageToFile(imageSrc, croppedAreaPixels)
      onDone?.(file)
    } finally {
      setPending(false)
    }
  }, [imageSrc, croppedAreaPixels, onDone])

  return (
    <Modal
      open={!!canRender}
      onClose={pending ? undefined : onCancel}
      slotProps={{ backdrop: { sx: { zIndex: 1900 } } }}
    >
      <ModalDialog sx={{ ...cropDialogSx, display: 'flex', flexDirection: 'column' }}>
        <div style={cropAreaSx}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <Stack direction="row" spacing={1} justifyContent="space-between" sx={footerSx}>
          <Typography level="body-sm" sx={{ color: '#fff', opacity: 0.85 }}>
            חיתוך תמונה (ריבוע)
          </Typography>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="neutral" disabled={pending} onClick={onCancel}>
              ביטול
            </Button>
            <Button variant="solid" disabled={pending || !croppedAreaPixels} onClick={handleDone}>
              אישור
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  )
}
