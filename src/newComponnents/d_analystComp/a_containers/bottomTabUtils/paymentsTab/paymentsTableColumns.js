// 📁 bottomTabUtils/tables/paymentsTableColumns.js
import { Button, Typography, Box, Chip, Avatar, Divider, IconButton } from '@mui/joy';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { typoCellProps, typoStatus } from './X_Style'
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import { getStatusPaymentsList } from '../../../../x_utils/paymentsUtiles.js'

const getColumnsForProfilePlayer = (isMobile, newActions) => {
  // רוחב העמודות isMobile ? '20%' : '20%'
  const handleOpenDialog = newActions.handleOpenDialog;
  const statusItem = (item) => getStatusPaymentsList(isMobile).find((p) => p.id === item.status.id) || {};

  if (isMobile) {
    return [
      {
        id: 'status',
        label: 'סטטוס',
        iconId: 'incomeTab',
        render: (item) => {
          const status = statusItem(item);
          const color = status.id === 'new' ? 'danger' : 'neutral';
          return (
            <Box {...typoCellProps}>
              {iconUi({id: status.idIcon})}
              {/*<Typography color={color} {...typoStatus}>{status.labelH}</Typography>*/}
            </Box>
          );
        },
        width: '30%',
      },
      {
        id: 'price',
        label: 'סכום',
        iconId: 'price',
        render: (item) => (
          <Box {...typoCellProps}>
            <Typography noWrap sx={{ textAlign: 'center', direction: 'rtl', width: '100%' }}>
              {item.price} ש״ח
            </Typography>
          </Box>
        ),
        width: '20%',
      },
      {
        id: 'paymentFor',
        label: 'תשלום עבור',
        iconId: 'paymentRequst',
        render: (item) => (
          <Box {...typoCellProps}>
            <Typography noWrap sx={{ textAlign: 'center', direction: 'rtl', width: '100%' }}>
              {item.paymentFor}
            </Typography>
          </Box>
        ),
        width: '30%',
      },
    ];
  }

  // Desktop
  return [
    {
      id: 'status',
      label: 'סטטוס',
      tooltip: 'סטטוס תשלום',
      iconId: 'incomeTab',
      render: (item) => {
        const status = statusItem(item);
        const color = status.id === 'new' ? 'danger' : 'neutral';
        return (
          <Box {...typoCellProps}>
            <Typography color={color} {...typoStatus}>{status.labelH}</Typography>
          </Box>
        );
      },
      width: '25%',
    },
    {
      id: 'price',
      label: 'סכום',
      tooltip: 'סכום לתשלום',
      iconId: 'price',
      render: (item) => (
        <Box {...typoCellProps}>
          <Typography noWrap sx={{ textAlign: 'center', direction: 'rtl', width: '100%' }}>
            {item.price} ש״ח
          </Typography>
        </Box>
      ),
      width: '10%',
    },
    {
      id: 'paymentFor',
      label: 'תשלום עבור',
      tooltip: 'תשלום עבור...',
      iconId: 'paymentRequst',
      render: (item) => (
        <Box {...typoCellProps}>
          <Typography noWrap sx={{ textAlign: 'center', direction: 'rtl', width: '100%' }}>
            {item.paymentFor}
          </Typography>
        </Box>
      ),
      width: '25%',
    },
    {
      id: 'paymentDate',
      label: 'תאריך בקשה',
      tooltip: 'תאריך הבקשה',
      iconId: 'time',
      render: (item) => {
        return (
          <Box {...typoCellProps}>
            <Typography {...typoStatus}>{item.status.time}</Typography>
          </Box>
        );
      },
      width: '20%',
    },
  ];
};

export const getPaymentsRowStructure = (isMobile, newActions, formProps, { type }, view) => {
  // רוחב העמודות isMobile ? '20%' : '20%'
  const onEdit = newActions.onEdit || (() => {});
  const handleOpenDialog = newActions.handleOpenDialog
  const player = (playerId) => formProps.players.find(i=>i.id === playerId)
  const statusItem = (item) => getStatusPaymentsList(isMobile).find((p) => p.id === item.status.id) || {};
  const mainRow =
    view === 'profilePlayer'
    ? getColumnsForProfilePlayer(isMobile, newActions)
    : isMobile
    ? [
        {
          id: 'photo',
          label: 'תמונת שחקן',
          iconId: 'photo',
          render: (item) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 30, height: 30 }}
                src={player(item.playerId).photo || playerImage}
                alt={player(item.playerId).playerFullName || 'ללא שם'}
              />
            </Box>
          ),
          width: '15%',
        },
        {
          id: 'name',
          label: 'שם שחקן',
          iconId: 'player',
          render: (item) => player(item.playerId).playerFullName || '-',
          width: '30%',
        },
        {
          id: 'price',
          label: 'סכום',
          iconId: 'price',
          render: (item) => (
            <Box {...typoCellProps}>
              <Typography noWrap>{item.price}
                <Typography sx={{ fontSize: '9px' }}> שח</Typography>
              </Typography>
            </Box>
          ),
          width: '20%',
        },
        {
          id: 'status',
          label: 'סכום',
          iconId: 'payment',
          render: (item) => {
            const status = statusItem(item);
            const isDanger = status.id === 'new';
            const color = isDanger ? '#f44336' : '#9e9e9e'
            return (
              <Box {...typoCellProps}>
                {iconUi({ id: status.idIcon, sx: { color: color } })}
              </Box>
            )
          },
          width: '15%',
        },
      ]
    : [
        {
          id: 'photo',
          label: 'תמונת שחקן',
          tooltip: '',
          iconId: 'photo',
          render: (item) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 30, height: 30 }}
                src={player(item.playerId).photo || playerImage}
                alt={player(item.playerId).playerFullName || 'ללא שם'}
              />
            </Box>
          ),
          width: '10%',
        },
        {
          id: 'name',
          label: 'שם שחקן',
          tooltip: 'שם שחקן',
          iconId: 'player',
          render: (item) => player(item.playerId).playerFullName || '-',
          width: '30%',
        },
        {
          id: 'price',
          label: 'סכום',
          tooltip: 'סכום לתשלום',
          iconId: 'price',
          render: (item) => (
            <Box {...typoCellProps}>
              <Typography noWrap sx={{ textAlign: 'center', direction: 'rtl', width: '100%' }}>{item.price} שח</Typography>
            </Box>
          ),
          width: '10%',
        },
        {
          id: 'status',
          label: 'סטטוס',
          tooltip: 'סטטוס התשלום',
          iconId: 'payment',
          render: (item) => {
            const status = statusItem(item);
            const isDanger = status.id === 'new';
            const color = isDanger ? '#f44336' : '#9e9e9e'
            return (
              <Box {...typoCellProps}>
                <Typography endDecorator={iconUi({id: status.idIcon, sx: { color: color }})}>
                {statusItem(item).labelH}
                </Typography>
              </Box>
            )
          },
          width: '30%',
        },
      ];

      const expandedRow = [
        {
          id: 'expandedForm',
          render: (item) => {
            return <Box>אין מידע נוסף</Box>
          }
        },
      ];

  return { mainRow, expandedRow };
};
