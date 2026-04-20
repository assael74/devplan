// playerProfile/mobile/modules/payments/components/toolbar/PaymentsFiltersContent.js

import React from 'react'
import { Box, FormControl, FormLabel, Option, Select } from '@mui/joy'

import MonthYearPicker from '../../../../../../../../ui/fields/dateUi/MonthYearPicker.js'
import { toYearMonth } from '../../../../../../../../shared/payments/payments.utils.js'

export default function PaymentsFiltersContent({
  filters,
  options,
  onChangeFilters,
}) {
  const f = filters || {}
  const opt = options || {}

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Box sx={{ minWidth: 0 }}>
        <MonthYearPicker
          context="payment"
          value={f.dueMonth || ''}
          onChange={(value) => onChangeFilters({ dueMonth: toYearMonth(value) })}
        />
      </Box>

      <FormControl>
        <FormLabel sx={{ fontSize: 12 }}>סטטוס</FormLabel>
        <Select
          size="sm"
          variant="soft"
          value={f.statusId || 'all'}
          onChange={(_, value) => onChangeFilters({ statusId: value || 'all' })}
        >
          <Option value="all">הכל</Option>
          {(opt.statusOptions || []).map((item) => (
            <Option key={item.id} value={item.id}>
              {item.labelH}
            </Option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel sx={{ fontSize: 12 }}>סוג תשלום</FormLabel>
        <Select
          size="sm"
          variant="soft"
          value={f.typeId || 'all'}
          onChange={(_, value) => onChangeFilters({ typeId: value || 'all' })}
        >
          <Option value="all">הכל</Option>
          {(opt.typeOptions || []).map((item) => (
            <Option key={item.id} value={item.id}>
              {item.labelH}
            </Option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel sx={{ fontSize: 12 }}>משלם</FormLabel>
        <Select
          size="sm"
          variant="soft"
          value={f.payerParentId || 'all'}
          onChange={(_, value) => onChangeFilters({ payerParentId: value || 'all' })}
        >
          <Option value="all">הכל</Option>
          {(opt.parentOptions || []).map((item) => (
            <Option key={item.id} value={item.id}>
              {item.label}
            </Option>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
