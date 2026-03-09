// 📁 G_NewVideo.js
import React, { useState, useEffect } from 'react';
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, ModalClose, Divider } from '@mui/joy';
import { Select, Option } from '@mui/joy';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { addButtProps, clearButtProps, addIconButtProps, drawerConsProps, sheetWraperProps, footerBoxProps } from './X_Style';
import { boxContentWraperProps } from './X_Style';
import { useTheme } from '@mui/joy/styles';
import { cleanVideoLink } from '../x_utils/cleanVideoLink.js'
import useMediaQuery from '@mui/material/useMediaQuery';
import { iconUi } from '../b_styleObjects/icons/IconIndex';
import useGenericActions from './X_UseGenericActions';
import PlayerSelectField from './allFormInputs/selectUi/PlayerSelectField.js';
import VideoNameField from './allFormInputs/inputUi/VideoNameField.js'
import VideoLinkField from './allFormInputs/inputUi/VideoLinkField.js'
import VideoCommentsField from './allFormInputs/inputUi/VideoCommentsField.js'
import MonthYearPicker from './allFormInputs/dateUi/MonthYearPicker.js'

function isValidVideoLink(link = '') {
  if (!link) return false;

  try {
    const url = new URL(link);

    // Drive קישור תקין
    if (url.hostname.includes('drive.google.com')) {
      return url.pathname.includes('/uc') && url.searchParams.get('id');
    }

    // YouTube קישור תקין
    if (url.hostname.includes('youtube.com') && url.pathname.includes('/embed/')) {
      return true;
    }

    // קישור ישיר - לדוגמה מ-Firebase Storage
    if (url.hostname.includes('firebasestorage.googleapis.com')) {
      return true;
    }

    return false; // כל מה שלא נכנס לקריטריונים האלה => לא תקין
  } catch (err) {
    return false; // לא קישור תקין בכלל
  }
}

export default function NewVideoForm(props) {
  const { onSave, initialData, players, teams, clubs, idNav, disabled, formProps } = props;
  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [videoType, setVideoType] = useState('videos');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const butSize = isMobile ? 'sm' : 'md'

  const baseInitialState = {
    videoType: videoType,
    videoId: uuidv4(),
    created: moment().format('DD/MM/YYYY'),
    videoName: '',
    videoLink: '',
    videoComments: '',
    analysId: '',
    analysName: '',
    analysLink: '',
    analysDate: '',
    analysisPlayers: [],
    analysisComments: '',
  };

  const validationRules = React.useMemo(() => ({
    videoName: (val) => videoType === 'videos' && val.trim() === '',
    videoLink: (val) => videoType === 'videos' && !isValidVideoLink(val),
    analysName: (val) => videoType === 'videoAnalysis' && val.trim() === '',
    analysDate: (val) => videoType === 'videoAnalysis' && val.trim() === '',
    analysLink: (val) => videoType === 'videoAnalysis' && !isValidVideoLink(val),
    analysisPlayers: (val) => videoType === 'videoAnalysis' && val.length === 0,
  }), [videoType]);

  const {
    data,
    errors,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleClose,
    resetForm,
  } = useGenericActions({
    initialState: baseInitialState,
    validationRules,
    onSubmit: (formData) => {
      const finalData = {
        id: formData.videoId || formData.analysId,
        type: formData.videoType,
        link: formData.videoType === 'videos' ? formData.videoLink : formData.analysLink,
        name: formData.videoType === 'videos' ? formData.videoName : formData.analysName,
        comments: formData.videoType === 'videos' ? formData.videoComments : formData.analysComments,
        players: formData.videoType === 'videos' ? [] : formData.analysisPlayers,
        created: formData.created,
        analysDate: formData.videoType === 'videos' ? '' : formData.analysDate,
      };
      onSave?.(finalData);
      setOpen(false);
    },
  });

  useEffect(() => {
    if (open) {
      const newInitialState = {
        ...baseInitialState,
        ...(initialData || {}),
      };
      resetForm({
        ...baseInitialState,
        ...initialData,
      });
    }
  }, [open, initialData, videoType]);
  //console.log(data)
  const handleVideoTypeChange = (e, newValue) => {
    setVideoType(newValue);
    resetForm({
      ...baseInitialState,
      videoId: uuidv4(),
      analysId: uuidv4(),
    });
  };
  const isTrulyMobile = isMobile && idNav !== 'defaultEmpty';

  return (
    <>
      {isTrulyMobile ? (
        <IconButton {...addIconButtProps('newVideo', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'newVideo' })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newVideo', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף וידאו
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperProps}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight='lg'>טופס וידאו חדש</Typography>
            </Box>
            <IconButton
              size={isMobile ? 'sm' : 'md'}
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
             >
               {iconUi({id: 'close' })}
              </IconButton>
          </Box>
          <Divider sx={{ mt: 'auto' }} />
          <Box {...boxContentWraperProps('videos', isMobile)}>
            <Box className="content-inner">
              <Stack spacing={2}>
                <Select
                  value={videoType}
                  size={isMobile ? 'sm' : 'md'}
                  onChange={handleVideoTypeChange}
                  placeholder="בחר סוג וידאו"
                  slotProps={{ listbox: { sx: { width: '100%' } } }}
                >
                  <Option value="videos">וידאו כללי</Option>
                  <Option value="videoAnalysis">ניתוח וידאו</Option>
                </Select>

                {videoType === 'videos' ? (
                  <Stack spacing={2}>
                    <VideoNameField
                      placeholder="שם הוידאו"
                      size={isMobile ? 'sm' : 'md'}
                      value={data.videoName || ''}
                      onChange={(val) => handleChange('videoName', val)}
                      error={errors.videoName}
                      required={true}
                    />
                    <VideoLinkField
                      placeholder="קישור וידאו"
                      size={isMobile ? 'sm' : 'md'}
                      value={data.videoLink || ''}
                      onChange={(val) => handleChange('videoLink', val)}
                      error={errors.videoLink}
                      required={true}
                    />
                    <VideoCommentsField
                      placeholder="הערות (לא חובה)"
                      size={isMobile ? 'sm' : 'md'}
                      value={data.videoComments || ''}
                      onChange={(val) => handleChange('videoComments', val)}
                    />
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <VideoNameField
                      placeholder="שם הניתוח"
                      size={isMobile ? 'sm' : 'md'}
                      value={data.analysName || ''}
                      onChange={(val) => handleChange('analysName', val)}
                      error={errors.analysName}
                      required={true}
                    />
                    <PlayerSelectField
                      formProps={formProps}
                      value={data.analysisPlayers}
                      onChange={(val) => handleChange('analysisPlayers', val)}
                      options={formProps.players}
                      required
                      size={isMobile ? 'sm' : 'md'}
                      multiple={true}
                    />
                    <MonthYearPicker
                      placeholder="חודש/שנה (MM/YYYY)"
                      value={data.analysDate || ''}
                      onChange={(val) => handleChange('analysDate', val)}
                      required={true}
                      size={isMobile ? 'sm' : 'md'}
                    />
                    <VideoLinkField
                      placeholder="קישור וידאו"
                      value={data.analysLink || ''}
                      onChange={(val) => handleChange('analysLink', val)}
                      error={errors.analysLink}
                      required={true}
                      size={isMobile ? 'sm' : 'md'}
                    />
                    <VideoCommentsField
                      placeholder="הערות (לא חובה)"
                      value={data.analysComments || ''}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('analysComments', val)}
                    />
                  </Stack>
                )}

              </Stack>
            </Box>
          </Box>

          <Box {...footerBoxProps}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={1.2}
            >
              {/* פעולות משניות */}
              <Stack direction="row" spacing={0.8}>
                <Button
                  variant="soft"
                  color="neutral"
                  size={isMobile ? 'sm' : 'md'}
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                  startDecorator={iconUi({ id: 'close', size: isMobile ? 'sm' : 'md' })}
                >
                  בטל
                </Button>
                <Tooltip title="נקה שדות">
                  <IconButton
                    variant="plain"
                    size={isMobile ? 'sm' : 'md'}
                    color="neutral"
                    onClick={() => resetForm()}
                    sx={{ borderRadius: 'xl' }}
                  >
                    {iconUi({ id: 'clear', size: isMobile ? 'sm' : 'md' })}
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* פעולה ראשית */}
              <Button
                color="success"
                variant="solid"
                size={isMobile ? 'sm' : 'md'}
                disabled={isAdding}
                onClick={handleSubmit}
                startDecorator={iconUi({ id: 'check', size: isMobile ? 'sm' : 'md' })}
                sx={{ minWidth: { xs: '100%', sm: 160 }, borderRadius: 'lg' }}
              >
                הוסף וידאו
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>
    </>
  );
}
