import * as React from 'react';
import { Box, Typography, Input } from '@mui/joy';

export default function GoalsField({ value, onChange, readOnly=false }) {
  const v = value && typeof value === 'object' ? value : { for: 0, against: 0, diff: 0 };

  const handleChange = (key, val) => {
    if (readOnly) return;
    const num = val === '' ? '' : Number(val);
    const updated = { ...v, [key]: num };
    const f = Number(updated.for) || 0;
    const a = Number(updated.against) || 0;
    updated.diff = f - a;
    onChange && onChange(updated);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box>
        <Typography sx={{ fontSize: '12px', fontWeight: 'md' }}>בעד</Typography>
        <Input
          size="sm"
          type="number"
          readOnly={readOnly}
          value={v.for}
          onChange={(e) => handleChange('for', e.target.value)}
          sx={{ width: 70 }}
        />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '12px', fontWeight: 'md' }}>נגד</Typography>
        <Input
          size="sm"
          type="number"
          readOnly={readOnly}
          value={v.against}
          onChange={(e) => handleChange('against', e.target.value)}
          sx={{ width: 70 }}
        />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '12px', fontWeight: 'md' }}>הפרש</Typography>
        <Input
          size="sm"
          type="number"
          value={v.diff}
          readOnly
          sx={{ width: 70, bgcolor: 'neutral.softBg' }}
        />
      </Box>
    </Box>
  );
}
