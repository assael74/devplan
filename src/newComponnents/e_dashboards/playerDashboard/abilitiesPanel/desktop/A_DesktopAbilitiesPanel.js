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
import DeskTopPlayerAbilitiesList from './B_DeskTopPlayerAbilitiesList.js'
import DeskTopPlayerReportList from './C_DeskTopPlayerReportList.js'
import FloatingAddButton from '../../../../d_analystComp/a_containers/J_FloatingAddButton.js'
import NewEvaluationForm from '../../../../f_forms/J_NewEvaluation.js'

export default function DesktopAbilitiesPanel(props) {
  const { player, statsParm, actions, playerGames, allShorts, formProps, isMobile, view } = props;
  const [tabValue, setTabValue] = useState(0);

  const showTabs = !props.actions.openSort

  return (
    <Box sx={{ width: '100%' }}>
      {tabValue === 0 &&  (
        <TabWithTransition isActive={tabValue === 0} tabKey="abilities">
          <Box sx={{ p: 1 }}>
            <DeskTopPlayerAbilitiesList
              view={view}
              player={player}
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
          <Box sx={{ p: 1 }}>
            <DeskTopPlayerReportList
              view={view}
              player={player}
              isMobile={false}
              actions={actions}
              allShorts={allShorts}
              formProps={formProps}
            />
          </Box>
        </TabWithTransition>
      )}

      <FloatingAddButton
        view={view}
        player={player}
        formProps={formProps}
        onEdit={actions.onEdit}
        formComponent={NewEvaluationForm}
        tooltipTitle='הוסף טופס הערכת יכולות'
        //onSaveAbilities={actions.abilitiesActions.onAdd}
      />

      {/* סרגל טאבים תחתון */}
      <Box>
        {showTabs && (
          <Box {...tabsBoxProps}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="plain">
              <TabList {...tabListProps}>
                <Tab value={0} sx={tabSx(tabValue === 0, 'abilities')}>
                  {iconUi({ id: 'abilities', size: 'sm' })}
                  <Typography level="body-sm">יכולות שחקן</Typography>
                </Tab>
                <Tab value={1} sx={tabSx(tabValue === 1, 'evaluation')}>
                  {iconUi({ id: 'administrator', size: 'sm' })}
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
