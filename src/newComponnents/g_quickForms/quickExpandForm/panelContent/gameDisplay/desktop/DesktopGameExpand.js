import React from 'react';
import {
  boxTeamProps,
  boxRivelProps,
  boxScoreProps,
  numberFieldProps,
  boxOneSideProps,
  boxContentProps
} from './X_Style'
import { isGameInPast } from '../../../../../x_utils/dateUtiles.js';
import { Box, Typography, Divider } from '@mui/joy';
import GenericInputField from '../../../../../f_forms/allFormInputs/inputUi/GenericInputField';
import DesktopGameTeamStatsExpand from './DesktopGameTeamStatsExpand'
import DesktopGamePlayerStatsExpand from './DesktopGamePlayerStatsExpand'

export default function DesktopGameExpand({
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
  handlePlayerStatChange = () => {},
}) {

  return (
    <Box {...boxContentProps}>
      <Box sx={{ width: '20%' }}>
        <Typography fontSize='14px' level="title-lg" fontWeight="lg" sx={{ mb: 1 }}>תוצאת משחק</Typography>
        {/* teams */}
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, mb: 1 }}>
          <Box {...boxTeamProps('team', result, goalsFor, goalsAgainst)}>
            <Typography fontSize='14px' level="title-sm" fontWeight="lg">
              {clubName || 'בחר קבוצה'}
            </Typography>
          </Box>

          <Box {...boxRivelProps('rivel', result, goalsFor, goalsAgainst)}>
            <GenericInputField
              value={rivel}
              variant="plain"
              placeholder="יריבה"
              onChange={(val) => handleChange('rivel', val)}
              readOnly={!isGameInPast(item.gameDate, item.gameHour) || view === 'profilePlayer'}
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
                placeholder="שערי זכות"
                readOnly={!isGameInPast(item.gameDate, item.gameHour) || view === 'profilePlayer'}
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
                placeholder="שערי חובה"
                onChange={(val) => handleChange('goalsAgainst', val)}
                readOnly={!isGameInPast(item.gameDate, item.gameHour) || view === 'profilePlayer'}
              />
            </Box>
            <Typography fontSize='12px' level="title-sm" fontWeight="lg">שערי חובה</Typography>
          </Box>
        </Box>
      </Box>

      <Divider orientation="vertical" />

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '80%' }}>
      {view === 'profilePlayer' ? (
        <DesktopGamePlayerStatsExpand
          item={item}
          view={view}
          actions={actions}
          isMobile={isMobile}
          formProps={formProps}
          handlePlayerStatChange={handlePlayerStatChange}
        />
      ) : (
        <DesktopGameTeamStatsExpand
          item={item}
          view={view}
          actions={actions}
          isMobile={isMobile}
          formProps={formProps}
          handleTeamStatChange={handleTeamStatChange}
        />
      )}

      </Box>
    </Box>
  );
}
