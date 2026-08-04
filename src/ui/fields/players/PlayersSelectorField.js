// ui/fields/players/PlayersSelectorField.js

import React, { useMemo } from 'react';
import Close from '@mui/icons-material/Close';
import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  ChipDelete,
  ListItemContent,
  Typography,
} from '@mui/joy';
import { buildFallbackAvatar } from '../../core/avatars/fallbackAvatar.js';
import playerImage from '../../core/images/playerImage.jpg';
import {
  autoSlotProps,
  renderOptionStyle,
} from './sx/playersSelector.sx.js';

const buildMap = (items, nameKey) => new Map(
  (Array.isArray(items) ? items : []).map((item) => [
    item.id,
    {
      name: item[nameKey] || '',
      photo: item.photo || '',
    },
  ]),
);

export default function PlayersSelectorField({
  value = [],
  onChange,
  players = [],
  teams = [],
  clubs = [],
  size = 'sm',
}) {
  const teamMap = useMemo(
    () => buildMap(teams, 'teamName'),
    [teams],
  );

  const clubMap = useMemo(
    () => buildMap(clubs, 'clubName'),
    [clubs],
  );

  const options = useMemo(
    () => players.map((player) => {
      const team = teamMap.get(player.teamId);
      const club = clubMap.get(player.clubId);
      const clubName = club ? club.name : '';

      return {
        id: player.id,
        label: player.playerFullName,
        photo: player.photo || playerImage,
        type: player.type,
        teamName: team ? team.name : '',
        clubName,
        clubPhoto: club && club.photo
          ? club.photo
          : buildFallbackAvatar({
              entityType: 'club',
              id: player.clubId,
              name: clubName,
            }),
      };
    }),
    [clubMap, players, teamMap],
  );

  const selectedIds = Array.isArray(value)
    ? value
    : [];

  const handleChange = (_, nextValue) => {
    if (typeof onChange !== 'function') return;
    onChange(nextValue.map((item) => item.id));
  };

  return (
    <Autocomplete
      multiple
      size={size}
      placeholder="שחקנים לוידאו"
      options={options}
      dir="rtl"
      slotProps={autoSlotProps}
      sx={{
        bgcolor: 'transparent',
        '--Input-focusedHighlight': 'none',
        '--Input-focusedThickness': 0,
        '--Input-minHeight': '32px',
      }}
      value={options.filter((option) => selectedIds.includes(option.id))}
      onChange={handleChange}
      getOptionLabel={(option) => (
        `${option.label} (${option.teamName || ''} | ${option.clubName || ''})`
      )}
      isOptionEqualToValue={(option, selected) => (
        option.id === selected.id
      )}
      renderOption={(props, option) => {
        const { ownerState, ...rest } = props;

        return (
          <Box {...rest} {...renderOptionStyle}>
            <Avatar src={option.photo} size="sm" />

            <ListItemContent
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Typography
                level="body-xs"
                color="neutral"
                sx={{
                  mr: 2,
                  mt: {
                    xs: 0.3,
                  },
                }}
              >
                {option.teamName} | {option.clubName}
              </Typography>

              <Typography level="body-sm" fontWeight="lg">
                {option.label}
              </Typography>
            </ListItemContent>
          </Box>
        );
      }}
      renderTags={(selected, getTagProps) => (
        selected.map((option, index) => (
          <Chip
            key={option.id}
            {...getTagProps({ index })}
            variant="solid"
            color="neutral"
            startDecorator={<Avatar src={option.photo} />}
            endDecorator={(
              <ChipDelete
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();

                  if (typeof onChange !== 'function') return;
                  onChange(selectedIds.filter((id) => id !== option.id));
                }}
              >
                <Close fontSize="small" />
              </ChipDelete>
            )}
          >
            {option.label}
          </Chip>
        ))
      )}
    />
  );
}
