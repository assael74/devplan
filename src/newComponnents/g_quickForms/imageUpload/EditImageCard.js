import React, { useState, useEffect } from 'react';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { updateButtProps } from './X_Style';
import { Stack, Avatar, Typography, Sheet, Divider, Button, Box, IconButton } from '@mui/joy';
import ImageCropModal from './ImageCropModal';

const objectText = {
  clubs: 'מועדון',
  teams: 'קבוצה',
  players: 'שחקן',
}

export default function EditImageCard({
  value,
  isDirty,
  onChange,
  isMobile,
  handleReset,
  handleSubmit,
  type = 'players',
 }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [openCrop, setOpenCrop] = useState(false);

  if (!value) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    setOpenCrop(true);
  };

  const handleCropDone = (croppedFile) => {
    const preview = URL.createObjectURL(croppedFile);

    setPreviewUrl(preview);

    onChange((prev) => ({
      ...prev,
      photoFile: croppedFile,
      photo: '', // מוודא שה־photo הקודם לא "נשאר"
    }));
  };

  const handleDeletePhoto = (e) => {
    e.stopPropagation()
    setPreviewUrl(null);
    onChange((prev) => ({
      ...prev,
      photo: '',
    }));
  };

  return (
    <>
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
        <Typography level="h6" gutterBottom>
          {`תמונת ${type === 'players' ? 'שחקן' : type === 'teams' ? 'קבוצה' : 'מועדון'}`}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2} alignItems="center">
          <Avatar src={previewUrl || value.photo} sx={{ width: 100, height: 100 }} />

          <Button
            component="label"
            variant="outlined"
            onClick={(e) => e.stopPropagation()}
            sx={{ cursor: !isDirty ? 'not-allowed' : 'pointer' }}
          >
            בחירת תמונה חדשה
            <input type="file" accept="image/*" hidden onChange={handleFileChange} />
          </Button>

        </Stack>

        {/* מודאל Crop */}
        <ImageCropModal
          imageSrc={cropSrc}
          open={openCrop}
          onClose={() => setOpenCrop(false)}
          onCropDone={handleCropDone}
        />
      </Sheet>
      <Box sx={{ mt: 2, pt: 2, display: 'flex', gap: 1, flexDirection: 'row-reverse' }}>
        <Button {...updateButtProps(type, isMobile)} onClick={handleSubmit} disabled={!isDirty}>
           עדכן תמונת {objectText[type]}
        </Button>
        {(previewUrl || value.photo) && (
          <Button
            variant="soft"
            color="danger"
            size="sm"
            onClick={handleDeletePhoto}
          >
            🗑 מחיקת תמונה
          </Button>
        )}
      </Box>
    </>
  );
}
