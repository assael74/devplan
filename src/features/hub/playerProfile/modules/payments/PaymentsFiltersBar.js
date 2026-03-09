// src/features/players/payments/PaymentsFiltersBar.js
import React from 'react'
import { Box, FormControl, FormLabel, Select, Option, Typography, Sheet } from '@mui/joy'
import MonthYearPicker from '../../../../../ui/fields/dateUi/MonthYearPicker.js'
import { getPaymentStatusList, getPaymentTypeList, toYearMonth } from '../../../../../shared/payments/payments.utils.js'

export default function PaymentsFiltersBar({
  filters,
  onChange,
  options,
  disabled = false,
}) {
  const f = filters || {}
  const opt = options || {}

  const statuses = React.useMemo(() => getPaymentStatusList().filter((x) => !x.disabled), [])
  const types = React.useMemo(() => getPaymentTypeList().filter((x) => !x.disabled), [])

  return (
    <Sheet
      variant="soft"
      color='success'
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: { xs: '1fr', md: '1.5fr 0.75fr 0.75fr 1fr' },
        alignItems: 'center',
        mb: 1,
        px: 2,
        py: 2,
        mx: 2,
        borderRadius: 'sm'
      }}
    >
      {/* חודש */}
      <Box sx={{ minWidth: 0 }}>
        <MonthYearPicker
          context="payment"
          value={f.dueMonth || ''}
          onChange={(v) => onChange({ ...f, dueMonth: toYearMonth(v) })}
          disabled={disabled}
        />
      </Box>

      {/* סטטוס */}
      <FormControl disabled={disabled}>
        <FormLabel sx={{ fontSize: 12 }}>סטטוס</FormLabel>
        <Select
          value={f.statusId || 'all'}
          onChange={(_, v) => onChange({ ...f, statusId: v || 'all' })}
          size="sm"
          variant="soft"
        >
          <Option value="all">הכל</Option>
          {statuses.map((s) => (
            <Option key={s.id} value={s.id}>{s.labelH}</Option>
          ))}
        </Select>
      </FormControl>

      {/* סוג */}
      <FormControl disabled={disabled}>
        <FormLabel sx={{ fontSize: 12 }}>סוג תשלום</FormLabel>
        <Select
          value={f.typeId || 'all'}
          onChange={(_, v) => onChange({ ...f, typeId: v || 'all' })}
          size="sm"
          variant="soft"
        >
          <Option value="all">הכל</Option>
          {types.map((t) => (
            <Option key={t.id} value={t.id}>{t.labelH}</Option>
          ))}
        </Select>
      </FormControl>

      {/* הורה */}
      <FormControl disabled={disabled}>
        <FormLabel sx={{ fontSize: 12 }}>משלם (הורה)</FormLabel>
        <Select
          value={f.payerParentId || 'all'}
          onChange={(_, v) => onChange({ ...f, payerParentId: v || 'all' })}
          size="sm"
          variant="soft"
        >
          <Option value="all">הכל</Option>
          {(opt.parentOptions || []).map((p) => (
            <Option key={p.id} value={p.id}>{p.label}</Option>
          ))}
        </Select>
      </FormControl>
    </Sheet>
  )
}
