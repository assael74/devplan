// src/ui/ratings/JoyStarRating.js
import React from 'react';
import { Box } from '@mui/joy';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

export default function JoyStarRatingStatic({
  value = 0,
  max = 5,
  size = 'md',
  color = '#fbc02d',
  gap = '1px',
  sx = {}
}) {
  const gapStar = size === 'xs' ? 0.15 : 0.3
  return (
    <Box sx={{ display: 'flex', direction: 'ltr', gap: gapStar, ...sx,  }}>
      {Array.from({ length: max }).map((_, index) => {
        const full = index + 1 <= value;
        const half = !full && index + 0.5 <= value;
        const iconSize = size === 'xs' ? 15 : size === 'sm' ? 18 : size === 'md' ? 20 : 25;

        const iconProps = {
          fontSize: size,
        };
        const iconPropsColor = {
          fontSize: size,
          style: { color },
        };

        if (full) return <StarIcon key={index} sx={{ fontSize: iconSize, color, }} />;
        if (half) {
          return (
            <Box key={index} sx={{ position: 'relative', width: iconSize, height: iconSize, mt: size === 'xs' ? -0.3 : 0 }} >
              {/* חצי שמאלי - אפור */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  overflow: 'hidden',
                }}
              >
                <StarBorderIcon sx={{ fontSize: iconSize, color: '#888' }} />
              </Box>

              {/* חצי ימני - צהוב */}
              <Box
                sx={{
                  width: '50%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  overflow: 'hidden',
                }}
              >
                <StarIcon sx={{ fontSize: iconSize, color: color }} />
              </Box>
            </Box>
          );
        }
        return <StarBorderIcon key={index} sx={{ fontSize: iconSize, color: '#888' }} />;
      })}
    </Box>
  );
}
