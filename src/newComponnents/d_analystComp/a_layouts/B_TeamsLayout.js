import React, { useState, useEffect } from 'react';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { deleteTeam } from '../../a_firestore/actionData/deleteData/deleteTeam.js';
import { isTeamComplete } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { useObjectAddStatus } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/joy/styles';
import { getDefaultActions } from '../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import teamImage from '../../b_styleObjects/images/teamImage.png';
import NewTeamForm from '../../f_forms/C_NewTeam';
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';
import LoadingCardContainer from '../a_containers/H_LoadingCardContainer.js';

export default function TeamsLayout(props) {
  const { teams, clubs, players, meetings, payments, tags, allShorts, gameStats, roles, games } = props;
  const [idDisplay, setIdDisplay] = useState('cardList');
  const [tab, setTab] = React.useState(0);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewTeam, setIsLoadingNewTeam] = useState(false);

  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const addActions = getDefaultActions({ type: 'teams' });
  const editActions = getDefaultQuickActions({ type: 'teams' });
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
    setIsLoadingNewTeam(false);
  };

  const allTeamsRaw = [...(teams || [])];

  const allTeams = allTeamsRaw.filter(isTeamComplete);

  const displayTeams = isLoadingNewTeam
    ? [...allTeams, { id: '__loading__' }]
    : allTeams;

  const actions = {
    ...addActions,
    ...editActions,
    onAdd: async (data, internalActions) => {
      setIsAdding(true);
      setLastAddedId(data.id);
      setIsLoadingNewTeam(true);
      await addActions.onAdd(data, internalActions);
    },
    onEditRole: async (data, internalActions) => {
      await editRoleActions.onEdit(data, internalActions);
    },
    onDelete: async (team) => {
      await deleteTeam(team, showSnackbar, allShorts, formProps);
    },
    setTab: setTab,
    setIdDisplay: setIdDisplay
  };

  return (
    <GenericObjectLayout
      id="teamsLayout"
      type="teams"
      view='profileAnalyst'
      tab={tab}
      title={tab === 0 ? 'קבוצות' : ''}
      icon={tab === 0 ? 'teams' : ''}
      idDisplay={idDisplay}
      rowData={{ teams: displayTeams }}
      columns={{ xs: 2, sm: 2, md: 5 }}
      form={NewTeamForm}
      formProps={formProps}
      actions={actions}
      getInitialState={(team) => {
        return {
          id: team?.id || '',
          photo: team?.photo,
          ifaLink: team?.ifaLink || '',
          teamName: team?.teamName || '',
          project: team?.project || false,
          active: team?.active ?? true,
          teamYear: team?.teamYear ?? '',
        };
      }}
      getChips={(p) => {
        return [
          {
            id: 'main',
            idItem: 'type',
            value: p.project,
            objectType: 'teams'
          },
          {
            id: 'primary',
            idItem: 'level',
            value: p?.level || 0,
            objectType: 'teams',
          },
          {
            id: 'secondary',
            idItem: 'levelPotential',
            value: p?.levelPotential || 0,
            objectType: 'teams',
          },
          {
            id: 'tertiary',
            idItem: 'link',
            value: p?.ifaLink || '',
            objectType: 'teams',
          },
        ]
      }}
      onClick={(e, team, actionItem, navigate) => {
        if (actionItem === null) {
          if (e.detail > 1) return;
          navigate(`/Team/${team.id}`);
        }
      }}
    />
  );
}
