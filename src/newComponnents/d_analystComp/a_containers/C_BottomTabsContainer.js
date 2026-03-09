// 📁 a_containers/BottomTabsContainer.jsx
import React from 'react';
import { tabProps, tabListPorps, boxTabsProps } from './containersStyle/C_BottomTabsStyle.js'
import { Box, Tabs, TabList, Tab, ListItemDecorator, Typography } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';

export default function BottomTabsContainer({
  bottomTabs = [],
  tab = 0,
  setTab = () => {},
  icon,
  isMobile,
}) {
  const iconItem = (idIcon) => iconUi({ id: idIcon, size: isMobile ? 'sm' : 'md' })
  return (
    <Box {...boxTabsProps(isMobile)}>
      <Tabs value={tab} onChange={(e, val) => setTab(val)}>
        <TabList {...tabListPorps}>
          {bottomTabs.map((item, index) => (
            <Tab key={index} value={index} {...tabProps(tab, index)}>
              <Typography startDecorator={iconItem(item.idIcon)} fontSize={isMobile ? '12px' : '14px'} level="body-xs">
                {item.label}
              </Typography>
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </Box>
  );
}
