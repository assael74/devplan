import { Box, Input, Typography, IconButton } from '@mui/joy';
import ReplayIcon from '@mui/icons-material/Replay';

export default function ColorPickerField({ value, onChange, size = 'sm' }) {
  // value = { bg: '#ffffff', tex: '#000000' }

  const handleChange = (field, newColor) => {
    onChange({
      ...value,
      [field]: newColor
    });
  };

  const handleResetAll = () => {
    onChange({ bg: '', tex: '' });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {/* בחירת צבע רקע */}
      <Box>
        <Typography level="body-sm">צבע רקע</Typography>
        <Input
          type="color"
          size={size}
          value={value.bg || '#ffffff'}
          onChange={(e) => handleChange('bg', e.target.value)}
          sx={{ width: 50, height: 30, p: 0 }}
        />
      </Box>

      {/* בחירת צבע טקסט */}
      <Box>
        <Typography level="body-sm">צבע טקסט</Typography>
        <Input
          type="color"
          size={size}
          value={value.tex || '#000000'}
          onChange={(e) => handleChange('tex', e.target.value)}
          sx={{ width: 50, height: 30, p: 0 }}
        />
      </Box>

      {/* תצוגה מקדימה */}
      <Box
        sx={{
          bgcolor: value.bg || '#ffffff',
          color: value.tex || '#000000',
          border: '1px solid #ccc',
          borderRadius: '6px',
          px: 1,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          mb: -3,
          minWidth: 80,
          justifyContent: 'center'
        }}
      >
        טקסט לדוגמה
      </Box>

      {/* כפתור איפוס */}
      <IconButton
        size="sm"
        variant="outlined"
        color="neutral"
        onClick={handleResetAll}
        title="איפוס צבעים"
        sx={{ mb: -3 }}
      >
        <ReplayIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
