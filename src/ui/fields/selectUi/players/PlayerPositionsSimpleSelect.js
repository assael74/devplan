// /// ui/fields/selectUi/players/PlayerPositionsSimpleSelect.js
import { useRef, useState, useEffect } from 'react';
import { FormControl, FormLabel, Select, Option, Stack, Typography } from '@mui/joy';

const POSITION_LIST = [
  { id: 'GK', label: 'שוער' },
  { id: 'DL', label: 'מגן שמאל' },
  { id: 'DCL', label: 'בלם שמאלי' },
  { id: 'DCR', label: 'בלם ימני' },
  { id: 'DR', label: 'מגן ימין' },
  { id: 'DML', label: 'מגן / כנף שמאלי' },
  { id: 'DM', label: 'קשר אחורי' },
  { id: 'DMR', label: 'מגן / כנף ימני' },
  { id: 'MCL', label: 'קשר אמצע שמאל' },
  { id: 'MCR', label: 'קשר אמצע ימין' },
  { id: 'AL', label: 'כנף שמאל' },
  { id: 'AC', label: 'קשר התקפי' },
  { id: 'AR', label: 'כנף ימין' },
  { id: 'S', label: 'חלוץ' }
]

export default function PlayerPositionsSimpleSelect({
  value,
  onChange,
  onClick,
  error = false,
  disabled = false,
  required,
  size = 'sm',
  label = ''
}) {
  const [selectOpen, setSelectOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setSelectOpen(false);
      }
    };

    if (selectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectOpen]);

  return (
    <div ref={selectRef}>
      <FormControl error={error} required={required} sx={{ width: '100%' }}>
        <Typography level="body-sm" sx={{ fontSize: '12px', lineHeight: 1.4, mb: 0.5 }}>{label}</Typography>

        <Select
          size={size}
          value={value}
          onClick={onClick}
          onChange={(e, val) => {
            e?.stopPropagation();
            onChange(val);
            setSelectOpen(false); // נסגר אחרי בחירה
          }}
          open={selectOpen}
          placeholder="בחר עמדה"
          indicator="▼"
          slotProps={{
            listbox: {
              sx: {
                maxHeight: 240,
                width: '100%',
              },
            },
          }}
        >
          {POSITION_LIST.map((opt) => (
            <Option key={opt.id} value={opt.id} onClick={(e) => e.stopPropagation()}>
              <Stack direction="row" gap={1} alignItems="center">
                {opt.id} - {opt.label}
              </Stack>
            </Option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
