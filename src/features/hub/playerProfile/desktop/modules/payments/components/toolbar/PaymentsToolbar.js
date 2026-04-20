// playerProfile/desktop/modules/payments/components/toolbar/PaymentsToolbar.js

import React from 'react'
import { Box, FormControl, FormLabel, Option, Select, IconButton, Tooltip } from '@mui/joy'

import MonthYearPicker from '../../../../../../../../ui/fields/dateUi/MonthYearPicker.js'
import { toYearMonth, getPaymentStatusMeta, getPaymentTypeMeta } from '../../../../../../../../shared/payments/payments.utils.js'

import PaymentsSummary from './PaymentsSummary'
import SelectValue from './SelectValue.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from './../../sx/toolbar.sx.js'
import { createInitialPaymentsFilters } from './../../../../../sharedLogic'

export default function PaymentsToolbar({
  filters,
  options,
  summary,
  onChangeFilters,
}) {
  const f = filters || {}
  const opt = options || {}

  const handleUpdate = (key, value) => {
    onChangeFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    onChangeFilters(createInitialPaymentsFilters())
  }

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTop}>
        {/* חודש */}
        <Box sx={sx.filterMonth}>
          <MonthYearPicker
            context="payment"
            value={f.dueMonth || ''}
            onChange={(value) => handleUpdate('dueMonth', toYearMonth(value))}
          />
        </Box>

        {/* סטטוס */}
        <FormControl sx={sx.filterStatus}>
          <FormLabel sx={{ fontSize: 12 }}>סטטוס</FormLabel>
          <Select
            size="sm"
            variant="soft"
            value={f.statusId || 'all'}
            onChange={(_, v) => handleUpdate('statusId', v || 'all')}
            renderValue={(selected) => {
              if (!selected || selected.value === 'all') return <SelectValue label="כל הסטטוסים" icon="payments" />
              const meta = getPaymentStatusMeta(selected.value)
              return <SelectValue label={meta?.labelH} icon={meta?.idIcon} color={meta?.color} />
            }}
          >
            <Option value="all"><SelectValue label="הכל" icon="payments" /></Option>
            {(opt.statusOptions || []).map((s) => (
              <Option key={s.id} value={s.id}>
                <SelectValue label={s.labelH} icon={s.idIcon} color={s.color} />
              </Option>
            ))}
          </Select>
        </FormControl>

        {/* סוג תשלום */}
        <FormControl sx={sx.filterType}>
          <FormLabel sx={{ fontSize: 12 }}>סוג תשלום</FormLabel>
          <Select
            size="sm"
            variant="soft"
            value={f.typeId || 'all'}
            onChange={(_, v) => handleUpdate('typeId', v || 'all')}
            renderValue={(selected) => {
              if (!selected || selected.value === 'all') return <SelectValue label="כל הסוגים" icon="category" />
              const meta = getPaymentTypeMeta(selected.value)
              return <SelectValue label={meta?.labelH} icon={meta?.idIcon} />
            }}
          >
            <Option value="all"><SelectValue label="הכל" icon="category" /></Option>
            {(opt.typeOptions || []).map((t) => (
              <Option key={t.id} value={t.id}>
                <SelectValue label={t.labelH} icon={t.idIcon} />
              </Option>
            ))}
          </Select>
        </FormControl>

        {/* Spacer - דוחף את האלמנט הבא לסוף */}
        <Box sx={{ flex: 1 }} />

        {/* כפתור איפוס - מיושר אוטומטית לתחתית בגלל flex-end ב-parent */}
        <Box>
           <Tooltip title="איפוס פילטרים" variant="soft">
             <IconButton
               variant="outlined"
               color="neutral"
               size="sm"
               onClick={handleReset}
               sx={{ borderRadius: 'sm', height: 32 }}
             >
               {iconUi({ id: 'reset' })}
             </IconButton>
           </Tooltip>
        </Box>
      </Box>

      <PaymentsSummary summary={summary} />
    </Box>
  )
}
