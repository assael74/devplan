// a_containers/ObjectMainContainer.jsx
import React from 'react';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { filterOptions } from '../../i_filters/filterOptions';
import { useObjectFilters } from '../../i_filters/hooks/useObjectFilters';
import { useObjectSorting } from '../../j_sortings/useObjectSorting.js'
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/joy/styles';
import { Box, Sheet, Stack, Button, Typography, IconButton, CircularProgress, Divider, Tooltip, Badge } from '@mui/joy';
import Layout from '../../Layout.js';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SpotifyFilterBar from '../../i_filters/SpotifyFilterBar';
import SortButtonWithDrawer from '../../j_sortings/SortButtonWithDrawer.js'
import DefaultEmpty from './I_DefaultEmpty';

export default function ObjectMainCardContainer({
  tab,
  type,
  icon,
  data,
  view,
  onAdd,
  title,
  gap = 1,
  AddForm,
  isLoading,
  idDisplay,
  formProps,
  actions = {},
  EmptyComponent,
  bottomTabs = [],
  hasFilteredData,
  renderItem = () => null,
  columns = { xs: 1, sm: 2, md: 3 },
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hasBottomTabs = Array.isArray(bottomTabs) && bottomTabs.length > 0;
  const bottomTabsHeight = isMobile ? 64 : 72;
  const appHeaderVar = 'var(--app-header-h, 56px)';

  const hasAnyData = () => {
    const list = type === 'videos'
      ? (formProps?.videos || []).filter(item =>
          tab === 0
            ? item.type === 'videosAnalysis'
            : item.type === 'videos'
        )
      : formProps?.[type] || [];

    if (view === 'profilePlayer') {
      return true
    }

    if (view === 'profileTeam') {
      return data.length > 0;
    }

    return list.length > 0;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {!isLoading ? (
        hasAnyData() ? (
          hasFilteredData ? (
            // עטיפה שמנהלת את הגובה והגלילה
            <Box
              sx={{
                height: hasBottomTabs ? '56vh' : 'auto',
                overflowY: hasBottomTabs ? 'auto' : 'visible',
                p: 0.5,
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: `repeat(${columns.xs}, minmax(0, 1fr))`,
                    sm: `repeat(${columns.sm}, minmax(0, 1fr))`,
                    md: `repeat(${columns.md}, minmax(0, 1fr))`,
                  },
                  gap,
                  alignItems: 'start',
                  width: '100%',
                  p:1
                }}
              >
                {data.map((item) => (
                  <Box key={item.id}>{renderItem(item)}</Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography level="h5">אין תוצאות התואמות לסינון הנוכחי</Typography>
              <Typography level="body-sm" color="neutral">
                נסה לשנות את הפילטרים
              </Typography>
            </Box>
          )
        ) : (
          EmptyComponent ? (
            <EmptyComponent />
          ) : (
            <DefaultEmpty
              type={type}
              title={title}
              icon={icon}
              onAdd={actions.onAdd}
              formProps={formProps}
            />
          )
        )
      ) : (
        <Box sx={{ mt: 2, p: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
