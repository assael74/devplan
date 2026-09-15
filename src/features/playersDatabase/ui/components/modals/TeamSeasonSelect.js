import {
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
} from '@mui/joy'

const formatSeasonOption = option => [
  option?.seasonKey,
  option?.leagueName,
  option?.ageGroupLabel,
].filter(Boolean).join(' · ')

export default function TeamSeasonSelect({
  seasonOptions = [],
  value = '',
  onChange,
  hideHelperText = false,
  sx,
}) {
  return (
    <FormControl size='sm' required sx={sx}>
      <FormLabel>עונת פעולה</FormLabel>
      <Select
        value={value || null}
        placeholder='בחר עונה'
        onChange={(event, nextValue) => onChange?.(nextValue || '')}
      >
        {seasonOptions.map(option => (
          <Option key={option.optionKey} value={option.optionKey}>
            {formatSeasonOption(option)}
          </Option>
        ))}
      </Select>
      {!hideHelperText ? (
        <FormHelperText>בחירה חובה לפני אישור הפעולה</FormHelperText>
      ) : null}
    </FormControl>
  )
}
