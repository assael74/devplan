import React, { useState, useEffect } from 'react';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { getAgeFromBirth } from '../x_utils/dateUtiles.js'
import { validateBeforeSave } from './X_Actions';
import { generatePaymentId } from './helpers/generateId.js'
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { addButtProps, clearButtProps, addIconButtProps, drawerConsProps, sheetWraperProps, footerBoxProps } from './X_Style';
import { boxContentWraperProps } from './X_Style';
import { useTheme } from '@mui/joy/styles';
import useGenericActions from './X_UseGenericActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, Divider, Grid } from '@mui/joy';
import PlayerSelectField from './allFormInputs/selectUi/PlayerSelectField.js';
import PaymentTypeSelector from './allFormInputs/checkUi/PaymentTypeSelector.js';
import MonthYearPicker from './allFormInputs/dateUi/MonthYearPicker.js';
import PriceField from './allFormInputs/inputUi/PriceField.js';

export default function NewPaymentForm(props) {
  const { payments, players, teams, clubs, initialData, onSave, idForm, disabled, formProps, idNav } = props;
  const [open, setOpen] = useState(false);

  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const butSize = isMobile ? 'sm' : 'md'
  const isTrulyMobile = isMobile && idNav !== 'defaultEmpty';

  const computedInitialState = {
    price: '',
    type: '',
    paymentFor: '',
    playerId: initialData?.playerId || '',
  };

  const validationRules = {
    playerId: (val) => val.trim() === '',
    type: (val) => val.trim() === '',
    price: (val) => isNaN(Number(val)) || Number(val) <= 0,
    paymentFor: (val) => val.trim() === '',
  };

  const [isAdding, setIsAdding] = useState(false);

  const {
    data,
    errors,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleClose,
    resetForm,
  } = useGenericActions({
    initialState: computedInitialState,
    validationRules,
    onSubmit: async (formData) => {
      const validationResult = validateBeforeSave(formData, { payments }, 'payment');

      if (validationResult !== true) {
        alert(validationResult); // מציג הודעת שגיאה אם יש
        return;
      }

      setIsAdding(true);

      try {
        const paymentFor = formData?.paymentFor || '';
        const playerId = formData?.playerId || '';
        const part1 = paymentFor.slice(0, 2);
        const part2 = paymentFor.slice(3, 7);
        const part3 = playerId.slice(3, 7);

        const finalData = {
          ...formData,
          id: generatePaymentId(`${part1}${part2}${part3}`),
        };

        await onSave?.(finalData); // אם onSave היא async
        showSnackbar('תשלום נוסף בהצלחה', 'success', 'payments');
        setOpen(false);
      } catch (err) {
        console.error('שגיאה בהוספה:', err);
        showSnackbar('שגיאה בהוספת תשלום', 'error', 'error');
      } finally {
        setIsAdding(false); // ✅ סיום לואדינג
      }
    },
  });

  useEffect(() => {
    if (open && initialData?.playerId) {
      resetForm({
        ...computedInitialState,
        ...initialData,
      });
    }
  }, [open, initialData]);

  return (
    <>
      {isMobile ? (
        <IconButton {...addIconButtProps('newPayment', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'newPayment' })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newPayment', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף תשלום
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperProps}>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight="lg">טופס תשלום חדש</Typography>
            </Box>
            <IconButton
              size={isMobile ? 'sm' : 'md'}
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
            >
              {iconUi({ id: 'close' })}
            </IconButton>
          </Box>

          <Divider />

          <Box {...boxContentWraperProps('payments', isMobile)}>
            <Box className="content-inner">
              {/* Section: שיוך*/}
              <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography level="title-md">שיוך</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={8} md={6}>
                    <Tooltip title={idForm === 'playerDashboard' ? 'לא ניתן לשנות שחקן מתוך פרופיל שחקן' : ''}>
                      <PlayerSelectField
                        error={errors.playerId}
                        options={formProps.players}
                        size={isMobile ? 'sm' : 'md'}
                        value={data.playerId}
                        formProps={formProps}
                        readOnly={idForm === 'playerDashboard'}
                        onChange={(val) => handleChange('playerId', val)}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
              </Sheet>

              {/* Section: מאפיינים*/}
              <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography level="title-md">מאפיינים</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={4} md={6}>
                    <PaymentTypeSelector
                      required
                      size={isMobile ? 'md' : 'lg'}
                      value={data.type}
                      onChange={(val) => handleChange('type', val)}
                      disabledOptions={['monthly']}
                    />
                  </Grid>

                  <Grid xs={6} md={4}>
                    <PriceField
                      value={data.price}
                      onChange={(val) => handleChange('price', val)}
                      required
                      size={isMobile ? 'sm' : 'md'}
                      error={errors.price}
                      label="סכום לתשלום"
                    />
                  </Grid>

                  <Grid xs={12} md={8}>
                    <MonthYearPicker
                      required
                      size={isMobile ? 'sm' : 'md'}
                      context="payment"
                      value={data.paymentFor}
                      onChange={(val) => handleChange('paymentFor', val)}
                      error={errors.paymentFor}
                      helperText="ציין עבור איזה חודש התשלום מתבצע"
                    />
                  </Grid>
                </Grid>
              </Sheet>
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
                הוסף תשלום
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>

    </>
  );
}
