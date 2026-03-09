import React from 'react';
import { Box, IconButton, Button, Grid } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps } from './X_Style';
import MeetingStatusSelector from '../../f_forms/allFormInputs/checkUi/MeetingStatusSelector.js'
import MeetingTypeSelector from '../../f_forms/allFormInputs/checkUi/MeetingTypeSelector.js'
import MonthYearPicker from '../../f_forms/allFormInputs/dateUi/MonthYearPicker.js'
import DateInputField from '../../f_forms/allFormInputs/dateUi/DateInputField.js'
import PriceField from '../../f_forms/allFormInputs/inputUi/PriceField.js';

export default function MeetingEditModalContent({
  coach,
  update,
  isDirty,
  isUpdate,
  isMobile,
  onChange,
  actionItem,
  handleReset,
  handleClose,
  handleSubmit,
}) {
  const isMeetingInfo = actionItem === 'meetingInfo';
  const isMeetingStatus = actionItem === 'meetingStatus';
  const isMeetingType = actionItem === 'meetingType';

  return (
    <Grid container spacing={2} onClick={(e) => e.stopPropagation()}>
      {isMeetingInfo && (
        <>
          <Grid xs={12} md={12}>
            <MonthYearPicker
              required
              context="meeting"
              label="חודש הפגישה"
              value={update.meetingFor}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, meetingFor: val }))}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <DateInputField
              required
              context="meeting"
              value={update.meetingDate}
              timeValue={update.meetingHour}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, meetingDate: val }))}
              onTimeChange={(val) => onChange((prev) => ({ ...prev, meetingHour: val }))}
            />
          </Grid>
        </>
      )}

      {isMeetingStatus && (
        <>
          <Grid xs={12} md={12}>
            <MeetingStatusSelector
              required
              value={update.status}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, status: val }))}
            />
          </Grid>
        </>
      )}

      {isMeetingType && (
        <Grid xs={12} md={10}>
          <MeetingTypeSelector
            required
            value={update.type}
            size={isMobile ? 'sm' : 'md'}
            disabledOptions={['monthly']}
            onChange={(val) => onChange((prev) => ({ ...prev, type: val }))}
          />
        </Grid>
      )}

      <Grid xs={12}>
        <Box sx={{ mt: 2, pt: 2, display: 'flex', gap: 1, flexDirection: 'row-reverse' }}>
          <Button
            {...updateButtProps('meetings', isMobile)}
            disabled={!isDirty || isUpdate}
            onClick={handleSubmit}
            loading={isUpdate}
          >
            עדכן פגישה
          </Button>
          <IconButton {...clearButtProps(isMobile)} onClick={handleReset}>
            {iconUi({ id: 'clear' })}
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
}
