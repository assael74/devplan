import React, { useState } from 'react';
import { Box, Tabs, TabList, Tab, Typography } from '@mui/joy';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import { boxPanelProps, tabSx, tabsBoxProps, tabListProps } from './X_Style';
import TabWithTransition from '../../../newContainers/F_TabWithTransition.js';
import DeskTopGamesList from '../../gamesPanel/desktop/A_DeskTopGamesList.js'
import DesktopTeamStatsPanel from '../../statsPanel/desktop/DesktopTeamStatsPanel.js'

export default function DesktopPerformancePanel(props) {
  const { team, statsParm, actions, teamGames, allShorts, formProps, isMobile, view } = props;
  const [tabValue, setTabValue] = useState(0);

  const showTabs = !props.actions.openSort

  return (
    <Box sx={{ ...boxPanelProps, width: '100%' }}>
      {tabValue === 0 &&  (
        <TabWithTransition isActive={tabValue === 0} tabKey="games">
          <Box sx={{ px: 6 }}>
            <DeskTopGamesList
              view={view}
              team={team}
              isMobile={false}
              actions={actions}
              allShorts={allShorts}
              formProps={formProps}
              teamGames={teamGames}
            />
          </Box>
        </TabWithTransition>
      )}

      {tabValue === 1 &&  (
        <TabWithTransition isActive={tabValue === 1} tabKey="gameStats">
          <Box sx={{ px: isMobile ? 0 : 6 }}>
            <DesktopTeamStatsPanel
              view={view}
              team={team}
              formProps={formProps}
              statsParm={statsParm}
            />
          </Box>
        </TabWithTransition>
      )}

      {/* סרגל טאבים תחתון */}
      <Box>
        {showTabs && (
          <Box {...tabsBoxProps}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="plain">
              <TabList {...tabListProps}>
                <Tab value={0} sx={tabSx(tabValue === 0, 'games')}>
                  {iconUi({ id: 'games', size: 'sm' })}
                  <Typography level="body-sm">משחקים</Typography>
                </Tab>
                <Tab value={1} sx={tabSx(tabValue === 1, 'gameStats')}>
                  {iconUi({ id: 'gameStats', size: 'sm' })}
                  <Typography level="body-sm">סטטסיטיקה</Typography>
                </Tab>
              </TabList>
            </Tabs>
          </Box>
        )}
      </Box>
    </Box>
  );
}
