import React, { useState } from 'react';
import { Box, Typography, ButtonGroup, Button, IconButton, Divider, Drawer } from '@mui/joy';
import { deletePayment } from '../../../../a_firestore/actionData/deleteData/deletePayment.js';
import { useSnackbar } from '../../../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { getDefaultActions } from '../../../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../../../g_quickForms/X_Actions.js';
import { paymentMenuConfig } from '../../../../d_analystComp/a_layouts/X_menuConfig.js'
import { useObjectAddStatus, isPaymentComplete } from '../../../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { optionTypePayment, getStatusPaymentsList } from '../../../../x_utils/paymentsUtiles.js'
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import { getFilterOptions } from '../../../../i_filters/filterOptions';
import { sortData } from '../../../../j_sortings/sortData.js'
import { useObjectFilters } from '../../../../i_filters/hooks/useObjectFilters';
import { useObjectSorting } from '../../../../j_sortings/useObjectSorting';
import { boxPanelProps, boxFilterProps, boxSortProps, buttonSortAddProps } from './X_Style';
import CollapseBox from '../../../../h_componnetsUtils/motions/CollapsBox.js'
import SpotifyFilterBar from '../../../../i_filters/SpotifyFilterBar.js';
import SortButtonWithDrawer from '../../../../j_sortings/SortButtonWithDrawer.js';
import MobileParentCardList from './B_MobileParentCardList';
import IncomeChartView from '../../../../d_analystComp/a_containers/bottomTabUtils/paymentsTab/IncomeChartView.js'
import NewPaymentForm from '../../../../f_forms/E_NewPayment.js';
import DefaultEmpty from '../../../../d_analystComp/a_containers/I_DefaultEmpty.js';
import TabWithTransition from '../../../newContainers/F_TabWithTransition.js';
import ObjectMainTableContainer from '../../../../d_analystComp/a_containers/DA_ObjectMainTableContainer.js'

function GroupButtonPanel({setTabValue, tabValue}) {
  return (
    <ButtonGroup
      sx={{
        '--ButtonGroup-separatorColor': 'none !important',
        '& > span': {
          zIndex: 3,
          background: 'linear-gradient(to top, transparent, rgba(255 255 255 / 0.6), transparent)',
        },
      }}
      variant="solid"
      aria-label="tooltip button group"
    >
      <Button
        startDecorator={iconUi({id: 'parents', size: 'sm'})}
        onClick={() => setTabValue(0)}
        size='sm'
        color={tabValue === 0 ? 'success' : 'neutral'}
      >
       הורים
      </Button>
      <Divider />
      <Button
        startDecorator={iconUi({id: 'paymentRequst', size: 'sm'})}
        onClick={() => setTabValue(1)}
        size='sm'
        color={tabValue === 1 ? 'success' : 'neutral'}
      >
       בקשות תשלום
      </Button>
      <Divider />
      <Button
        startDecorator={iconUi({id: 'incomeTab', size: 'sm'})}
        onClick={() => setTabValue(2)}
        size='sm'
        color={tabValue === 2 ? 'success' : 'neutral'}
      >
       הכנסה
      </Button>
    </ButtonGroup>
  )
}

export default function MobilePlayerPaymentPanel(props) {
  const { player, allShorts, formProps, payments, players, isMobile, view } = props;
  const [tabValue, setTabValue] = useState(0);
  const [parents, setParents] = useState(player.parents || []);
  const [filters, setFilters] = React.useState({});
  const [sorting, setSorting] = React.useState('byAlfa');
  const [direction, setDirection] = React.useState('asc');
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewPayment, setIsLoadingNewPayment] = useState(false);
  const [actionItem, setActionItem] = React.useState(null);
  const [updates, setUpdates] = useState({});
  const { showSnackbar } = useSnackbar();

  const addActions = getDefaultActions({ type: 'payments' });
  const editActions = getDefaultQuickActions({ type: 'payments' });

  const allPayments = (formProps.payments || []).filter(p => p.playerId === player.id);
  const paymentsList = allPayments.filter(isPaymentComplete);

  useObjectAddStatus({
    list: paymentsList,
    objectId: lastAddedId,
    isWaiting: isAdding,
    type: 'payments',
    clear: () => {
      setIsAdding(false);
      setLastAddedId(null);
      setIsLoadingNewPayment(false);
    },
  });

  const getInitialState = (payment) => ({
    playerId: player.id,
    price: payment.price,
    paymentFor: payment.paymentFor,
    type: payment.type,
    status: payment.status
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

  // סינון + מיון
  const filteredList = React.useMemo(() => {
    let list = [...paymentsList];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        list = list.filter((p) => String(p[key]) === String(value));
      }
    });

    return sortData(list, sorting, formProps, direction);
  }, [paymentsList, filters, sorting, direction]);

  const actions = {
    ...addActions,
    ...editActions,
    paymentsList,
    onAdd: async (data, internalActions) => {
      setIsAdding(true);
      setLastAddedId(data.id);
      setIsLoadingNewPayment(true);
      await addActions.onAdd(data, internalActions);
    },
    onDelete: async (payment) => {
      await deletePayment(payment, showSnackbar, allShorts);
    },
  };

  return (
    <Box sx={{ ...boxPanelProps, width: '100%' }}>

      <GroupButtonPanel setTabValue={setTabValue} tabValue={tabValue} />
      {/* שורת פילטרים*/}
      <CollapseBox open={tabValue === 1}>
        <Box sx={{ mt: 2 }}>
          <SpotifyFilterBar
            view={view}
            type="payments"
            filters={filters}
            isMobile={isMobile}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            filterOptions={getFilterOptions(formProps, view)}
          />
        </Box>
      </CollapseBox>

      {/*שורת מיון*/}
      <Box {...boxSortProps(tabValue)}>
        <Box {...buttonSortAddProps(tabValue)}>
          <SortButtonWithDrawer
            type="payments"
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
            disabled={tabValue === 0}
          />
        </Box>

        <Box {...buttonSortAddProps(tabValue)}>
          <NewPaymentForm
            idNav='MobilePlayerPaymentPanel'
            idForm='playerDashboard'
            formProps={formProps}
            onSave={actions.onAdd}
            isModal={true}
            initialData={{
              playerId: player.id,
            }}
            disabled={tabValue === 0}
          />
        </Box>

      </Box>

      {/* אזור התוכן עם גלילה ואנימציה */}
      {tabValue === 0 &&  (
        <TabWithTransition isActive={tabValue === 0} tabKey="parents">
          <Box sx={{ px: isMobile ? 0 : 6 }}>
            <MobileParentCardList
              parents={parents}
              setParents={setParents}
              player={player}
              players={players}
            />
          </Box>
        </TabWithTransition>
      )}

      {tabValue === 1 &&  (
        <TabWithTransition isActive={tabValue === 1} tabKey="payments">
          <Box sx={{ px: isMobile ? 0 : 6 }}>
          {paymentsList.length === 0 ?
            <DefaultEmpty
              type='payments'
              icon='payments'
              onAdd={actions.onAdd}
            />
            :
            <Box>
            {filteredList.length === 0 ?
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
                title='בקשות תלשום'
                icon='payments'
                type='payments'
                actions={actions}
                updates={updates}
                isMobile={isMobile}
                idDisplay='tableList'
                allShorts={allShorts}
                setUpdates={setUpdates}
                actionItem={actionItem}
                menuConfig={() => paymentMenuConfig()}
                setActionItem={setActionItem}
                getInitialState={getInitialState}
                data={filteredList}
                formProps={{ ...formProps, onSave: null }}
              />
            }
            </Box>
          }
          </Box>
        </TabWithTransition>
      )}

      {tabValue === 2 &&  (
        <TabWithTransition isActive={tabValue === 2} tabKey="payments">
          <Box sx={{ px: isMobile ? 0 : 6 }}>
            <IncomeChartView payments={paymentsList} />
          </Box>
        </TabWithTransition>
      )}

    </Box>
  );
}
