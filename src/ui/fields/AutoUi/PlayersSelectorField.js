import React from 'react';
import { renderOptionStyle, autoSlotProps } from './X_Style'
import { buildFallbackAvatar } from '../../core/avatars/fallbackAvatar.js'
import playerImage from '../../core/images/playerImage.jpg';
import { Autocomplete, Chip, ChipDelete, Avatar, Box, ListItemContent, Typography } from '@mui/joy';
import Close from '@mui/icons-material/Close';

export default function PlayersSelectorField({
  value = [],
  onChange = () => {},
  players = [],
  teams = [],
  clubs = [],
  size = 'sm'
}) {
  const getTeamName = (teamId) => (teams || []).find(t => t.id === teamId)?.teamName || '';
  const getClubName = (clubId) => (clubs || []).find(c => c.id === clubId)?.clubName || '';
  const getClubPhoto = (clubId) => (clubs || []).find(c => c.id === clubId)?.photo || '';
  const src = (clubId) => buildFallbackAvatar({ entityType: 'club', id: clubId, name: getClubName(clubId) })
  const options = players.map(player => ({
    label: player.playerFullName,
    photo: player.photo !== '' ? player.photo : playerImage,
    type: player.type,
    id: player.id,
    teamName: getTeamName(player.teamId),
    clubName: getClubName(player.clubId),
    clubPhoto: (clubs || []).find(c => c.id === player.clubId)?.photo || src(player.clubId)
  }));

  return (
    <Autocomplete
      multiple
      size={size}
      placeholder="שחקנים לוידאו"
      options={options}
      sx={{
        backgroundColor: 'transparent',
        '--Input-focusedHighlight': 'none',
        '--Input-focusedThickness': 0,
        '--Input-minHeight': '32px',
      }}
      dir="rtl"
      slotProps={autoSlotProps}
      renderOption={(props, option) => {
        const { ownerState, ...rest } = props;
        return (
          <Box {...rest} {...renderOptionStyle}>
            <Avatar src={option.photo} size="sm" />
            <ListItemContent sx={{ display:'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Typography level="body-xs" color="neutral" sx={{ mr: 2, mt: { xs: 0.3 } }}>
                {option.teamName} | {option.clubName}
              </Typography>
              <Typography level="body-sm" fontWeight="lg">
                {option.label}
              </Typography>
            </ListItemContent>
          </Box>
        )
      }}
      value={options.filter(opt => value.includes(opt.id))}
      onChange={(event, newValue) => {
        const selected = newValue.map(v => v.id);
        onChange(selected);
      }}
      getOptionLabel={(option) => `${option.label} (${option.teamName || ''} | ${option.clubName || ''})`}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => {
          return (
            <Chip
            key={option.id}
            {...getTagProps({ index })}
            variant="solid"
            color="neutral"
            startDecorator={<Avatar src={option.photo} />}
            endDecorator={
              <ChipDelete
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(value.filter((id) => id !== option.id));
                }}
              >
                <Close fontSize="small" />
              </ChipDelete>
            }
          >
            {option.label}
          </Chip>
          );
        })
      }
    />
  );
}
