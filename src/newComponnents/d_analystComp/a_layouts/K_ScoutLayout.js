import React, { useState } from 'react';
import { deleteScouting } from '../../a_firestore/actionData/deleteData/deleteScouting.js';
import { getDefaultActions } from '../../f_forms/X_Actions';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import NewScoutingForm from '../../f_forms/M_NewScouting';
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';

export default function ScoutLayout(props) {
  const { clubs, teams, players, meetings, statsParm, games, roles, allShorts, scouting } = props;
  const [idDisplay, setIdDisplay] = useState('tableList');
  const [tab, setTab] = useState(0);

  const { showSnackbar } = useSnackbar();

  const addActions = getDefaultActions({ type: 'scouting' });
  const editActions = getDefaultQuickActions({ type: 'scouting' });

  const actions = {
    ...addActions,
    ...editActions,
    onAdd: async (data, internalActions) => {
      await addActions.onAdd(data, internalActions);
    },
    onEdit: async (data, internalActions) => {
      await editActions.onEdit(data, internalActions);
    },
    onDelete: async (scout) => {
      await deleteScouting(scout, showSnackbar, allShorts, formProps);
    },
    setTab: setTab,
    setIdDisplay: setIdDisplay
  };

  const allScoutRaw = [...(scouting || [])];

  const allScout = allScoutRaw;

  const displayScout = allScout

  const formProps = {
    players,
    teams,
    clubs,
    meetings,
    statsParm,
    games,
    roles,
    scouting
  }

  return (
    <GenericObjectLayout
      id="scoutingLayout"
      type="scouting"
      view='profileAnalyst'
      tab={tab}
      title="שחקנים תחת מעקב"
      icon="scouting"
      form={NewScoutingForm}
      idDisplay={idDisplay}
      rowData={{ scouting: displayScout }}
      formProps={formProps}
      columns={{ xs: 2, sm: 3, md: 4 }}
      actions={actions}
      getInitialState={(scouting) => ({
        //id: role?.id || '',
        //fullName: role?.fullName || '',
        //type: role?.type || '-',
        //clubId: role?.clubId || '',
        //teamId: role?.teamId || '',
        //photo: role?.photo || '',
        //phone: role?.phone || '',
        //email: role?.email || '',
      })}
      getChips={() => []}
    />
  );
}
