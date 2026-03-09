import React, { useState } from 'react';
import { Box, Tabs, TabList, Tab, TabPanel, Typography } from '@mui/joy';
import { deleteMeeting } from '../../../../a_firestore/actionData/deleteData/deleteMeeting.js';
import { useSnackbar } from '../../../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { getDefaultActions } from '../../../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../../../g_quickForms/X_Actions.js';
import { meetingMenuConfig } from '../../../../d_analystComp/a_layouts/X_menuConfig.js'
import { getFilterOptions } from '../../../../i_filters/filterOptions';
import { sortData } from '../../../../j_sortings/sortData.js'
import { useObjectFilters } from '../../../../i_filters/hooks/useObjectFilters';
import { useObjectSorting } from '../../../../j_sortings/useObjectSorting';
import { useObjectAddStatus, isMeetingComplete } from '../../../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { optionTypePayment, getStatusPaymentsList } from '../../../../x_utils/paymentsUtiles.js'
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';

import { boxPanelProps, tabSx, tabsBoxProps, tabListProps } from './X_Style';
import NewMeetingForm from '../../../../f_forms/F_NewMeeting.js';
import TabWithTransition from '../../../newContainers/F_TabWithTransition.js';
import SpotifyFilterBar from '../../../../i_filters/SpotifyFilterBar.js';
import SortButtonWithDrawer from '../../../../j_sortings/SortButtonWithDrawer.js';
import ObjectMainTableContainer from '../../../../d_analystComp/a_containers/DA_ObjectMainTableContainer.js';
import DefaultEmpty from '../../../../d_analystComp/a_containers/I_DefaultEmpty.js';

function HeaderTable({
  actions,
  filters,
  sorting,
  direction,
  setSorting,
  setDirection,
  formProps,
  player,
  view,
  handleFilterChange,
  handleResetFilters,
}) {
  return (
    <Box sx={{ mb: 0.5 }}>
      {/* פילטרים */}
      <Box>
        <SpotifyFilterBar
          type="meetings"
          filters={filters}
          isMobile={false}
          view={view}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          filterOptions={getFilterOptions(formProps, view)}
        />
      </Box>

      {/* מיון */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 0.5, py: 0.5, pb: 1 }}>
        <Box sx={{ pr: 1 }}>
          <SortButtonWithDrawer
            type="games"
            sorting={sorting}
            onChange={(val) => {
              if (val === sorting) {
                setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              } else {
                setSorting(val);
                setDirection('asc');
              }
            }}
            direction={direction}
            view={view}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default function DesktopPlayerMeetingPanel(props) {
  const { player, allShorts, formProps, meetings, players, isMobile, view, hasFilteredData } = props;
  const [filters, setFilters] = useState({});
  const [sorting, setSorting] = useState('byAlfa');
  const [direction, setDirection] = useState('asc');
  const [tabValue, setTabValue] = useState(0);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewMeeting, setIsLoadingNewMeeting] = useState(false);
  const [actionItem, setActionItem] = React.useState(null);
  const [updates, setUpdates] = useState({});
  const { showSnackbar } = useSnackbar();

  const addActions = getDefaultActions({ type: 'meetings' });
  const editActions = getDefaultQuickActions({ type: 'meetings' });

  const allMeetings = (formProps.meetings || []).filter(p => p.playerId === player.id);
  const meetingsList = allMeetings.filter(isMeetingComplete);

  useObjectAddStatus({
    list: meetingsList,
    objectId: lastAddedId,
    isWaiting: isAdding,
    type: 'meetings',
    clear: () => {
      setIsAdding(false);
      setLastAddedId(null);
      setIsLoadingNewMeeting(false);
    },
  });

  const getInitialState = (meeting) => ({
    playerId: player.id,
    id: meeting?.id || '',
    meetingDate: meeting?.meetingDate || '',
    meetingHour: meeting?.meetingHour || '',
    meetingFor: meeting?.meetingFor || '',
    status: meeting?.status || {},
    type: meeting?.type || '',
    notes: meeting?.notes || '',
    eventId: meeting?.eventId || '',
    isInGoogleCalendar: meeting?.isInGoogleCalendar || '',
  });

  const initialData = {
    playerId: player.id,
    playerFullName: player.playerFullName
  };

  const handleSetUpdate = (id, data) => {
    setUpdates((prev) => ({ ...prev, [id]: data }));
  };

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => setFilters({});

  const filteredMeetings = React.useMemo(() => {
    let list = [...meetingsList];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        list = list.filter((p) => String(p[key]) === String(value));
      }
    });
    return sortData(list, sorting, formProps, direction);
  }, [meetingsList, filters, sorting, direction])

  const actions = {
    ...addActions,
    ...editActions,
    meetingsList,
    onAdd: async (data, internalActions) => {
      setIsAdding(true);
      setLastAddedId(data.id);
      setIsLoadingNewMeeting(true);
      await addActions.onAdd(data, internalActions);
    },
    onDelete: async (meeting) => {
      await deleteMeeting(meeting, showSnackbar, allShorts);
    },
    openSort: props.actions.openSort,
    setOpenSort: props.actions.setOpenSort
  };

  return (
    <Box sx={{ ...boxPanelProps, width: '100%' }}>
      <HeaderTable
        actions={actions}
        filters={filters}
        sorting={sorting}
        direction={direction}
        setSorting={setSorting}
        formProps={formProps}
        player={player}
        view={view}
        setDirection={setDirection}
        handleFilterChange={handleFilterChange}
        handleResetFilters={handleResetFilters}
      />
      {/* אזור התוכן עם גלילה ואנימציה */}
      <Box sx={{ px: isMobile ? 0 : 6 }}>
      {meetingsList.length === 0 ?
        <DefaultEmpty
          type='meetings'
          icon='meetings'
          onAdd={actions.onAdd}
        />
        :
        <Box>
        {filteredMeetings.length === 0 ?
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography level="h5">אין תוצאות התואמות לסינון הנוכחי</Typography>
            <Typography level="body-sm" color="neutral">
              נסה לשנות את הפילטרים
            </Typography>
          </Box>
          :
          <ObjectMainTableContainer
            gap={2}
            tab={0}
            view={view}
            title='מפגשים'
            icon='meetings'
            type='meetings'
            isMobile={isMobile}
            actions={actions}
            updates={updates}
            allShorts={allShorts}
            setUpdates={setUpdates}
            actionItem={actionItem}
            idDisplay='tableList'
            menuConfig={() => meetingMenuConfig()}
            setActionItem={setActionItem}
            getInitialState={getInitialState}
            data={meetingsList}
            formProps={{ ...formProps, onSave: null }}
          />
        }
        </Box>
      }
      </Box>
    </Box>
  );
}
