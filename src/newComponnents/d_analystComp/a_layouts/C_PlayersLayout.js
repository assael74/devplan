import React, { useState } from 'react';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { deletePlayer } from '../../a_firestore/actionData/deleteData/deletePlayer.js';
import { isPlayerComplete } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { useObjectAddStatus } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { getDefaultActions } from '../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions.js';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import playerImage from '../../b_styleObjects/images/playerImage.jpg';
import NewPlayerForm from '../../f_forms/D_NewPlayer';
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';
import LoadingCardContainer from '../a_containers/H_LoadingCardContainer.js';

export default function PlayersLayout(props) {
  const { teams, clubs, players, meetings, payments, tags, allShorts, gameStats, roles, games } = props;
  const [idDisplay, setIdDisplay] = useState('cardList');
  const [tab, setTab] = React.useState(0);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewPlayer, setIsLoadingNewPlayer] = useState(false);

  const { showSnackbar } = useSnackbar();

  const addActions = getDefaultActions({ type: 'players' });
  const editActions = getDefaultQuickActions({ type: 'players' });
  const addAbilitiesActions = getDefaultActions({ type: 'abilities' });
  const editAbilitiesActions = getDefaultQuickActions({ type: 'abilities' });

  const handleClearAfterAdd = () => {
    setIsAdding(false);
    setLastAddedId(null);
    setIsLoadingNewPlayer(false);
  };

  const allPlayersRaw = [...(players || [])];
  const allPlayers = allPlayersRaw.filter(isPlayerComplete);
  const displayPlayers = isLoadingNewPlayer
    ? [...allPlayers, { id: '__loading__' }]
    : allPlayers;

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

  const actions = {
    ...addActions,
    ...editActions,
    onAdd: async (data, internalActions) => {
      await addActions.onAdd(data, internalActions);
    },
    onEdit: async (data, internalActions) => {
      await editActions.onEdit(data, internalActions);
    },
    onDelete: async (player) => {
      await deletePlayer(player, showSnackbar, allShorts);
    },
    abilitiesActions: {
      onAdd: async (data, internalActions) => {
        await addAbilitiesActions.onAdd(data, internalActions);
        showSnackbar('נוסף טופס יכולות שחקן');
      },
      onEdit: async (data, internalActions) => {
        await editAbilitiesActions.onEdit(data, internalActions);
        showSnackbar('עודכן טופס יכולות שחקן');
      },
      onSaveDualEvaluation: async (finalData) => {
        const { oldItem, newItem, addItem } = finalData;
        // שמירה ל־playersShorts
        await editActions.onEdit(
          { oldItem, newItem, type: 'players' },
          actions
        );
        // שמירה ל־abilitiesShorts
        if (addItem?.formId) {
          await editAbilitiesActions.onEdit(
            { oldItem: {}, newItem, addItem, type: 'abilities' },
            actions
          );
        }

        showSnackbar('✅ שחקן ויכולות עודכנו');
      },
    },
    setTab: setTab,
    setIdDisplay: setIdDisplay
  };

  return (
    <GenericObjectLayout
      id="playersLayout"
      type="players"
      view='profileAnalyst'
      tab={tab}
      title={tab === 0 ? 'שחקנים' : ''}
      icon={tab === 0 ? 'players' : ''}
      idDisplay={idDisplay}
      rowData={{ players: allPlayers }}
      columns={{ xs: 2, sm: 2, md: 6 }}
      form={NewPlayerForm}
      formProps={formProps}
      actions={actions}
      getInitialState={(p) => {
        return {
          id: p.id,
          playerShortName: p.playerShortName,
          playerFirstName: p.playerFirstName,
          playerLastName: p.playerLastName,
          isOpenPayment: p.isOpenPayment,
          projectStatus: p.projectStatus,
          positions: p.positions,
          birthDay: p.birthDay,
          ifaLink: p.ifaLink,
          birth: p.birth,
          photo: p.photo,
          type: p.type,
        };
      }}
      getChips={(p) => {
        return [
          {
            id: 'main',
            idItem: 'type',
            value: p.type,
            objectType: 'players'
          },
          {
            id: 'primary',
            idItem: 'club',
            value: p.clubId,
            objectType: 'players',
          },
          {
            id: 'secondary',
            idItem: 'level',
            value: p?.level || 0,
            objectType: 'players',
          },
          {
            id: 'tertiary',
            idItem: 'link',
            value: p.ifaLink,
            objectType: 'players',
          },
        ]
      }}
      onClick={(e, p, actionItem, navigate) => {
        if (actionItem !== null) return;
        navigate(`/Player/${p.id}`);
      }}
    />
  );
}
