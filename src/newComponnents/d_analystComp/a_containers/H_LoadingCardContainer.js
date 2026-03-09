import React from 'react';
import { cardLoadProps, typoTitleLoadProps, chipLoadProps } from './containersStyle/H_LoadingCardStyle.js'
import { boxCardLoadProps, boxTitleLoadProps, boxChipsLoadProps } from './containersStyle/H_LoadingCardStyle.js'
import { Card, CardContent, Box, Typography, Avatar, Chip, Skeleton, useTheme } from '@mui/joy';
import { CircularProgress, LinearProgress } from '@mui/joy';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function LoadingCardContainer(props) {
  const { type } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const text = 'כרטיס בטעינה...'
  const text1 = 'בטעינה...'

  const flexBasis = {
    menu: '10%',
    image: '10%',
    name: '40%',
    chips: '40%',
  };

  const textOverflow = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <Card {...cardLoadProps(isMobile, type)}>
      {/* Header Section */}
      <Box {...boxCardLoadProps(isMobile)}>
        {/* תפריט (לא פעיל, סתם מקום שמור) */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, width: flexBasis.menu }} />

        {/* אווטאר */}
        <Box sx={{ flexBasis: flexBasis.image, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Avatar size="md">
            <Skeleton variant="circular" width={40} height={40} />
          </Avatar>
        </Box>

        {/* שם ותת־שם */}
        <Box {...boxTitleLoadProps(flexBasis)}>
        <Typography {...typoTitleLoadProps}>
          {isMobile ? text1 : text}
          </Typography>
        </Box>
        {/* צ'יפים */}
        <Box {...boxChipsLoadProps(flexBasis)}>
          {[...Array(2)].map((_, idx) => (
            <Chip key={idx} {...chipLoadProps}>
              <Skeleton width={30} height={14} sx={{ mt: '2px' }} />
            </Chip>
          ))}
        </Box>
      </Box>

      {/* תוכן תחתון */}
      {type === 'players' &&
        <CardContent sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Skeleton width="60%" height={14} />
        </CardContent>
      }

    </Card>
  );
}
