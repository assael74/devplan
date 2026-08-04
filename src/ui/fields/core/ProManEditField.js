import * as React from 'react';
import { Input, FormLabel, Box } from '@mui/joy';

export const PRO_MAN_LABELS = {
  coach: 'מאמן',
  assistant: 'עוזר מאמן',
  analyst: 'אנליסט',
  physio: 'פיזיותרפיסט',
  // תוכל להוסיף עוד לפי הצורך
};

const getProManRoleLabel = (role) =>
  PRO_MAN_LABELS[role] || role;

export default function ProManEditField({ value, onChange, size = 'sm', isMobile }) {
  const [updatePro, setUpdatePro] = React.useState({
    role: '',
    fullName: '',
    phone: ''
  });

  // אתחול חד־פעמי מתוך value
  React.useEffect(() => {
    if (value) setUpdatePro(value);
  }, [value]);

  const handleProManChange = (field, newValue) => {
    const updated = {
      ...updatePro,
      [field]: newValue
    };
    setUpdatePro(updated);
    onChange(updated); // עדכון כלפי מעלה רק כאן
  };

  return (
    <Box>
      <FormLabel required sx={{ fontSize: '12px' }}>פרטי איש מקצוע</FormLabel>
      <Input
        value={updatePro.fullName}
        autoComplete="off"
        onChange={(e) => {
          const val = e.target.value;
          if (val.length <= 15) handleProManChange('fullName', val);
        }}
        placeholder="שם"
        variant="soft"
        size={size}
        startDecorator={
          <Input
            value={getProManRoleLabel(updatePro.role)}
            size={size}
            placeholder='תפקיד'
            variant="plain"
            onChange={(e) => { handleProManChange('role', e.target.value); }}
            sx={{ width: { xs: 80, md: 130 }, ml: { md: -1.4, xs: -1.1 }, mt: 0.1 }}
          />
        }
        endDecorator={
          <Input
            value={updatePro.phone}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val) && val.length <= 10) {
                handleProManChange('phone', val);
              }
            }}
            placeholder="טלפון"
            size={size}
            variant="solid"
            sx={{ width: { xs: 100, md: 130 }, mr: -1.4 }}
          />
        }
        sx={{ width: { md: 450, xs: 275 } }}
      />
    </Box>
  );
}
