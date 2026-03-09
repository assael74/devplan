import React from 'react';
import { Box, IconButton, Button, Grid, Typography, Autocomplete, Input, Divider, MenuItem, Menu } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps } from './X_Style';
import VideoNameField from '../../f_forms/allFormInputs/inputUi/VideoNameField.js'
import VideoLinkField from '../../f_forms/allFormInputs/inputUi/VideoLinkField.js'
import MonthYearPicker from '../../f_forms/allFormInputs/dateUi/MonthYearPicker.js'
import MeetingSelectField from '../../f_forms/allFormInputs/selectUi/MeetingSelectField.js'

export default function VideoEditModalContent({
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
  const availableTags = formProps.tags || [];
  const currentTags = update.tags || [];
  const [tagAnchorEl, setTagAnchorEl] = React.useState(null);
  const isVideoInfo = actionItem === 'videoInfo';
  const isVideoTags = actionItem === 'videoTags';
  const isVideoComments = actionItem === 'videoComments';
  const isAnalysisInfo = actionItem === 'videoAnalysisInfo';
  const isAnalysisLinks = actionItem === 'videoAnalysisLinks'
  const commentsStr = update.comments || '';
  const commentsArray = commentsStr
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const size = isMobile ? 'sm' : 'md'
  const meetings = formProps.meetings

  return (
    <Grid container spacing={2} onClick={(e) => e.stopPropagation()}>
      {isVideoInfo && (
        <>
          <Grid xs={10}>
            <VideoNameField
              size={size}
              placeholder="שם הוידאו"
              value={update.name}
              onChange={(val) => onChange((prev) => ({ ...prev, name: val }))}
            />
          </Grid>
          <Grid xs={12}>
            <VideoLinkField
              size={size}
              placeholder="קישור וידאו"
              value={update.link}
              onChange={(val) => onChange((prev) => ({ ...prev, link: val }))}
            />
          </Grid>
        </>
      )}

      {isAnalysisInfo && (
        <>
          <Grid xs={10}>
            <VideoNameField
              size={size}
              placeholder="שם הוידאו"
              value={update.name}
              onChange={(val) => onChange((prev) => ({ ...prev, name: val }))}
            />
          </Grid>
          <Grid xs={4}>
            <MeetingSelectField
              size={size}
              placeholder="בחר פגישה"
              value={update.meetingId}
              options={meetings}
              formProps={formProps}
              onChange={(val) => onChange((prev) => ({ ...prev, meetingId: val }))}
            />
          </Grid>
        </>
      )}

      {isVideoTags && (
        <Grid xs={12}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {currentTags.map((tag, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'primary.softBg',
                  pl: isMobile ? 0.75 : 1,
                  py: isMobile ? 0.25 : 0.25,
                  borderRadius: 'lg',
                  fontSize: isMobile ? '10px' : '12px',
                  gap: 0.5,
                }}
              >
                #{tag}
                <Divider orientation="vertical" sx={{ my: 0.5, ml: 0.5, mr: -0.5 }} />
                <IconButton
                  size="sm"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      tags: prev.tags.filter((_, i) => i !== index),
                    }))
                  }
                >
                  {iconUi({ id: 'clear' })}
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 1 }}>
            <Autocomplete
              options={availableTags
                .map((t) => t.tagName)
                .filter((name) => !currentTags.includes(name))}
              size={isMobile ? 'sm' : 'md'}
              placeholder="הוסף תגית..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  e.preventDefault();
                  const newTag = e.target.value.trim();
                  if (!currentTags.includes(newTag)) {
                    onChange((prev) => ({
                      ...prev,
                      tags: [...(prev.tags || []), newTag],
                    }));
                  }
                  e.target.value = '';
                }
              }}
              onChange={(e, value) => {
                const trimmed = value?.trim();
                if (trimmed && !currentTags.includes(trimmed)) {
                  onChange((prev) => ({
                    ...prev,
                    tags: [...(prev.tags || []), trimmed],
                  }));
                }
              }}
              renderInput={(params) => (
                <Input {...params} sx={{ direction: 'rtl' }} />
              )}
            />
          </Box>
        </Grid>
      )}

      {isVideoComments && (
        <Grid xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <textarea
              value={update.comments || ''}
              onChange={(e) => {
                const value = e.target.value;
                const lines = value.split('\n');
                if (lines.length <= 10) {
                  onChange((prev) => ({ ...prev, comments: value }));
                }
              }}
              placeholder="כתוב עד 10 שורות של הערות..."
              rows={6}
              style={{
                width: '100%',
                resize: 'vertical',
                fontSize: '14px',
                direction: 'rtl',
                borderRadius: '8px',
                padding: '8px',
                border: '1px solid #ccc',
                lineHeight: 1.5,
                fontFamily: 'inherit',
                backgroundColor: '#fff',
              }}
            />
            <Typography level="body-sm" sx={{ textAlign: 'left', color: 'neutral.500' }}>
              {`מספר שורות: ${(update.comments || '').split('\n').filter(Boolean).length} / 6`}
            </Typography>
          </Box>
        </Grid>
      )}

      {isAnalysisLinks && (
        <>
          <Grid xs={10}>
            <VideoLinkField
              size={size}
              placeholder="קישור וידאו"
              value={update.link}
              onChange={(val) => onChange((prev) => ({ ...prev, link: val }))}
            />
          </Grid>
        </>
      )}

      <Grid xs={12}>
        <Box sx={{ mt: 2, pt: 2, display: 'flex', gap: 1, flexDirection: 'row-reverse' }}>
          <Button
            {...updateButtProps('videos', isMobile)}
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
