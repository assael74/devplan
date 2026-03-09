import React from 'react';
import { Box, IconButton, Button, Grid } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps } from './X_Style';
import TagNameField from '../../f_forms/allFormInputs/inputUi/TagNameField.js'

export default function TagEditModalContent({
  update,
  isDirty,
  isUpdate,
  isMobile,
  onChange,
  formProps,
  actionItem,
  handleReset,
  handleClose,
  handleSubmit,
  handleCoachChange,
}) {
  const isTagsInfo = actionItem === 'tagsInfo';
  const size = isMobile ? 'sm' : 'md'

  return (
    <Grid container spacing={2} onClick={(e) => e.stopPropagation()}>
      {isTagsInfo && (
        <>
          <Grid xs={10}>
            <TagNameField
              size={size}
              placeholder="שם התג"
              value={update.tagName}
              onChange={(val) => onChange((prev) => ({ ...prev, tagName: val }))}
            />
          </Grid>
        </>
      )}

      <Grid xs={12}>
        <Box sx={{ mt: 2, pt: 2, display: 'flex', gap: 1, flexDirection: 'row-reverse' }}>
          <Button
            {...updateButtProps('tags', isMobile)}
            disabled={!isDirty || isUpdate}
            onClick={handleSubmit}
            loading={isUpdate}
          >
            עדכן וידאו
          </Button>
          <IconButton {...clearButtProps(isMobile)} onClick={handleReset}>
            {iconUi({ id: 'clear' })}
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
}
