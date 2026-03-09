import React from 'react';
import { typeBackground } from '../../../b_styleObjects/Colors.js';
import { Autocomplete, Chip, ChipDelete } from '@mui/joy';
import Close from '@mui/icons-material/Close';

export default function TagSelectorField({
  value = [],
  onChange = () => {},
  tags = [],
  size = 'sm',
  type
}) {
  const options = tags.map((tag) => ({
    label: tag.tagName,
    type: tag.tagType,
    id: tag.id
  })).filter(p=>p.type === type);
  return (
    <Autocomplete
      multiple
      placeholder="בחר תגיות"
      options={options}
      sx={{
        backgroundColor: 'transparent',
        '--Input-focusedHighlight': 'none',
        '--Input-focusedThickness': 0,
        '--Input-minHeight': '32px',
      }}
      size={size}
      value={options.filter(opt => value.includes(opt.label))}
      onChange={(event, newValue) => {
        const selected = newValue.map(v => v.label);
        onChange(selected);
      }}
      getOptionLabel={(option) => `#${option.label}`}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => {
          return (
            <Chip
              key={option.label}
              {...getTagProps({ index })}
              variant="solid"
              color="success"
              endDecorator={
                <ChipDelete
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newTags = selected
                      .map((item) => item.label)
                      .filter((t) => t !== option.label);
                    onChange(newTags);
                  }}
                >
                  <Close fontSize="small" />
                </ChipDelete>
              }
            >
              #{option.label}
            </Chip>
          );
        })
      }
    />
  );
}
