import React from 'react';
import { Box, Typography, Divider, IconButton, Tooltip } from '@mui/joy';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';

export default function HeaderSection({
  title = '',
  sectionId = '',
  isEditing = false,
  onToggle = () => {},
  iconId = 'info',
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', direction: 'rtl', mb: 1 }}>
      {/* כפתור עריכה */}
      <Tooltip title={isEditing ? 'ביטול עריכה' : 'ערוך'}>
        <IconButton
          variant="solid"
          size="sm"
          color={isEditing ? 'danger' : 'neutral'}
          onClick={() => onToggle(sectionId)}
          sx={{ flexShrink: 0 }}
        >
          {iconUi({ id: isEditing ? 'close' : 'edit' })}
        </IconButton>
      </Tooltip>

      {/* כותרת עם Divider */}
      <Box sx={{ flexGrow: 1, mx: 1, ml: -4, mr: 4 }}>
        <Divider>
          <Typography level="title-md" fontWeight="lg">
            {title}
          </Typography>
        </Divider>
      </Box>

      {/* איזון לצד שמאל */}
      <Box sx={{ width: 32 }} />
    </Box>
  );
}
