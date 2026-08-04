// ui/fields/tags/TagSelectorField.js

import React, { useMemo } from 'react';
import Close from '@mui/icons-material/Close';
import {
  Autocomplete,
  Chip,
  ChipDelete,
} from '@mui/joy';

export default function TagSelectorField({
  value = [],
  onChange,
  tags = [],
  size = 'sm',
  type,
}) {
  const options = useMemo(
    () => tags
      .map((tag) => ({
        id: tag.id,
        label: tag.tagName,
        type: tag.tagType,
      }))
      .filter((option) => option.type === type),
    [tags, type],
  );

  const selectedValues = Array.isArray(value)
    ? value
    : [];

  const emitChange = (nextValue) => {
    if (typeof onChange !== 'function') return;
    onChange(nextValue);
  };

  return (
    <Autocomplete
      multiple
      placeholder="בחר תגיות"
      options={options}
      size={size}
      value={options.filter((option) => (
        selectedValues.includes(option.label)
      ))}
      onChange={(_, nextValue) => {
        emitChange(nextValue.map((option) => option.label));
      }}
      getOptionLabel={(option) => `#${option.label}`}
      isOptionEqualToValue={(option, selected) => (
        option.id === selected.id
      )}
      sx={{
        bgcolor: 'transparent',
        '--Input-focusedHighlight': 'none',
        '--Input-focusedThickness': 0,
        '--Input-minHeight': '32px',
      }}
      renderTags={(selected, getTagProps) => (
        selected.map((option, index) => (
          <Chip
            key={option.id}
            {...getTagProps({ index })}
            variant="solid"
            color="success"
            endDecorator={(
              <ChipDelete
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  emitChange(selectedValues.filter((tag) => (
                    tag !== option.label
                  )));
                }}
              >
                <Close fontSize="small" />
              </ChipDelete>
            )}
          >
            #{option.label}
          </Chip>
        ))
      )}
    />
  );
}
