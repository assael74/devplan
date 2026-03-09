import * as React from 'react';
import { radioProps, optionBoxProps } from './X_Style'
import { optionTypeMeeting } from '../../../x_utils/optionLists.js';
import { FormControl, FormLabel, RadioGroup, Radio, Box, Typography } from '@mui/joy';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';

export default function MeetingTypeSelector({
  value,
  onChange,
  disabledOptions = [],
  label = 'סוג פגישה',
  size = 'sm',
  required
}) {
  const options = optionTypeMeeting.map((opt) => ({
    ...opt,
    disabled: disabledOptions.includes(opt.id),
  }));

  return (
    <FormControl>
      <FormLabel required={required}>{label}</FormLabel>
      <RadioGroup
        size={size}
        sx={{ gap: 1.5, mt: 1 }}
        name="meetingType"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((option) => {
          const isSelected = value === option.id;
          return (
            <Box key={option.id} {...optionBoxProps(option, isSelected)}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Radio value={option.id} disabled={option.disabled} {...radioProps} />
                <Typography level="body-md" sx={{ userSelect: 'none', fontWeight: isSelected ? 'md' : 'normal', mr: 1 }}>
                  {option.labelH}
                </Typography>
              </Box>
              {option.idIcon && iconUi({ id: option.idIcon, size: 'md' })}
            </Box>
          )
        })}
      </RadioGroup>
    </FormControl>
  );
}
