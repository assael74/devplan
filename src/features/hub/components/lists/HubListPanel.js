// features/hub/components/lists/HubListPanel.js

import React from 'react'
import { Box, Chip, Tab, TabList, Tabs } from '@mui/joy'

import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

export default function HubListPanel({
  mode,
  onModeChange,
  counts = {},
  tabsMeta = [],
  children,
}) {
  const showTabs = tabsMeta.length > 1

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
      {showTabs ? (
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            p: 0.75,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.body',
          }}
        >
          <Tabs value={mode} onChange={(event, value) => onModeChange(value)}>
            <TabList
              disableUnderline
              sx={{
                gap: 0.5,
                p: 0.25,
                borderRadius: 'sm',
                bgcolor: 'background.level1',
                '& .MuiTab-root': {
                  minHeight: 34,
                  px: 0.75,
                  py: 0.4,
                  borderRadius: 'sm',
                  fontSize: 'sm',
                  fontWeight: 600,
                  flex: 1,
                  transition: 'background-color 180ms ease, color 180ms ease, transform 180ms ease',
                },
                '& .MuiTab-root:hover': {
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {tabsMeta.map((tab) => {
                const count = counts[tab.value]
                const colors = getEntityColors(tab.value)
                const selected = tab.value === mode
                const icon = React.isValidElement(tab.icon)
                  ? React.cloneElement(tab.icon, {
                    sx: {
                      ...tab.icon.props?.sx,
                      color: colors.accent,
                      fontSize: 18,
                    },
                  })
                  : tab.icon

                return (
                  <Tab
                    key={tab.value}
                    value={tab.value}
                    sx={{
                      bgcolor: selected ? colors.bg : 'transparent',
                      color: selected ? colors.text : 'text.secondary',
                      boxShadow: selected ? 'sm' : 'none',
                      '&:hover': {
                        bgcolor: selected ? colors.bg : 'background.level2',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {icon}
                      <span>{tab.label}</span>

                      {typeof count === 'number' ? (
                        <Chip
                          size="sm"
                          variant="soft"
                          sx={{
                            minHeight: 20,
                            px: 0.45,
                            bgcolor: selected ? colors.surface : 'background.surface',
                            color: colors.text,
                            fontWeight: 700,
                          }}
                        >
                          {count}
                        </Chip>
                      ) : null}
                    </Box>
                  </Tab>
                )
              })}
            </TabList>
          </Tabs>
        </Box>
      ) : null}

      <Box
        key={mode}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'hubListEnter 220ms ease-out',
          '@keyframes hubListEnter': {
            from: {
              opacity: 0,
              transform: 'translateY(6px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
