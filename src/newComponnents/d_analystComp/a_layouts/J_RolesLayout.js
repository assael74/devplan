import React, { useState } from 'react';
import { deleteRole } from '../../a_firestore/actionData/deleteData/deleteRole.js';
import { getDefaultActions } from '../../f_forms/X_Actions';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import NewRoleForm from '../../f_forms/L_NewRole';
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';

export default function RolesLayout(props) {
  const { clubs, teams, players, meetings, statsParm, games, roles, allShorts } = props;
  const [idDisplay, setIdDisplay] = useState('tableList');
  const [tab, setTab] = useState(0);

  const { showSnackbar } = useSnackbar();

  const addActions = getDefaultActions({ type: 'roles' });
  const editActions = getDefaultQuickActions({ type: 'roles' });

  const actions = {
    ...addActions,
    ...editActions,
    onAdd: async (data, internalActions) => {
      await addActions.onAdd(data, internalActions);
    },
    onEdit: async (data, internalActions) => {
      await editActions.onEdit(data, internalActions);
    },
    onDelete: async (role) => {
      await deleteRole(role, showSnackbar, allShorts, formProps);
    },
    setTab: setTab,
    setIdDisplay: setIdDisplay
  };

  const allRolesRaw = [...(roles || [])];

  const allRoles = allRolesRaw;

  const displayRoles = allRoles

  const formProps = {
    players,
    teams,
    clubs,
    meetings,
    statsParm,
    games,
    roles
  }

  return (
    <GenericObjectLayout
      id="rolesLayout"
      type="roles"
      view='profileAnalyst'
      tab={tab}
      title="אנשי מקצוע"
      icon="roles"
      form={NewRoleForm}
      idDisplay={idDisplay}
      rowData={{ roles: displayRoles }}
      formProps={formProps}
      columns={{ xs: 2, sm: 3, md: 4 }}
      actions={actions}
      getInitialState={(role) => ({
        id: role?.id || '',
        fullName: role?.fullName || '',
        type: role?.type || '-',
        clubId: role?.clubId || '',
        teamId: role?.teamId || '',
        photo: role?.photo || '',
        phone: role?.phone || '',
        email: role?.email || '',
      })}
      getChips={() => []}
    />
  );
}
