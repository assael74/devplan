import * as React from 'react';
import { Box } from '@mui/joy';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { useObjectFilters } from '../../i_filters/hooks/useObjectFilters';
import { useObjectSorting } from '../../j_sortings/useObjectSorting';
import { boxWraperPanelProps } from './containersStyle/A_GenericObjectStyle.js';
import Layout from './../../Layout';
import NavigationStatic from '../../c_navBar/NavigationStatic';
import ObjectMainCardContainer from './D_ObjectMainCardContainer';
import ObjectMainTableContainer from './DA_ObjectMainTableContainer';
import CardContainer from './E_CardContainer';
import CardVideoContainer from './EB_CardVideoContainer';
import BottomTabsContainer from './C_BottomTabsContainer';
import FloatingAddButton from './J_FloatingAddButton'
import NewEvaluationForm from '../../f_forms/J_NewEvaluation.js'
import NewGameStatsForm from '../../f_forms/K_NewGameStats.js'
import PaymentsIncomeTab from './bottomTabUtils/paymentsTab/PaymentsIncomeTab.js'
import MeetingsPlanTab from './bottomTabUtils/meetingsTab/MeetingsPlanTab.js'

export default function GenericObjectLayout({
  id,
  tab,
  view,
  type,
  icon,
  title,
  onClick,
  actions,
  getChips,
  idDisplay,
  formProps,
  allShorts,
  rowData = {},
  form: AddForm,
  bottomTabs = [],
  getInitialState,
  columns = { xs: 1, sm: 2, md: 3 },
}) {
  const navigate = useNavigate();
  const [actionItem, setActionItem] = React.useState(null);
  const [updates, setUpdates] = React.useState({});
  const [openFilter, setOpenFilter] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleView = () => {
    actions.setIdDisplay((prev) => (prev === 'cardList' ? 'tableList' : 'cardList'));
  };

  const mergeRowData = (type, rowData) => {
    switch (type) {
      case 'clubs':
        return [...(rowData?.clubs || [])];
      case 'teams':
        return [...(rowData?.teams || [])];
      case 'players':
        return [...(rowData?.players || [])];
      case 'videos':
        if (tab === 0) return [...(rowData?.videoAnalysis || [])];
        if (tab === 1) return [...(rowData?.videos || [])];
        return [];
      case 'meetings':
        return [...(rowData?.meetings || [])];
      case 'payments':
        return [...(rowData?.payments || [])];
      case 'games':
        return [...(rowData?.games || [])];
      case 'roles':
        return [...(rowData?.roles || [])];
      default:
        return rowData?.[type] || [];
    }
  };

  const data = mergeRowData(type, rowData);

  const {
    filters,
    setFilters,
    handleResetFilters,
    filteredVisibleData: filteredData,
    hasFilteredData,
    hasActiveFilters,
  } = useObjectFilters(data, type, formProps);

  const {
    sorting,
    setSorting,
    direction,
    sortedData,
  } = useObjectSorting(filteredData, type, formProps, view);

  const handleSetUpdate = (id, data) => {
    setUpdates((prev) => ({ ...prev, [id]: data }));
  };

  const handleSave = (data) => {
    actions?.onAdd?.(data);
  };

  const renderCradsItem = (item) => {
    const idField = item[`${type.slice(0, -1)}Id`] || item.id;
    const update = updates[idField] || getInitialState(item);
    const setUpdate = (data) => handleSetUpdate(idField, data);
    if (type === 'videos') {
      return (
        <CardVideoContainer
          item={item}
          type={type}
          key={idField}
          actions={actions}
          columns={columns}
          idDisplay={idDisplay}
          formProps={formProps}
          getInitialState={getInitialState}
        />
      );
    } else {
      return (
        <CardContainer
          key={idField}
          item={item}
          type={type}
          actions={actions}
          columns={columns}
          idDisplay={idDisplay}
          formProps={formProps}
          chips={getChips(item)}
          getInitialState={getInitialState}
          onClick={(e) => onClick(e, item, actionItem, navigate)}
        />
      );
    }
  };

  const headerProps = {
    tab: tab,
    icon: icon,
    type: type,
    title: title,
    form: AddForm,
    actions: actions,
    isMobile: isMobile,
    idDisplay: idDisplay,
    toggleView: toggleView,
    bottomTabs: bottomTabs,
    formProps: { ...formProps, onSave: handleSave },
    filterActions: { filters, setFilters, handleResetFilters },
    sortingActions: { sorting, setSorting, direction },
  }

  const commonListProps = {
    gap: 2,
    icon,
    type,
    view,
    title,
    actions,
    idDisplay,
    bottomTabs,
    formProps: { ...formProps, onSave: handleSave },
  };

  const tableOnlyProps = {
    updates,
    allShorts,
    setUpdates,
    actionItem,
    setActionItem,
    getInitialState,
    hasFilteredData,
    data: type === 'videos' ? rowData : sortedData,
    onClick: (e, item) => {
      const isButton = e.target.closest?.('button, svg, path');
      if (!isButton) onClick?.(e, item, actionItem, navigate);
    },
  };

  const cardsOnlyProps = {
    columns,
    isMobile,
    renderItem: renderCradsItem,
    getInitialState,
    hasFilteredData,
    data: sortedData,
  };

  const players = Array.isArray(formProps?.players) ? formProps.players : [];

  return (
    <>
      <Layout.SideNav>
        <NavigationStatic id={id} {...actions} />
      </Layout.SideNav>

      <Layout.Main headerProps={headerProps}>
        {[0, 1].includes(tab) && (() => {
          const isCard = idDisplay === 'cardList';
          const tabProps = { tab, ...commonListProps };
          const card = (
            type === 'meetings' && tab === 1 ? (
              <MeetingsPlanTab
                meetings={formProps.meetings}
                data={rowData.meetings}
                formProps={formProps}
                isMobile={isMobile}
                players={players}
                actions={actions}
                {...commonListProps}
              />
            ) : type === 'payments' && tab === 1 ? (
              <PaymentsIncomeTab formProps={formProps} data={rowData.payments} />
            ) : (
              <ObjectMainCardContainer {...tabProps} {...cardsOnlyProps} />
            )
          );

          const table = (
            <>
              {type === 'meetings' && tab === 1 && (
                <MeetingsPlanTab
                  meetings={formProps.meetings}
                  data={rowData.meetings}
                  formProps={formProps}
                  isMobile={isMobile}
                  players={players}
                  actions={actions}
                  {...commonListProps}
                />
              )}
              <ObjectMainTableContainer {...tabProps} {...tableOnlyProps} />
            </>
          );

          return isCard ? card : table;
          })()}

        {type === 'players' && Array.isArray(formProps.players) && formProps.players.length > 0 && (
          <FloatingAddButton
            view={view}
            formProps={formProps}
            formComponent={NewEvaluationForm}
            onEdit={actions.onEdit}
            tooltipTitle='הוסף טופס הערכת יכולות'
            onSaveAbilities={actions.abilitiesActions.onAdd}
          />
        )}

        {type === 'games' && Array.isArray(formProps.games) && formProps.games.length > 0 && (
          <FloatingAddButton
            view={view}
            isMobile={isMobile}
            formProps={formProps}
            idForm='newGameStats'
            onAdd={actions.onAddStats}
            onEdit={actions.onEditStats}
            formComponent={NewGameStatsForm}
            tooltipTitle='הוסף סטטיסטיקת משחק'
          />
        )}
      </Layout.Main>
    </>
  );
}
