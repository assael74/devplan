import React, { useState } from 'react';
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { addButtProps, clearButtProps, addIconButtProps, drawerConsProps, sheetWraperProps, footerBoxProps } from './X_Style';
import { boxContentWraperProps } from './X_Style';
import { useTheme } from '@mui/joy/styles';
import { generateTagParmId } from './helpers/generateId.js'
import useMediaQuery from '@mui/material/useMediaQuery';
import useGenericActions from './X_UseGenericActions';
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, ModalClose, Divider } from '@mui/joy';
import { Input, Select, Option } from '@mui/joy';

export default function NewTagForm({ onSave, tags, disabled, idNav, ...props }) {
  const initialState = {
    tagName: '',
    tagType: 'video',
  };

  const validationRules = {
    tagName: (val) => !val || val.trim() === '',
  };

  const {
    data,
    errors,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleClose,
    resetForm
  } = useGenericActions({
    initialState,
    validationRules,
    onSubmit: (formData) => {
      const exists = tags?.some(t => t.tagName.trim() === formData.tagName.trim());
      if (exists) {
        alert('תגית בשם הזה כבר קיימת');
        return;
      }

      const finalData = {
        ...formData,
        type: 'tags',
        id: generateTagParmId(`${formData.tagName}`),
      };

      onSave?.(finalData);
      setOpen(false);
    },
  });

  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const butSize = isMobile ? 'sm' : 'md'
  const isTrulyMobile = isMobile && idNav !== 'defaultEmpty';

  return (
    <>
      {isTrulyMobile ? (
        <IconButton {...addIconButtProps('newTag', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'add' })} {iconUi({ id: 'tag' })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newTag', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף תגית
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)} >
        <Sheet {...sheetWraperProps}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight='lg'>טופס תג חדש</Typography>
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

          <Box {...boxContentWraperProps('tags', isMobile)}>
            <Box className="content-inner">
              <Stack spacing={2}>
                <Input
                  value={data.tagName}
                  onChange={(e) => handleChange('tagName', e.target.value)}
                  placeholder="שם תגית"
                  error={errors.tagName}
                  size={isMobile ? 'sm' : 'md'}
                />
                <Select
                  value={data.tagType}
                  size={isMobile ? 'sm' : 'md'}
                  onChange={(e, val) => handleChange('tagType', val)}
                >
                  <Option value="video">וידאו כללי</Option>
                  <Option value="videoAnalysis">ניתוח וידאו</Option>
                </Select>
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
                הוסף תגית
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>
    </>
  );
}
