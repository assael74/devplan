import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
} from '@mui/joy';
import MoreVert from '@mui/icons-material/MoreVert';
import { thumbnailBoxProps, menuButtonProps } from './X_Style'
import { iconUi } from '../b_styleObjects/icons/IconIndex';

export default function VideoActionsCell({ link, onWatch }) {
  const fileId =
    link?.match(/\/d\/([a-zA-Z0-9_-]{10,})/)?.[1] ||
    link?.match(/id=([a-zA-Z0-9_-]{10,})/)?.[1];

  const thumbnail = fileId
    ? `https://drive.google.com/thumbnail?id=${fileId}`
    : null;

  const handleDownload = () => {
    const fileId =
      link?.match(/\/d\/([a-zA-Z0-9_-]{10,})/)?.[1] ||
      link?.match(/id=([a-zA-Z0-9_-]{10,})/)?.[1];

    const downloadUrl = fileId
      ? `https://drive.google.com/uc?export=download&id=${fileId}`
      : link;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      alert('🔗 הקישור הועתק');
    } catch (err) {
      alert('שגיאה בהעתקה');
    }
  };

  return (
    <Box position="relative" display="inline-block" width="100%" >
      {/* התמונה */}
      {thumbnail && (
        <Box src={thumbnail} onClick={() => onWatch()} {...thumbnailBoxProps} />
      )}

      {/* כפתור בפינה */}
      <Box position="absolute" top={4} right={4} zIndex={2}>
        <Dropdown>
          <MenuButton {...menuButtonProps}>
            <MoreVert sx={{ fontSize: '16px', color: '#fff' }} />
          </MenuButton>
          <Menu>
            <MenuItem onClick={handleDownload}>
              {iconUi({ id: 'download' })} הורדה
            </MenuItem>
            <MenuItem onClick={handleCopy}>
              {iconUi({ id: 'share' })} העתק קישור
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
    </Box>
  );
}
