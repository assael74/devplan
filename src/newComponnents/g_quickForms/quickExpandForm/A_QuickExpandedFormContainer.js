import React, { useState, useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js'
import useMediaQuery from '@mui/material/useMediaQuery';
import { isGameInPast } from '../../x_utils/dateUtiles.js'
import { wraperBoxProps, typoTitleProps, boxVideoNameProps, boxHeaderProps, boxActionsProps } from './X_Style'
import { addButtProps, addIconButtProps } from './X_Style'
import { buttResetProps, buttSaveProps } from './X_Style'
import { useTheme, Box, Typography, Divider, Button, Stack, Tooltip, IconButton } from '@mui/joy';

export default function QuickExpandedFormContainer({
  title = '',
  children,
  chip,
  type,
  label,
  view,
  isDirty = false,
  onSave = () => {},
  onReset = () => {},
  height = () => 250,
  autoHeight = false,
  minContentHeight = 150,
  maxContentHeight = 250,
  renderMobileContent,
  renderDesktopContent,
  formProps,
  disabled,
  item
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const usableHeight = height(isMobile);

  const shouldShowButton = item?.type === 'games' && isGameInPast(item.gameDate, item.gameHour);

  const contentBoxSx = autoHeight
    ? {}
    : {
        minHeight: minContentHeight,
        maxHeight: maxContentHeight,
        overflowY: 'auto',
        borderRadius: 'md',
        pr: 1.5,
      };

  return (
    <Box {...wraperBoxProps(theme, autoHeight, usableHeight)}>
      <Box>
        <Box {...boxHeaderProps}>
          {/* כותרת קבועה בצד ימין */}
          <Typography {...typoTitleProps(isMobile)}>
            📝 <span style={{ fontWeight: 600, color: 'text.secondary' }}>{label}</span>
            <Box {...boxVideoNameProps(isMobile)} component="span">"{title}"</Box>
          </Typography>

          {/* אינדיקציה דינמית בצד שמאל */}
          {chip && ( <Box> {chip} </Box> )}
        </Box>

        <Divider sx={{ mb: 1 }} />

        <Box sx={{ px: 1.5, ...contentBoxSx }}>
          {renderMobileContent && isMobile
            ? renderMobileContent()
            : renderDesktopContent && !isMobile
            ? renderDesktopContent()
            : children}
        </Box>
      </Box>
      <Box {...boxActionsProps}>
        {!['clubs', 'videos', 'videoAnalysis', 'tags'].includes(type) && (
          <>
            {view === 'profilePlayer' ?
              <Box sx={{ flexGrow: 1, ml: isMobile ? -10 : -140 }}>

              </Box>
              :
              <Box sx={{ flexGrow: 1, ml: isMobile ? -15 : -105 }}>

              </Box>
            }
          </>
        )}
        <Box>
          <Button {...buttResetProps} onClick={onReset} disabled={!isDirty}>
            איפוס
          </Button>
        </Box>
        <Box>
          <Button {...buttSaveProps} onClick={onSave} disabled={!isDirty}>
            שמור
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
