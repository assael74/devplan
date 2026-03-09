import React, { useState, useEffect } from 'react';
import { deletePayment } from '../../a_firestore/actionData/deleteData/deletePayment.js';
import { Typography, Box } from '@mui/joy';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { isPaymentComplete } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { useObjectAddStatus } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { getDefaultActions } from '../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import playerImage from '../../b_styleObjects/images/playerImage.jpg';
import NewPaymentForm from '../../f_forms/E_NewPayment';
import { optionTypePayment, getStatusPaymentsList } from '../../x_utils/paymentsUtiles.js'
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';
import LoadingCardContainer from '../a_containers/H_LoadingCardContainer.js';
import ObjectMainCardContainer from '../a_containers/D_ObjectMainCardContainer.js'
import PaymentsIncomeTab from '../a_containers/bottomTabUtils/paymentsTab/PaymentsIncomeTab.js'

const bottomTabs = [
  { id: 'requestsTab', label: 'בקשות תשלום', idIcon: 'requestsTab', value: 0, item: null },
  { id: 'incomeTab', label: 'הכנסה', idIcon: 'incomeTab', value: 1, item: PaymentsIncomeTab },
];

export default function PaymentsLayout(props) {
  const { players, payments, teams, meetings, clubs, tags, allShorts, gameStats } = props;
  const [idDisplay, setIdDisplay] = useState('cardList');
  const [tab, setTab] = React.useState(0);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewPayment, setIsLoadingNewPayment] = useState(false);

  const { showSnackbar } = useSnackbar();

  const formProps = {
    players,
    teams,
    clubs,
    meetings,
    payments,
    tags,
    payments,
    gameStats
  }
  const addActions = getDefaultActions({ type: 'payments' });
  const editActions = getDefaultQuickActions({ type: 'payments' });

  const handleClearAfterAdd = () => {
    setIsAdding(false);
    setLastAddedId(null);
    setIsLoadingNewPayment(false);
  };

  const allPaymentsRaw = [...(payments || [])];

  const allPayments = allPaymentsRaw.filter(isPaymentComplete);

  const displayPayments = isLoadingNewPayment
    ? [...allPayments, { id: '__loading__' }]
    : allPayments;

  useObjectAddStatus({
    list: allPayments,
    objectId: lastAddedId,
    isWaiting: isAdding,
    type: 'payments',
    clear: handleClearAfterAdd,
  });

  const actions = {
    ...addActions,
    ...editActions,
    paymentsList: displayPayments,
    onAdd: async (data, internalActions) => {
      setIsAdding(true);
      setLastAddedId(data.id);
      setIsLoadingNewPayment(true);
      await addActions.onAdd(data, internalActions);
    },
    onDelete: async (payment) => {
      await deletePayment(payment, showSnackbar, allShorts);
    },
    setTab: setTab,
    tab: tab,
    setIdDisplay: setIdDisplay
  };

  return (
    <GenericObjectLayout
      id="paymentsLayout"
      type="payments"
      view='profileAnalyst'
      tab={tab}
      icon={tab === 0 ? 'requestsTab' : 'incomeTab'}
      title={tab === 0 ? 'בקשות תשלום' : 'הכנסה'}
      icon={tab === 0 ? 'requestsTab' : 'incomeTab'}
      idDisplay={idDisplay}
      columns={{ xs: 2, sm: 2, md: 5 }}
      rowData={{ payments: displayPayments }}
      formProps={formProps}
      form={NewPaymentForm}
      getChips={(p) => [
        {
          id: 'main',
          idItem: 'type',
          value: p.type,
          objectType: 'payments',
        },
        {
          id: 'primary',
          idItem: 'paymentStatus',
          value: null,
          objectType: 'payments',
        },
        {
          id: 'secondary',
          idItem: 'paymentStatus',
          value: null,
          objectType: 'payments',
        },
      ]}
      actions={actions}
      getInitialState={(payment) => {
        return {
          id: payment?.id || '',
          photo: payment?.photo,
          teamName: payment?.teamName || '',
          project: payment?.project || false,
          active: payment?.active ?? true,
          teamYear: payment?.teamYear ?? '',
          proMan: payment?.proMan || [],
        };
      }}
      bottomTabs={bottomTabs}
      getInitialState={(p) => {
        return {
          id: p?.id || '',
          price: p?.price || 0,
          paymentFor: p?.paymentFor || '',
          type: p?.type || '',
          playerId: p?.playerId || '',
          status: p?.status || {},
        }
      }}
      onClick={(e, p, actionItem, navigate) => {
        const player = players.find(pl => pl.id === p.playerId);
        if (actionItem !== null || player?.type !== 'project') return;
        if (e.detail > 1) return;
        navigate(`/Player/${player.id}`);
      }}
    />
  );
}
