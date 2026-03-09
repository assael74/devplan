import React, { useState } from 'react';
import moment from 'moment';
import 'moment/locale/he';
import { deleteMeeting } from '../../../a_firestore/actionData/deleteData/deleteMeeting.js';
import { useSnackbar } from '../../../h_SnackBar/SnackbarProvider.js';
import { Box, Tabs, TabList, Tab, Typography } from '@mui/joy';
import { getDefaultActions } from '../../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../../g_quickForms/X_Actions.js';
import { useObjectAddStatus, isMeetingComplete } from '../../../h_SnackBar/useObjectAddStatus.js';
import { statusMeetingList, optionTypeMeeting } from '../../../x_utils/optionLists.js';
import { getTimeUntilMeeting, getMeetingDate } from '../../../x_utils/dateUtiles.js';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';
import { tabSx, tabsBoxProps, tabListProps } from './X_Style';
import ObjectMiniContainer from '../../containers/A_ObjectMiniContainer.js';
import CardMiniContainer from '../../containers/B_CardMiniContainer.js';
import MenuItemsMIniContainer from '../../containers/C_MenuItemsMIniContainer.js';
import TabWithTransition from '../../containers/F_TabWithTransition.js';
import NewMeetingForm from '../../../f_forms/F_NewMeeting.js';
import { meetingMenuConfig } from './X_menuConfig.js';

const getSubtitle = (timeStr) => (
  <Typography level="body-sm" component="span">
    {`בשעה ${timeStr}`}
  </Typography>
);

export default function PlayerProPanel(props) {
  const { player, formProps, allShorts, players, meetings } = props;
  const [tabValue, setTabValue] = useState(0);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewMeeting, setIsLoadingNewMeeting] = useState(false);
  const [actionItem, setActionItem] = React.useState(null);
  const [updates, setUpdates] = useState({});
  const { showSnackbar } = useSnackbar();

  const addActions = getDefaultActions({ type: 'meetings' });
  const editActions = getDefaultQuickActions({ type: 'meetings' });

  const allMeetings = (meetings || []).filter(p => p.playerId === player.id);
  const meetingsList = allMeetings.filter(isMeetingComplete);

  const initialData = {
    playerId: player.id,
    playerFullName: player.playerFullName,
  };

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

  const handleSetUpdate = (id, data) => {
    setUpdates((prev) => ({ ...prev, [id]: data }));
  };

  const getInitialState = (meeting) => ({
    playerId: player.id,
    meetingDate: meeting.meetingDate,
    meetingHour: meeting.meetingHour,
    meetingFor: meeting.meetingFor,
    notes: meeting.notes,
    status: meeting.status,
    type: meeting.type,
    videoLink: meeting.videoLink,
  });

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

  const showTabs = !props.actions.openSort

  const renderMeetings = () => (
    <ObjectMiniContainer
      title="פגישות"
      icon="meetings"
      type="meetings"
      formProps={formProps}
      initialData={initialData}
      actions={actions}
      AddForm={NewMeetingForm}
      data={meetingsList}
      columns={{ xs: 1, sm: 2, md: 3 }}
      renderItem={(meeting) => {
        const playerObj = players.find(p => p.id === meeting.playerId);
        const update = updates[meeting.meetingId] || getInitialState(meeting);
        const setUpdate = (data) => handleSetUpdate(meeting.meetingId, data);
        const status = statusMeetingList.find(p => p.id === meeting.status.id);
        const type = optionTypeMeeting.find(p => p.id === meeting.type);
        const timeStr = meeting.meetingHour;

        return (
          <CardMiniContainer
            key={meeting.meetingId}
            item={meeting}
            icon="meeting"
            title={getMeetingDate(meeting)}
            subtitle={getSubtitle(timeStr)}
            chips={[
              {
                label: type.labelH,
                color: 'primary',
                icon: iconUi({ id: type.idIcon }),
              },
              {
                label: status.labelH,
                color: status.id === 'new' ? 'success' : status.id === 'canceled' ? 'danger' : 'success',
                icon: iconUi({ id: status.idIcon }),
              },
            ]}
            content={
              getTimeUntilMeeting(meeting) && (
                <Typography level="body-sm" color="success">
                  הפגישה {getTimeUntilMeeting(meeting)}
                </Typography>
              )
            }
            menuComponent={
              <MenuItemsMIniContainer
                type="meetings"
                item={meeting}
                formProps={formProps}
                actions={{
                  ...actions,
                  update,
                  setUpdate,
                  actionItem,
                  setActionItem,
                }}
                menuConfig={meetingMenuConfig(playerObj)}
              />
            }
            getInitialState={getInitialState}
            update={update}
            setUpdate={setUpdate}
            actions={actions}
          />
        );
      }}
      gap={2}
    />
  );

  return (
    <Box sx={{ px: 1, pt: 2, pb: 10, width: '100%' }}>
      {/* תוכן הטאב */}
      <Box sx={{ width: '100%', minHeight: '60vh', overflowY: 'auto' }}>
        <TabWithTransition tabKey={tabValue} isActive={true}>
          {tabValue === 0 && renderMeetings()}
          {tabValue === 1 && <Box>וידאו בקרוב...</Box>}
          {tabValue === 2 && <Box>נתונים סטטיסטיים יופיעו כאן</Box>}
        </TabWithTransition>
      </Box>

      {/* טאבים תחתונים */}
      {showTabs && (
        <Box {...tabsBoxProps}>
          <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} variant="plain">
            <TabList {...tabListProps}>
              <Tab value={0} sx={tabSx(tabValue === 0)}>
                {iconUi({ id: 'info', size: 'sm' })}
                <Typography level="body-sm">מפגשים</Typography>
              </Tab>
              <Tab value={1} sx={tabSx(tabValue === 1)}>
                {iconUi({ id: 'video', size: 'sm' })}
                <Typography level="body-sm">וידאו</Typography>
              </Tab>
              <Tab value={2} sx={tabSx(tabValue === 2)}>
                {iconUi({ id: 'stats', size: 'sm' })}
                <Typography level="body-sm">סטטיסטיקה</Typography>
              </Tab>
            </TabList>
          </Tabs>
        </Box>
      )}
    </Box>
  );
}
