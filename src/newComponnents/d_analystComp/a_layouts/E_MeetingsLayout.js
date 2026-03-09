import React, { useState, useEffect } from 'react';
import { deleteMeeting } from '../../a_firestore/actionData/deleteData/deleteMeeting.js';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import moment from 'moment';
import { Typography, Box } from '@mui/joy';
import { isMeetingComplete } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { useObjectAddStatus } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { getDefaultActions } from '../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import playerImage from '../../b_styleObjects/images/playerImage.jpg';
import NewMeetingForm from '../../f_forms/F_NewMeeting';
import { statusMeetingList, optionTypeMeeting } from '../../x_utils/optionLists.js';
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';
import LoadingCardContainer from '../a_containers/H_LoadingCardContainer.js';

const bottomTabs = [
  { id: 'meetingsTab', label: 'פגישות', idIcon: 'meeting', value: 0, item: null },
  { id: 'meetingsPlanTab', label: 'תכנון פגישות', idIcon: 'meetingsPlan', value: 1, item: null },
];

export default function MeetingsLayout(props) {
  const { clubs, teams, players, meetings, payments, videos, videoAnalysis, tags, allShorts, gameStats } = props;
  const [idDisplay, setIdDisplay] = useState('cardList');
  const [tab, setTab] = React.useState(0);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewMeeting, setIsLoadingNewMeeting] = useState(false);

  const { showSnackbar } = useSnackbar();

  const formProps = {
    players,
    teams,
    clubs,
    meetings,
    payments,
    videoAnalysis,
    tags,
    gameStats
  }

  const addActions = getDefaultActions({ type: 'meetings' });
  const editActions = getDefaultQuickActions({ type: 'meetings' });

  const handleClearAfterAdd = () => {
    setIsAdding(false);
    setLastAddedId(null);
    setIsLoadingNewMeeting(false);
  };

  const allMeetingsRaw = [...(meetings || [])];

  const allMeetings = allMeetingsRaw.filter(isMeetingComplete);

  const displayMeetings = isLoadingNewMeeting
    ? [...allMeetings, { id: '__loading__' }]
    : allMeetings;

  useObjectAddStatus({
    list: allMeetings,
    objectId: lastAddedId,
    isWaiting: isAdding,
    type: 'meetings',
    clear: handleClearAfterAdd,
  });

  const actions = {
    ...addActions,
    ...editActions,
    onAdd: async (data, internalActions) => {
      setIsAdding(true);
      setLastAddedId(data.id);
      setIsLoadingNewMeeting(true);
      await addActions.onAdd(data, internalActions);
    },
    onDelete: async (meeting) => {
      await deleteMeeting(meeting, showSnackbar, allShorts);
    },
    setTab: setTab,
    setIdDisplay: setIdDisplay
  };

  return (
    <GenericObjectLayout
      id="meetingsLayout"
      type="meetings"
      view='profileAnalyst'
      tab={tab}
      title={tab === 0 ? 'פגישות' : 'תכנון פגישות'}
      icon={tab === 0 ? 'meetings' : 'meetingsPlan'}
      idDisplay={idDisplay}
      rowData={{ meetings: displayMeetings }}
      columns={{ xs: 2, sm: 2, md: 5 }}
      form={NewMeetingForm}
      bottomTabs={bottomTabs}
      formProps={formProps}
      actions={actions}
      getInitialState={(m) => {
        return {
          id: m?.id || '',
          meetingDate: m?.meetingDate || '',
          meetingHour: m?.meetingHour || '',
          meetingFor: m?.meetingFor || '',
          status: m?.status || {},
          type: m?.type || '',
          notes: m?.notes || '',
          eventId: m?.eventId || '',
          isInGoogleCalendar: m?.isInGoogleCalendar || '',
        };
      }}
      getChips={(p) => {
        return [
          {
            id: 'main',
            idItem: 'type',
            value: p.type,
            objectType: 'meetings'
          },
          {
            id: 'primary',
            idItem: 'status',
            value: p.status.id,
            objectType: 'meetings'
          },
          {
            id: 'secondary',
            idItem: 'isInCalendar',
            value: p.isInGoogleCalendar,
            objectType: 'meetings'
          },
        ]
      }}
      onClick={(e, m, actionItem, navigate) => {
        if (actionItem !== null || m.type !== 'personal') return;
        const player = players.find(p => p.id === m.playerId);
        if (!player) return;
        if (e.detail > 1) return;
        navigate(`/Player/${player.id}`);
      }}
    />
  );
}
