import React from 'react';
import { Input, FormControl, FormLabel } from '@mui/joy';

export default function BirthDateField({ value, birth, onChange, size = 'sm', }) {
  const minDate = '1900-01-01';
  const maxDate = new Date().toISOString().split('T')[0];

  // חילוץ השנה מתוך MM-YYYY
  const birthYear = birth?.substring(3, 7); // ← לפי הפורמט שלך
  const defaultDateFromBirth = birthYear ? `${birthYear}-01-01` : '';
  const currentValue = value || defaultDateFromBirth;

  // סנכרון אם השנה משתנה
  React.useEffect(() => {
    if (birthYear && value) {
      const [, month = '01', day = '01'] = value.split('-');
      const newDate = `${birthYear}-${month}-${day}`;
      if (newDate !== value) {
        onChange(newDate);
      }
    }
  }, [birthYear]);

  return (
    <FormControl>
      <FormLabel sx={{ fontSize: '12px' }}>יום הולדת</FormLabel>
      <Input
        type="date"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        max={maxDate}
        size={size}
        variant="outlined"
      />
    </FormControl>
  );
}
