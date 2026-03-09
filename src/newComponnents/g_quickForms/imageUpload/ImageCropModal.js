import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { boxCropModalProps } from './X_Style'
import { getCroppedImg } from './helpers/cropImage';
import { Modal, Box, Button, Stack } from '@mui/joy';

export default function ImageCropModal({ imageSrc, open, onClose, onCropDone }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async (e) => {
    e.stopPropagation()
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onCropDone(croppedImage);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} slotProps={{ backdrop: { sx: { zIndex: 1700 } }}}>
      <Box {...boxCropModalProps} onClick={(e) => e.stopPropagation()}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1} // ריבוע
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />

        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button variant="outlined" onClick={onClose}>ביטול</Button>
          <Button onClick={handleDone}>אישור</Button>
        </Stack>
      </Box>
    </Modal>
  );
}
