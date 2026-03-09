import React from 'react';
import { Box, IconButton, Button, Grid } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps } from './X_Style';
import PaymentStatusSelector from '../../f_forms/allFormInputs/checkUi/PaymentStatusSelector.js'
import PaymentTypeSelector from '../../f_forms/allFormInputs/checkUi/PaymentTypeSelector.js'
import MonthYearPicker from '../../f_forms/allFormInputs/dateUi/MonthYearPicker.js'
import PriceField from '../../f_forms/allFormInputs/inputUi/PriceField.js';

export default function PaymentEditModalContent({
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
  const isPaymentInfo = actionItem === 'paymentInfo';
  const isPaymentStatus = actionItem === 'paymentStatus';
  const isPaymentType = actionItem === 'paymentType';

  return (
    <Grid container spacing={2} onClick={(e) => e.stopPropagation()}>
      {isPaymentInfo && (
        <>
          <Grid xs={12} md={8}>
            <MonthYearPicker
              required
              context="payment"
              label="חודש בפגישה"
              value={update.paymentFor}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, paymentFor: val }))}
            />
          </Grid>
          <Grid xs={6} md={4}>
            <PriceField
              required
              label="סכום לתשלום"
              value={update.price}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, price: val }))}
            />
          </Grid>
        </>
      )}

      {isPaymentStatus && (
        <>
          <Grid xs={12} md={12}>
            <PaymentStatusSelector
              value={update.status}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, status: val }))}
            />
          </Grid>
        </>
      )}

      {isPaymentType && (
        <Grid xs={12} md={10}>
          <PaymentTypeSelector
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
            {...updateButtProps('payments', isMobile)}
            disabled={!isDirty || isUpdate}
            onClick={handleSubmit}
            loading={isUpdate}
          >
            עדכן תשלום
          </Button>
          <IconButton {...clearButtProps(isMobile)} onClick={handleReset}>
            {iconUi({ id: 'clear' })}
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
}
