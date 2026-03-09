import React from 'react';
import { renderOptionStyle, autoSlotProps } from './X_Style'
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import playerImage from '../../../b_styleObjects/images/playerImage.jpg';
import { Autocomplete, Typography } from '@mui/joy';
import { FormControl, FormLabel, Box, Avatar, ListItemContent } from '@mui/joy';
import Input from '@mui/joy/Input';

export default function MeetingSelectField({ value, onChange, options = [], disabled, error, formProps, size = 'sm' }) {
  const getPlayerFullName = (playerId) => (formProps.players || []).find(t => t.id === playerId)?.playerFullName || '';
  const getPlayerPhoto = (playerId) => (formProps.players || []).find(t => t.id === playerId)?.photo || playerImage;
  const formattedOptions = options.map((c) => ({
    label: c.meetingDate,
    value: c.id,
    playerName: getPlayerFullName(c.playerId),
    meetingFor: c.meetingFor,
    photo: getPlayerPhoto(c.playerId),
  }));

  return (
    <>
      <FormControl sx={{ width: '100%' }}>
        <FormLabel required sx={{ fontSize: '12px' }}>שייך פגישה</FormLabel>
        <Autocomplete
          size={size}
          options={formattedOptions}
          value={formattedOptions.find((c) => c.value === value) || null}
          onChange={(_, val) => onChange(val?.value || '')}
          getOptionLabel={(option) => `${option.label} --- ${option.playerName}`}
          renderOption={(props, option) => {
            const { ownerState, ...rest } = props;
            return (
              <Box {...rest} {...renderOptionStyle}>
                <Avatar src={option.photo} size="sm" />
                <ListItemContent sx={{ display:'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Typography level="body-xs" color="neutral" sx={{ mr: 2, mt: { xs: 0.3 } }}>
                    {option.label}
                  </Typography>
                  <Typography level="body-sm" fontWeight="lg">
                    {option.playerName}
                  </Typography>
                </ListItemContent>
              </Box>
            )
          }}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          startDecorator={iconUi({id: 'meetings'})}
          placeholder="בחר פגישה לקישור"
          disabled={disabled}
          variant="soft"
          sx={{ '&:hover': { backgroundColor: '#eef4ff' } }}
        />
      </FormControl>
    </>
  );
}
