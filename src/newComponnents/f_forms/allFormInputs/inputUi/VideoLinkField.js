import React from 'react';
import { FormControl, FormLabel, FormHelperText, Input } from '@mui/joy';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { cleanVideoLink } from '../../../x_utils/cleanVideoLink.js'

export default function VideoLinkField({
  onChange,
  value = '',
  size = 'sm',
  required = false,
  disabled = false,
  label = 'קישור לוידאו',
}) {

  const isValidDriveLink = cleanVideoLink(value);

  const handleBlur = () => {
    const cleaned = cleanVideoLink(value);
    if (cleaned !== value) {
      onChange(cleaned);
    }
  };

  return (
    <FormControl required={required}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Input
        type="url"
        size={size}
        value={value}
        autoComplete="off"
        disabled={disabled}
        onBlur={handleBlur}
        placeholder="קישור וידאו"
        startDecorator={<VideoLibraryIcon />}
        onChange={(e) => onChange(e.target.value)}
      />
      <FormHelperText sx={{ fontSize: '11px', color: isValidDriveLink ? 'success.600' : 'danger.600' }}>
        {isValidDriveLink ? (
          <>
            ✔ הקישור נראה תקין.<br />
            🟡 ודא שהקובץ משותף לצפייה לכל מי שיש את הקישור  ־ Google Drive . 
          </>
        ) : (
          'יש להדביק קישור תקף מגוגל דרייב'
        )}
      </FormHelperText>
    </FormControl>
  );
}
