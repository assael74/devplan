import * as React from 'react';
import { iconUi } from './b_styleObjects/icons/IconIndex.js';
import {
  titleProps,
  badgeProps,
  boxSortingBox,
  sheetIconProps,
  filterBoxProps,
} from './d_analystComp/a_containers/containersStyle/B_HeaderContainerStyle.js';
import { getFilterOptions } from './i_filters/filterOptions';
import { Box, Typography, Button, IconButton, Tooltip, Sheet, Divider } from '@mui/joy';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SpotifyFilterBar from './i_filters/SpotifyFilterBar';
import FilterBar from './i_filters/FilterBar';
import SortButtonWithDrawer from './j_sortings/SortButtonWithDrawer.js';

export default function DynamicMainHeader(props) {
  const {
    tab,
    icon,
    type,
    title,
    isMobile,
    data = [],
    toggleView,
    actions = {},
    formProps = {},
    form: AddForm,
    bottomTabs = [],
    filterActions = {},
    sortingActions = {},
    idDisplay = 'cardsList',
  } = props;

  const { sorting, setSorting, direction } = sortingActions;

  const notShowNewItem =
    (type === 'payments' && tab === 1) ||
    (type === 'meetings' && tab === 1) ||
    (type === 'videos' && tab === 1);

  const notShowSorting =
    (type === 'payments' && tab === 1) ||
    (type === 'meetings' && tab === 1) ||
    (type === 'videos' && tab === 1);

  const list = Array.isArray(formProps?.[type]) ? formProps[type] : [];
  const zeroObjects = list.length === 0

  const noShowButtonIdDisplayArr = ['tags', 'videos', 'statsParm', 'games', 'roles']
  const noShowButtonIdDisplay = !noShowButtonIdDisplayArr.includes(type)

  return (
    <Sheet
      variant="plain"
      sx={{
        '--MainHeader-h': { xs: '56px', sm: '64px' },
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        minHeight: 'var(--MainHeader-h)',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 2,
        p: 0.5,
        bgcolor: '#fff',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 'sm',
        boxShadow: { xs: 'sm', sm: 'md' },
      }}
    >
    {isMobile ? (
      <Box sx={{ width:"100%" }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:2, justifyContent:"flex-start", width: "100%" }}>
          <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
            <Sheet {...sheetIconProps}>
              {icon && iconUi({ id: icon, size: isMobile ? 'lg' : 'xl' })}
            </Sheet>
            <Box key={title}>
              <Typography {...titleProps(type)}>{title}</Typography>
            </Box>
          </Box>
          {AddForm && (
            <Box>
              <AddForm idForm={`new${title}`} {...formProps} formProps={formProps} idNav='PageHeaderContainer' />
            </Box>
          )}
        </Box>
        <Divider sx={{ mt: 1 }}/>
        <Box display="flex" alignItems="center" justifyContent='flex-end' width="100%" p={1} gap={2} pt={2}>
          {noShowButtonIdDisplay ?
            <Box sx={{ flexGrow: 1 }}>
              <Tooltip title={idDisplay === 'cardList' ? 'הצג טבלה' : 'הצג כרטיסים'}>
                <IconButton size='sm' variant="soft" onClick={toggleView}>
                  {iconUi({id: idDisplay, size: 'sm'})}
                </IconButton>
              </Tooltip>
            </Box>
            :
            null
          }
          {!notShowSorting && (
            <SortButtonWithDrawer
              direction={direction}
              type={type}
              size="sm"
              view='profileAnalyst'
              sorting={sorting}
              onChange={setSorting}
            />
          )}
          <FilterBar
            type={type}
            size="sm"
            isMobile
            view='profileAnalyst'
            filters={filterActions.filters}
            filterOptions={getFilterOptions(formProps, 'profileAnalyst')}
            onFilterChange={(key, val) => filterActions.setFilters(prev => ({ ...prev, [key]: val }))}
            onResetFilters={filterActions.handleResetFilters}
          />
        </Box>
      </Box>
    ) : (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:2, justifyContent:"flex-start", width:"100%" }}>
          <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
            <Sheet {...sheetIconProps}>
              {icon && iconUi({ id: icon, size: isMobile ? 'lg' : 'xl' })}
            </Sheet>
            <Box key={title}>
              <Typography {...titleProps(type)}>{title}</Typography>
            </Box>
          </Box>
          {!notShowNewItem && (
            <>
              {AddForm && (
                <Box>
                  <AddForm idForm={`new${title}`} actions={actions} {...formProps} formProps={formProps} idNav='PageHeaderContainer' />
                </Box>
              )}
            </>
          )}
        </Box>
        {!notShowSorting && (
          <>
            <Divider sx={{ mt: 1 }}/>
            <Box display="flex" alignItems="center" justifyContent='flex-end' width="100%" p={1} gap={2}>
              {noShowButtonIdDisplay ?
                <Box sx={{ flexGrow: 1 }}>
                  <Tooltip title={idDisplay === 'cardList' ? 'הצג טבלה' : 'הצג כרטיסים'}>
                    <IconButton variant="soft" onClick={toggleView}>
                      {iconUi({id: idDisplay})}
                    </IconButton>
                  </Tooltip>
                </Box>
                :
                null
              }

              <SortButtonWithDrawer
                direction={direction}
                type={type}
                size="sm"
                view='profileAnalyst'
                sorting={sorting}
                onChange={setSorting}
              />
              <FilterBar
                type={type}
                size="sm"
                isMobile
                view='profileAnalyst'
                filters={filterActions.filters}
                filterOptions={getFilterOptions(formProps, 'profileAnalyst')}
                onFilterChange={(key, val) => filterActions.setFilters(prev => ({ ...prev, [key]: val }))}
                onResetFilters={filterActions.handleResetFilters}
              />

            </Box>
          </>
        )}
      </Box>
    )}
    </Sheet>
  );
}
