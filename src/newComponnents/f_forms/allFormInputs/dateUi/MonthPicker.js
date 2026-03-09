import * as React from 'react';
import { Select, Option, IconButton, Box, Typography } from '@mui/joy';
import CloseRounded from '@mui/icons-material/CloseRounded';

const months = [
  { label: 'ינואר', value: '01' },
  { label: 'פברואר', value: '02' },
  { label: 'מרץ', value: '03' },
  { label: 'אפריל', value: '04' },
  { label: 'מאי', value: '05' },
  { label: 'יוני', value: '06' },
  { label: 'יולי', value: '07' },
  { label: 'אוגוסט', value: '08' },
  { label: 'ספטמבר', value: '09' },
  { label: 'אוקטובר', value: '10' },
  { label: 'נובמבר', value: '11' },
  { label: 'דצמבר', value: '12' },
];

export default function MonthPicker({ label = '', value, onChange, size = 'sm', }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const [selectedYear, setSelectedYear] = React.useState('');
  const [selectedMonth, setSelectedMonth] = React.useState('');

  React.useEffect(() => {
    if (value) {
      const [year, month] = value.split('-');
      setSelectedYear(year || '');
      setSelectedMonth(month || '');
    } else {
      setSelectedYear('');
      setSelectedMonth('');
    }
  }, [value]);

  const handleSelect = (year, month) => {
    if (year && month) {
      onChange(`${year}-${month}`);
    } else {
      onChange('');
    }
  };

  const clearYear = () => {
    setSelectedYear('');
    handleSelect('', selectedMonth);
  };

  const clearMonth = () => {
    setSelectedMonth('');
    handleSelect(selectedYear, '');
  };
  console.log('selectedYear', selectedYear)
  console.log('selectedMonth', selectedMonth)
  return (
    <Box>
      {label && (
        <Typography level="body-sm" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1, md: 2 } }}>

        {/* Select חודש */}
        <Box sx={{ position: 'relative', width: { xs: 120, md: 180 } }}>
          <Select
            size={size}
            value={selectedMonth || ''}
            placeholder="חודש"
            onChange={(e, newMonth) => {
              const updatedMonth = newMonth || '';
              setSelectedMonth(updatedMonth);
              handleSelect(selectedYear, updatedMonth);
            }}
            {...(selectedMonth && {
              endDecorator: (
                <IconButton
                  size={size}
                  variant="plain"
                  color="neutral"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={() => { setSelectedMonth(null) }}
                >
                  <CloseRounded />
                </IconButton>
              ),
              indicator: null,
            })}
            slotProps={{ listbox: { width: '100%' } }}
            sx={{ minWidth: 150 }}
          >
            <Option value=""> </Option>
            {months.map((month) => (
              <Option key={month.value} value={month.value}>
                {month.label}
              </Option>
            ))}
          </Select>

        </Box>

        {/* Select שנה */}
        <Box sx={{ position: 'relative', width: { xs: 120, md: 180 } }}>
          <Select
            size={size}
            value={selectedYear || ''}
            placeholder="שנה"
            onChange={(e, newYear) => {
              const updatedYear = newYear || '';
              setSelectedYear(updatedYear);
              handleSelect(updatedYear, selectedMonth);
            }}
            {...(selectedYear && {
              endDecorator: (
                <IconButton
                  size={size}
                  variant="plain"
                  color="neutral"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                  onClick={() => { setSelectedYear(null) }}
                >
                  <CloseRounded />
                </IconButton>
              ),
              indicator: null,
            })}
            slotProps={{ listbox: { width: '100%' } }}
            sx={{ minWidth: 150 }}
          >
            <Option value=""> </Option>
            {years.map((year) => (
              <Option key={year} value={String(year)}>
                {year}
              </Option>
            ))}
          </Select>
        </Box>

      </Box>
    </Box>
  );
}
