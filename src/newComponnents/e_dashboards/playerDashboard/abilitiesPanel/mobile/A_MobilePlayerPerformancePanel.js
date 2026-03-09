import React, { useState } from 'react';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import { boxPanelProps } from './X_Style';
import { Box, Typography, ButtonGroup, Button, IconButton, Divider, Drawer } from '@mui/joy';
import DefaultEmpty from '../../../../d_analystComp/a_containers/I_DefaultEmpty.js';
import TabWithTransition from '../../../newContainers/F_TabWithTransition.js';
import MobilePlayerStatsPanel from '../../statsPanel/mobile/MobilePlayerStatsPanel.js'
import MobilePlayerGamesPanel from '../../gamesPanel/mobile/A_MobilePlayerGamesPanel.js';

function GroupButtonPanel({setTabValue, tabValue}) {
  return (
    <ButtonGroup
      sx={{
        '--ButtonGroup-separatorColor': 'none !important',
        '& > span': {
          zIndex: 3,
          mb: 1,
          background: 'linear-gradient(to top, transparent, rgba(255 255 255 / 0.6), transparent)',
        },
      }}
      variant="solid"
      size='sm'
      aria-label="tooltip button group"
    >
      <Button
        startDecorator={iconUi({id: 'games', size: 'sm'})}
        onClick={() => setTabValue(0)}
        size='sm'
        color={tabValue === 0 ? 'success' : 'neutral'}
      >
       משחקים
      </Button>
      <Divider />
      <Button
        size='sm'
        startDecorator={iconUi({id: 'gameStats', size: 'sm'})}
        onClick={() => setTabValue(1)}
        color={tabValue === 1 ? 'success' : 'neutral'}
      >
       סטטיסטיקה
      </Button>
    </ButtonGroup>
  )
}

export default function MobilePlayerPerformancePanel(props) {
  const { player, statsParm, actions, playerGames, allShorts, formProps, isMobile, view } = props;
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ ...boxPanelProps, width: '100%' }}>

      <GroupButtonPanel setTabValue={setTabValue} tabValue={tabValue} />

      {/* אזור התוכן עם גלילה ואנימציה */}
      {tabValue === 0 &&  (
        <TabWithTransition isActive={tabValue === 0} tabKey="games">
          <Box sx={{ px: 0 }}>
            <MobilePlayerGamesPanel
              view={view}
              player={player}
              isMobile={true}
              actions={actions}
              allShorts={allShorts}
              formProps={formProps}
              playerGames={playerGames}
            />
          </Box>
        </TabWithTransition>
      )}

      {tabValue === 1 &&  (
        <TabWithTransition isActive={tabValue === 1} tabKey="gameStats">
          <Box sx={{ px: 0 }}>
            <MobilePlayerStatsPanel
              view={view}
              player={player}
              isMobile={true}
              actions={actions}
              statsParm={statsParm}
              allShorts={allShorts}
              formProps={formProps}
              playerGames={playerGames}
            />
          </Box>
        </TabWithTransition>
      )}

    </Box>
  );
}
