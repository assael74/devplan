import React, { useState } from 'react';
import { getDefaultActions } from '../../f_forms/X_Actions';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';

export default function StatsParmLayout(props) {
  const { clubs, teams, players, meetings, statsParm, games, allShorts } = props;
  const [idDisplay, setIdDisplay] = useState('tableList');
  const [tab, setTab] = useState(0);

  const { showSnackbar } = useSnackbar();

  const actions = {
    setTab: setTab,
    setIdDisplay: setIdDisplay
  };

  const formProps = {
    players,
    teams,
    clubs,
    meetings,
    statsParm,
    games,
  }

  return (
    <GenericObjectLayout
      id="statsParmLayout"
      type="statsParm"
      view='profileAnalyst'
      tab={tab}
      title="פרמטרים סטטיסטיים"
      icon="statsParm"
      idDisplay={idDisplay}
      rowData={{ statsParm }}
      formProps={formProps}
      columns={{ xs: 2, sm: 3, md: 4 }}
      actions={actions}
      getInitialState={(statsParm) => ({
        id: statsParm?.id || '',
        statsParmName: statsParm?.statsParmName || '',
        id: statsParm?.id || '',
        statsParmFieldType: statsParm?.statsParmFieldType || '-',
        statsParmType: statsParm?.statsParmType || '',
        statsParmNote: statsParm?.statsParmNote || '',
        isDefault: statsParm?.isDefault || false,
        order: statsParm?.order || '-',
      })}
      getChips={() => []}
    />
  );
}
