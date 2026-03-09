// 📁 bottomTabUtils/tables/meetingTableColumns.js
import { Button, Typography, Box, Chip, Avatar, Divider, Tooltip } from '@mui/joy';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import { typoCellProps, typoStatus } from './X_Style'
import { getMeetingDate } from '../../../../x_utils/dateUtiles.js'
import { optionTypeMeeting, statusMeetingList } from '../../../../x_utils/optionLists.js';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const getColumnsForProfilePlayer = (isMobile, newActions, formProps) => {
  // רוחב העמודות isMobile ? '20%' : '20%'
  const handleOpenDialog = newActions.handleOpenDialog;
  const video = (meetingId) => formProps.videoAnalysis.find(i => i.meetingId === meetingId)
  const statusItem = (item) => statusMeetingList.find((p) => p.id === item.status.id) || {};

  if (isMobile) {
    return [
      {
        id: 'date',
        label: 'תאריך',
        iconId: 'meeting',
        render: (item) => (
          <Box {...typoCellProps}>
            <Typography noWrap sx={{ textAlign: 'center', direction: 'rtl', width: '100%' }}>{item.meetingDate}</Typography>
          </Box>
        ),
        width: '30%',
      },
      {
        id: 'hour',
        label: 'שעה',
        iconId: 'time',
        render: (item) => (
          <Box {...typoCellProps}>
            <Typography noWrap sx={{ textAlign: 'center', direction: 'rtl', width: '100%' }}>{item.meetingHour}</Typography>
          </Box>
        ),
        width: '20%',
      },
      {
        id: 'status',
        label: 'סטטוס',
        iconId: 'meeting',
        render: (item) => {
          return (
            <Box {...typoCellProps}>
              <Typography {...typoStatus}>{statusItem(item).labelH}</Typography>
            </Box>
          )
        },
        width: '20%',
      },
      {
        id: 'video',
        label: 'וידאו',
        iconId: 'video',
        render: (item) => {
          const hasVideo = !!video(item.id);
          return (
            <Box {...typoCellProps}>
              <Tooltip title={hasVideo ? 'יש וידאו' : 'אין וידאו'}>
                {hasVideo ? <CheckCircleIcon color="success" /> : <CancelIcon color="disabled" />}
              </Tooltip>
            </Box>
          )
        },
        width: '10%',
      },
    ];
  }

  // Desktop
  return [
    {
      id: 'date',
      label: 'תאריך',
      tooltip: 'תאריך הפגישה',
      iconId: 'meeting',
      render: (item) => (
        <Box {...typoCellProps}>
          <Typography noWrap sx={{ textAlign: 'center', direction: 'rtl', width: '100%' }}>{item.meetingDate}</Typography>
        </Box>
      ),
      width: '30%',
    },
    {
      id: 'hour',
      label: 'שעה',
      tooltip: 'שעת הפגישה',
      iconId: 'time',
      render: (item) => (
        <Box {...typoCellProps}>
          <Typography noWrap sx={{ textAlign: 'center', direction: 'rtl', width: '100%' }}>{item.meetingHour}</Typography>
        </Box>
      ),
      width: '20%',
    },
    {
      id: 'status',
      label: 'סטטוס',
      tooltip: 'סטטוס הפגישה',
      iconId: 'meeting',
      render: (item) => {
        return (
          <Box {...typoCellProps}>
            <Typography {...typoStatus}>{statusItem(item).labelH}</Typography>
          </Box>
        )
      },
      width: '20%',
    },
    {
      id: 'video',
      label: 'וידאו',
      tooltip: 'האם יש וידאו',
      iconId: 'video',
      render: (item) => {
        const hasVideo = !!video(item.id);
        return (
          <Box {...typoCellProps}>
            <Tooltip title={hasVideo ? 'יש וידאו' : 'אין וידאו'}>
              {hasVideo ? <CheckCircleIcon color="success" /> : <CancelIcon color="disabled" />}
            </Tooltip>
          </Box>
        )
      },
      width: '10%',
    },
  ];
};

export const getMeetingsRowStructure = (isMobile, newActions, formProps, { type }, view) => {
  const onEdit = newActions.onEdit || (() => {});
  const handleOpenDialog = newActions.handleOpenDialog
  const player = (playerId) => formProps.players.find(i=>i.id === playerId)
  const video = (meetingId) => formProps.videoAnalysis.find(i => i.meetingId === meetingId)
  const statusItem = (item) => statusMeetingList.find((p) => p.id === item.status.id) || {};
  const mainRow = view === 'profilePlayer'
  ? getColumnsForProfilePlayer(isMobile, newActions, formProps)
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
          width: '20%',
        },
        {
          id: 'date',
          label: 'תאריך',
          iconId: 'meeting',
          render: (item) => (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
              <Typography noWrap sx={{ fontSize: '11px', direction: 'rtl', width: '100%' }}>
              {getMeetingDate(item).date.v2}
              </Typography>
              <Typography noWrap sx={{ fontSize: '9px', direction: 'rtl', width: '100%' }}>
              {getMeetingDate(item).hour}
              </Typography>
            </Box>
          ),
          width: '25%',
        },
        {
          id: 'status',
          label: 'סטטוס',
          iconId: 'meeting',
          render: (item) => {
            const color = statusItem(item).id === 'new' ? '#6aa84f' : '#9e9e9e'
            return (
              <Box {...typoCellProps}>
                {iconUi({ id: statusItem(item).idIcon, sx: { color: color } })}
              </Box>
            )
          },
          width: '10%',
        },
        {
          id: 'video',
          label: 'וידאו',
          iconId: 'video',
          render: (item) => {
            const hasVideo = !!video(item.id);
            return (
              <Box {...typoCellProps}>
                <Tooltip title={hasVideo ? 'יש וידאו' : 'אין וידאו'}>
                  {hasVideo ? <CheckCircleIcon color="success" /> : <CancelIcon color="disabled" />}
                </Tooltip>
              </Box>
            )
          },
          width: '10%',
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
          tooltip: 'שם השחקן',
          iconId: 'player',
          render: (item) => player(item.playerId).playerFullName || '-',
          width: '25%',
        },
        {
          id: 'date',
          label: 'תאריך',
          tooltip: 'תאריך הפגישה',
          iconId: 'meeting',
          render: (item) => (
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
              <Typography noWrap sx={{ fontSize: '14px', direction: 'rtl', ml: 2 }}>
                {getMeetingDate(item).hour}
              </Typography>
              ----
              <Typography noWrap sx={{ fontSize: '14px', direction: 'rtl', mr: 2 }}>
                {getMeetingDate(item).date.v2}
              </Typography>
            </Box>
          ),
          width: '20%',
        },
        {
          id: 'status',
          label: 'סטטוס',
          tooltip: 'סטטוס הפגישה',
          iconId: 'meeting',
          render: (item) => {
            const color = statusItem(item).id === 'new' ? '#6aa84f' : '#9e9e9e'
            return (
              <Box {...typoCellProps}>
                <Typography sx={{ direction: 'rtl', ml: 0.3 }}>{statusItem(item).labelH}</Typography>
                <Typography sx={{ direction: 'rtl', mr: 0.3, ml: 1 }}>פגישה</Typography>
                {iconUi({ id: statusItem(item).idIcon, sx: { color: color } })}
              </Box>
            )
          },
          width: '15%',
        },
        {
          id: 'video',
          label: 'וידאו',
          tooltip: 'האם יש וידאו',
          iconId: 'video',
          render: (item) => {
            const hasVideo = !!video(item.id);
            return (
              <Box {...typoCellProps}>
                <Tooltip title={hasVideo ? 'יש וידאו' : 'אין וידאו'}>
                  {hasVideo ? <CheckCircleIcon color="success" /> : <CancelIcon color="danger" />}
                </Tooltip>
              </Box>
            )
          },
          width: '10%',
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
