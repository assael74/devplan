import React, { useState, useEffect } from 'react';
import { deleteClub } from '../../a_firestore/actionData/deleteData/deleteClub.js';
import { isClubComplete } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { useObjectAddStatus } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { getDefaultActions } from '../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import NewClubForm from '../../f_forms/B_NewClub';
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';

export default function ClubsLayout(props) {
  const { teams, clubs, players, meetings, payments, tags, allShorts, gameStats, roles, games } = props;
  const [idDisplay, setIdDisplay] = useState('cardList');
  const [tab, setTab] = React.useState(0);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewClub, setIsLoadingNewClub] = useState(false);

  const { showSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const addActions = getDefaultActions({ type: 'clubs' });
  const editActions = getDefaultQuickActions({ type: 'clubs' });
  const editRoleActions = getDefaultQuickActions({ type: 'roles' });

  const formProps = {
    tags,
    roles,
    games,
    teams,
    clubs,
    players,
    meetings,
    payments,
    gameStats
  }

  const handleClearAfterAdd = () => {
    setIsAdding(false);
    setLastAddedId(null);
    setIsLoadingNewClub(false);
  };

  const allClubsRaw = [...(clubs || [])];

  const allClubs = allClubsRaw.filter(isClubComplete);

  const displayClubs = isLoadingNewClub
    ? [...allClubs, { id: '__loading__' }]
    : allClubs;

  const actions = {
    ...addActions,
    ...editActions,
    onAdd: async (data, internalActions) => {
      setIsAdding(true);
      setLastAddedId(data.id);
      setIsLoadingNewClub(true);
      await addActions.onAdd(data, internalActions);
    },
    onEditRole: async (data, internalActions) => {
      await editRoleActions.onEdit(data, internalActions);
    },
    onDelete: async (club) => {
      await deleteClub(club, showSnackbar, allShorts, formProps);
    },
    setTab: setTab,
    setIdDisplay: setIdDisplay
  };

  return (
    <GenericObjectLayout
      id="clubsLayout"
      type="clubs"
      view='profileAnalyst'
      tab={tab}
      title={tab === 0 ? 'מועדונים' : ''}
      icon={tab === 0 ? 'clubs' : ''}
      idDisplay={idDisplay}
      rowData={{ clubs: displayClubs }}
      form={NewClubForm}
      formProps={formProps}
      columns={{ xs: 1, sm: 2, md: 2 }}
      actions={actions}
      getInitialState={(club) => {
        return {
          id: club?.id || '',
          photo: club?.photo,
          ifaLink: club?.ifaLink || '',
          clubName: club?.clubName || '',
        };
      }}
      getChips={(p) => {
        return [
          {
            id: 'main',
            idItem: 'active',
            value: p.active,
            objectType: 'clubs'
          },
          {
            id: 'secondary',
            idItem: 'link',
            value: p.ifaLink,
            objectType: 'clubs'
          },
        ]
      }}
    />
  );
}
