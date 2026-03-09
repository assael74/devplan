import React, { useState } from 'react';
import { Box, Tabs, TabList, Tab, Typography } from '@mui/joy';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import { typeBackground } from '../../../../b_styleObjects/Colors.js'
import {
  tabSx,
  tabsBoxProps,
  tabListProps
 } from './X_Style';
import TabWithTransition from '../../../newContainers/F_TabWithTransition.js';
import DeskTopTeamAbilitiesList from './B_DeskTopTeamAbilitiesList.js'
import DeskTopTeamReportList from './C_DeskTopTeamReportList.js'

export default function DesktopAbilitiesPanel(props) {
  const { team, statsParm, actions, playerGames, allShorts, formProps, isMobile, view } = props;
  const [tabValue, setTabValue] = useState(0);

  const showTabs = !props.actions.openSort

  return (
    <Box sx={{ width: '100%' }}>
      {tabValue === 0 &&  (
        <TabWithTransition isActive={tabValue === 0} tabKey="abilities">
          <Box sx={{ px: 6 }}>
            <DeskTopTeamAbilitiesList
              view={view}
              team={team}
              isMobile={false}
              actions={actions}
              allShorts={allShorts}
              formProps={formProps}
            />
          </Box>
        </TabWithTransition>
      )}

      {tabValue === 1 &&  (
        <TabWithTransition isActive={tabValue === 1} tabKey="evaluation">
          <Box sx={{ px: 6 }}>
            <DeskTopTeamReportList
              view={view}
              team={team}
              isMobile={false}
              actions={actions}
              allShorts={allShorts}
              formProps={formProps}
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
                  <Typography level="body-sm">יכולות קבוצה</Typography>
                </Tab>
                <Tab value={1} sx={tabSx(tabValue === 1, 'gameStats')}>
                  {iconUi({ id: 'gameStats', size: 'sm' })}
                  <Typography level="body-sm">דיווחים</Typography>
                </Tab>
              </TabList>
            </Tabs>
          </Box>
        )}
      </Box>
    </Box>
  );
}
