import React, { useEffect, useState } from 'react';
import { boxTeamProps, boxRivelProps, boxScoreProps, boxOneSideProps, numberFieldProps } from './X_Style';
import { isGameInPast } from '../../../../../x_utils/dateUtiles.js';
import { Box, Typography, Divider } from '@mui/joy';
import GenericInputField from '../../../../../f_forms/allFormInputs/inputUi/GenericInputField';
import MobileGameTeamStatsExpand from './MobileGameTeamStatsExpand';

const toLocalDateTime = (dateStr, timeStr = '00:00') => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const [hh, mm] = String(timeStr || '00:00').split(':').map(Number);
  return new Date(y, (m - 1), d, hh || 0, mm || 0, 0, 0);
};

const useCountdown = (target) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { diff, days, hours, minutes };
};

const TimePill = ({ value, label }) => (
  <Box sx={{
    minWidth: 36,
    px: 0.5,
    py: 0.25,
    borderRadius: '8px',
    border: '1px solid',
    borderColor: 'neutral.outlinedBorder',
    textAlign: 'center',
    lineHeight: 1,
  }}>
    <Typography
      fontSize='12px'
      level='title-sm'
      sx={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {String(value).padStart(2, '0')}
    </Typography>
    <Typography fontSize='10px' level="body-xs" color="neutral">{label}</Typography>
  </Box>
);

const MobileGameExpand = React.memo(function MobileGameExpand({
  view,
  item,
  isMobile,
  actions,
  rivel = '',
  formProps,
  result = '',
  clubName = '',
  goalsFor = 0,
  goalsAgainst = 0,
  handleChange = () => {},
  handleTeamStatChange = () => {},
}) {
  const target = toLocalDateTime(item.gameDate, item.gameHour);
  const { diff, days, hours, minutes, seconds } = useCountdown(target);
  const gameInPast = isGameInPast(item.gameDate, item.gameHour);
  const showCountdown = !gameInPast;

  if (showCountdown) {
    return (
      <Box sx={{ width: '100%', pb: 1, textAlign: 'center' }}>
        <Typography fontSize='14px' level="title-md" fontWeight="lg">המשחק יתחיל בעוד</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 1.5 }}>
          <TimePill value={days} label="ימים" />
          <TimePill value={hours} label="שעות" />
          <TimePill value={minutes} label="דקות" />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowY: 'auto', width: '100%' }}>
      {/* teams */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, mb: 2 }}>
        <Box {...boxTeamProps('team', result, goalsFor, goalsAgainst)}>
          <Typography fontSize='12px' level="title-sm" fontWeight="lg">
            {clubName || 'בחר קבוצה'}
          </Typography>
        </Box>

        <Box sx={{ width: '10%' }} />

        <Box {...boxRivelProps('rivel', result, goalsFor, goalsAgainst)}>
          <GenericInputField
            value={rivel}
            variant="plain"
            placeholder="יריבה"
            size='sm'
            onChange={(val) => handleChange('rivel', val)}
          />
        </Box>
      </Box>

      {/* score */}
      <Box {...boxScoreProps}>
        <Box {...boxOneSideProps('team')}>
          <Typography fontSize='12px' level="title-sm" fontWeight="lg">שערי זכות</Typography>
          <Box {...numberFieldProps}>
            <GenericInputField
              value={goalsFor}
              type="number"
              size='sm'
              disabled={!isGameInPast(item.gameDate, item.gameHour)}
              placeholder="שערי זכות"
              onChange={(val) => handleChange('goalsFor', val)}
            />
          </Box>
        </Box>

        <Box sx={{ width: '10%' }}>
          <Typography fontSize='12px' level="title-sm" fontWeight="lg">:</Typography>
        </Box>

        <Box {...boxOneSideProps('rivel')}>
          <Box {...numberFieldProps}>
            <GenericInputField
              value={goalsAgainst}
              type="number"
              size='sm'
              disabled={!isGameInPast(item.gameDate, item.gameHour)}
              placeholder="שערי חובה"
              onChange={(val) => handleChange('goalsAgainst', val)}
            />
          </Box>
          <Typography fontSize='12px' level="title-sm" fontWeight="lg">שערי חובה</Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 1 }} />

      <MobileGameTeamStatsExpand
        item={item}
        view={view}
        actions={actions}
        isMobile={isMobile}
        formProps={formProps}
        handleTeamStatChange={handleTeamStatChange}
      />
    </Box>
  );
});

export default MobileGameExpand;
