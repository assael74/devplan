// ui/fields/meetings/ui/MeetingOptionRow.js

import React from 'react';
import { Box, Typography } from '@mui/joy';
import playerImage from '../../../core/images/playerImage.jpg';
import { meetingOptionSx as sx } from '../sx/meetingSelect.sx.js';

export default function MeetingOptionRow({ props, option }) {
  const { ownerState, ...rest } = props;
  const player = Array.isArray(option.players)
    ? option.players[0]
    : null;

  const teamName = player && player.team
    ? player.team.teamName
    : '';

  const clubName = player && player.club
    ? player.club.clubName
    : '';

  return (
    <Box component="li" {...rest} sx={sx.listItem}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%',
          minWidth: 0,
          px: 1,
        }}
      >
        <Box
          component="img"
          src={option.playerPhoto || playerImage}
          alt=""
          sx={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
        />

        <Typography
          level="body-sm"
          noWrap
          sx={{
            minWidth: 0,
            flex: 1,
          }}
        >
          {option.playerFullName || 'פגישה'}

          {teamName ? (
            <Typography
              component="span"
              level="body-sm"
              sx={{ opacity: 0.65 }}
            >
              {' '}· {teamName}
            </Typography>
          ) : null}

          {clubName ? (
            <Typography
              component="span"
              level="body-sm"
              sx={{ opacity: 0.6 }}
            >
              {' '}· {clubName}
            </Typography>
          ) : null}

          {option.label ? (
            <Typography
              component="span"
              level="body-sm"
              sx={{ opacity: 0.55 }}
            >
              {' '}· {option.label}
            </Typography>
          ) : null}
        </Typography>
      </Box>
    </Box>
  );
}
