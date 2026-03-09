import React from 'react';
import { Box, Chip } from '@mui/joy';
import TagSelectorField from '../../../../f_forms/allFormInputs/AutoUi/TagSelectorField.js';

export default function TagsDisplay({
  tags = [],
  editable = false,
  formProps = {},
  onChange = () => {},
  type
}) {
  return (
    <Box sx={{ display:"flex", flexDirection:"column", backgroundColor: 'transparent', gap: 1.5 }}>
      {editable ? (
        <TagSelectorField
          value={tags}
          type={type}
          onChange={onChange}
          tags={formProps.tags || []}
        />
      ) : tags.length > 0 ? (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {tags.map((tag, index) => (
            <Chip
              key={tag + index}
              size="sm"
              variant="outlined"
              color="neutral"
            >
              #{tag}
            </Chip>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
