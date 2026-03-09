/// ui/fields/dateUi/MonthYearPicker.js
import * as React from 'react'
import { Stack, Box, FormLabel, Input, Select, Option } from '@mui/joy'
import { monthYearPickerSx as sx } from './date.sx.js'

const MONTHS = [
  { value: 1, label: 'ינואר' },
  { value: 2, label: 'פברואר' },
  { value: 3, label: 'מרץ' },
  { value: 4, label: 'אפריל' },
  { value: 5, label: 'מאי' },
  { value: 6, label: 'יוני' },
  { value: 7, label: 'יולי' },
  { value: 8, label: 'אוגוסט' },
  { value: 9, label: 'ספטמבר' },
  { value: 10, label: 'אוקטובר' },
  { value: 11, label: 'נובמבר' },
  { value: 12, label: 'דצמבר' },
]

const cleanValue = (v) => String(v ?? '').replace(/["']/g, '').trim()

function parseMonthYear(v) {
  const s = cleanValue(v)
  if (!s) return { year: '', month: '' }

  const parts = s.split('-')
  if (parts.length !== 2) return { year: '', month: '' }

  const [p1, p2] = parts
  if (p1.length <= 2 && p2.length === 4) return { month: p1.replace(/^0/, ''), year: p2 }
  if (p1.length === 4 && p2.length <= 2) return { year: p1, month: p2.replace(/^0/, '') }

  return { year: '', month: '' }
}

function formatMonthYear(year, month) {
  if (!year || !month) return ''
  return `${String(month).padStart(2, '0')}-${year}`
}

export default function MonthYearPicker({
  value = '',
  onChange,
  label,
  disabled = false,
  error = false,
  required = false,
  helperText,
  size = 'sm',
  readOnly = false,
  context = 'default',
  selectPropsM = {},
  selectPropsY = {},
}) {
  const id = React.useId()
  const inputId = `${id}-month-year`
  const helpId = `${inputId}-help`
  const currentYear = new Date().getFullYear()

  const years = React.useMemo(() => {
    const len = context === 'birth' ? 100 : 20
    return Array.from({ length: len }, (_, i) => currentYear - i)
  }, [context, currentYear])

  const [{ year, month }, setYM] = React.useState(() => parseMonthYear(value))
  const prevPropRef = React.useRef(value)
  const prevOutRef = React.useRef('')

  const monthBtnRef = React.useRef(null)
  const yearBtnRef = React.useRef(null)

  React.useEffect(() => {
    if (value === prevPropRef.current) return
    prevPropRef.current = value
    setYM(parseMonthYear(value))
  }, [value])

  React.useEffect(() => {
    if (!year || !month) return

    const out = formatMonthYear(year, month)
    if (out === prevOutRef.current) return

    prevOutRef.current = out
    onChange(out)
  }, [year, month, onChange])

  React.useEffect(() => {
    if (disabled) {
      monthBtnRef.current?.blur()
      yearBtnRef.current?.blur()
    }
  }, [disabled])

  const handleMonth = React.useCallback((_, newMonth) => {
    setYM((prev) => ({ ...prev, month: newMonth || '' }))
    requestAnimationFrame(() => monthBtnRef.current?.focus())
  }, [])

  const handleYear = React.useCallback((_, newYear) => {
    setYM((prev) => ({ ...prev, year: newYear || '' }))
    requestAnimationFrame(() => yearBtnRef.current?.focus())
  }, [])

  const resolvedLabel =
    label ||
    (context === 'payment'
      ? 'חודש תשלום'
      : context === 'meeting'
      ? 'חודש פגישה'
      : context === 'birth'
      ? 'תאריך לידה (שנה + חודש)'
      : 'תאריך (שנה + חודש)')

  const resolvedHelperText =
    helperText ||
    (context === 'payment'
      ? 'ציין עבור איזה חודש התשלום מתבצע'
      : context === 'meeting'
      ? 'ציין לאיזה חודש שייכת הפגישה'
      : context === 'birth'
      ? 'ציין את שנת וחודש הלידה של השחקן'
      : '')

  return (
    <Stack spacing={sx.root.spacing}>
      <FormLabel htmlFor={inputId} required={required} sx={sx.label}>
        {resolvedLabel}
      </FormLabel>

      <Box sx={sx.row}>
        <Input
          id={inputId}
          readOnly
          value={formatMonthYear(year, month)}
          placeholder="הצג תאריך"
          size={size}
          readOnly={readOnly}
          color={error ? 'danger' : 'neutral'}
          disabled={disabled}
          aria-describedby={resolvedHelperText ? helpId : undefined}
          sx={sx.input}
        />

        <Select
          value={month || ''}
          onChange={handleMonth}
          disabled={disabled}
          size={size}
          readOnly={readOnly}
          slotProps={{
            button: { ref: monthBtnRef },
            listbox: { disablePortal: true, sx: sx.listbox },
          }}
          sx={sx.selectMonth}
          {...selectPropsM}
        >
          {MONTHS.map((m) => (
            <Option key={m.value} value={String(m.value)}>
              {m.label}
            </Option>
          ))}
        </Select>

        <Select
          value={year || ''}
          onChange={handleYear}
          disabled={disabled}
          size={size}
          readOnly={readOnly}
          slotProps={{
            button: { ref: yearBtnRef },
            listbox: { disablePortal: true, sx: sx.listbox },
          }}
          sx={sx.selectYear}
          {...selectPropsY}
        >
          {years.map((y) => (
            <Option key={y} value={String(y)}>
              {y}
            </Option>
          ))}
        </Select>
      </Box>
    </Stack>
  )
}
