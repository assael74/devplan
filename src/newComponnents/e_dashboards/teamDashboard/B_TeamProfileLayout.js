import * as React from 'react';
import { Box, Typography } from '@mui/joy';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import { boxTabsProps, tabListPorps, tabProps, motiomBoxStyle } from './X_Style'
import { motion, AnimatePresence } from 'framer-motion';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import ObjectTopBar from '../newContainers/A_ObjectTopBar.js';

export default function TeamProfileLayout({
  object,
  name,
  type,
  onBack,
  actionsMenu,
  header,
  view,
  subTitle,
  avatarSrc,
  onAvatarClick,
  tabs = [],
  children,
  isMobile
}) {
  const [tabIndex, setTabIndex] = React.useState(0);
  const showTabs = tabs.length > 0;
  const MotionBox = motion.create(Box);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ObjectTopBar
        objectName={name || 'ללא שם'}
        objectType={type}
        onBack={onBack}
        view={view}
        isMobile={isMobile}
        subTitle={subTitle}
        avatarSrc={avatarSrc}
        actionsMenu={actionsMenu}
        objectLevel={object.level}
        onAvatarClick={onAvatarClick}
        objectLevelPotential={object.levelPotential}
      />

      {header && <Box>{header}</Box>}

      {/* תוכן עם רווח מתחתון לטאבים */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2, px: 1, pb: showTabs ? 8 : 2 }}>
        {showTabs ? (
          <Box>
            {tabs[tabIndex]?.content}
          </Box>
        ) : (
          children
        )}
      </Box>

      {/* טאבים תחתונים קבועים */}
      {showTabs && (
        <Box {...boxTabsProps}>
          <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ width: '100%' }}>
            <TabList {...tabListPorps}>
              {tabs.map((tab, index) => (
                <Tab key={index} value={index} {...tabProps(tabIndex, index)}>
                  {iconUi({ id: tab.iconId, size: isMobile ? 'sm' : 'md' })}
                  <Typography fontSize={isMobile ? '12px' : '14px'} level="body-xs">
                    {tab.label}
                  </Typography>
                </Tab>
              ))}

              {/* הקו הנע */}
              <MotionBox {...motiomBoxStyle(tabIndex)} />
            </TabList>
          </Tabs>
        </Box>
      )}
    </Box>
  );
}
