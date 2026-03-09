import React, { useEffect, useRef } from 'react';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { typeBackground } from '../../b_styleObjects/Colors';
import {
  getVideoAnalysisRowStructure,
  getVideosRowStructure
} from '../a_containers/bottomTabUtils/videosTab/videosTableColumns.js';
import { getTagsRowStructure } from '../a_containers/bottomTabUtils/tagsTab/tagsTableColumns.js';
import { getClubsRowStructure } from '../a_containers/bottomTabUtils/clubsTab/clubsTableColumns.js';
import { getTeamsRowStructure } from '../a_containers/bottomTabUtils/teamsTab/teamsTableColumns.js';
import { getPlayersRowStructure } from '../a_containers/bottomTabUtils/playersTab/playersTableColumns.js';
import { getRolesRowStructure } from '../a_containers/bottomTabUtils/rolesTab/rolesTableColumns.js';
import { getPaymentsRowStructure } from '../a_containers/bottomTabUtils/paymentsTab/paymentsTableColumns.js';
import { getMeetingsRowStructure } from '../a_containers/bottomTabUtils/meetingsTab/meetingsTableColumns.js';
import { getGamesRowStructure } from '../a_containers/bottomTabUtils/gamesTab/gamesTableColumns.js';
import { getScoutingRowStructure } from '../a_containers/bottomTabUtils/scoutingTab/scoutingTableColumns.js';
import { getGamesPlayedRowStructure } from '../a_containers/bottomTabUtils/gamesTab/gamesPlayedTableColumns.js';
import { getStatsParmRowStructure } from '../a_containers/bottomTabUtils/statsParmsTab/statsParmsTableColumns.js';
import {
  tableProps,
  boxDataProps,
  useThStyle,
  expandedStyle,
  iconBoxProps,
  boxTableWraperProps
} from './containersStyle/DA_ObjectMainTableStyle.js';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { Box, Sheet, Typography, Table, IconButton, Stack, Tooltip } from '@mui/joy';
import VideoPreviewDialog from '../../k_videoPlayer/DriveVideoPlayer';
import GenericEditMenu from './F_GenericEditMenu'
import DefaultEmpty from '../a_containers/I_DefaultEmpty.js'

export default function ObjectMainTableContainer({
  view,
  type,
  tab,
  icon,
  title,
  onClick,
  idDisplay,
  data = [],
  allShorts,
  setUpdates,
  actionItem,
  menuConfig,
  actions = {},
  updates = {},
  setActionItem,
  formProps = {},
  tableColumns = [],
  emptyMessage = 'אין נתונים',
  getInitialState = () => ({}),
  ...props
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedVideo, setSelectedVideo] = React.useState({ link: '', name: '' });
  const [expandedId, setExpandedId] = React.useState(null);
  const theme = useTheme();
  const thStyle = useThStyle(type);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  //console.log(view)
  const rowRefs = useRef({});

  useEffect(() => {
    if (expandedId && rowRefs.current[expandedId]) {
      rowRefs.current[expandedId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [expandedId]);

  const handleOpenDialog = (link, name = '') => {
    setSelectedVideo({ link, name });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedVideo({ link: '', name: '' });
  };

  const toggleExpanded = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const newActions = {
    ...actions,
    setExpandedId: setExpandedId,
    handleOpenDialog: handleOpenDialog
  };

  const columns = () => {
    if (type === 'clubs') {
      if (tab === 0) {
        return getClubsRowStructure(isMobile, newActions, formProps, { type: 'clubs' }).mainRow;
      }
      if (tab === 1) {
        return [];
      }
    }

    if (type === 'teams') {
      if (tab === 0) {
        return getTeamsRowStructure(isMobile, newActions, formProps, { type: 'teams' }).mainRow;
      }
      if (tab === 1) {
        return [];
      }
    }

    if (type === 'players') {
      if (tab === 0) {
        return getPlayersRowStructure(isMobile, newActions, formProps, { type: 'players' }).mainRow;
      }
      if (tab === 1) {
        return [];
      }
    }

    if (type === 'roles') {
      if (tab === 0) {
        return getRolesRowStructure(isMobile, newActions, formProps, { type: 'roles' }).mainRow;
      }
      if (tab === 1) {
        return [];
      }
    }

    if (type === 'payments') {
      if (tab === 0) {
        return getPaymentsRowStructure(isMobile, newActions, formProps, { type: 'payments' }, view).mainRow;
      }
      if (tab === 1) {
        return [];
      }
    }

    if (type === 'meetings') {
      if (tab === 0) {
        return getMeetingsRowStructure(isMobile, newActions, formProps, { type: 'meetings' }, view).mainRow;
      }
      if (tab === 1) {
        return [];
      }
    }

    if (type === 'scouting') {
      if (tab === 0) {
        return getScoutingRowStructure(isMobile, newActions, formProps, { type: 'scouting' }, view).mainRow;
      }
      if (tab === 1) {
        return [];
      }
    }

    if (type === 'videos') {
      if (tab === 0) {
        return getVideoAnalysisRowStructure(isMobile, newActions, formProps, { type: 'videoAnalysis' }).mainRow;
      }
      if (tab === 1) {
        return getVideosRowStructure(isMobile, newActions, formProps, { type: 'videos' }).mainRow;
      }
    }

    if (type === 'tags') {
      return getTagsRowStructure(isMobile, newActions, formProps).mainRow;
    }

    if (type === 'games') {
      if (view === 'profileTeam') {
        if (tab === 1) {
          return getGamesPlayedRowStructure(isMobile, newActions, formProps, { type: 'games' }, view).mainRow
        }
        if (tab === 0) {
          return;
        }
      } else if (view === 'profilePlayer') {
        if (tab === 0) {
          return getGamesPlayedRowStructure(isMobile, newActions, formProps, { type: 'games' }, view).mainRow
        }
        if (tab === 1) {
          return;
        }
      } else {
        if (tab === 0) {
          return getGamesPlayedRowStructure(isMobile, newActions, formProps, { type: 'games' }, view).mainRow
        }
        if (tab === 1) {
          return getGamesRowStructure(isMobile, newActions, formProps, { type: 'games' }, view).mainRow
        }
      }
    }

    if (type === 'statsParm') {
      return getStatsParmRowStructure(isMobile, newActions, formProps, { type: 'statsParm' }).mainRow
    }

    return [];
  };

  const renderExpandedRow = (item) => {
    if (type === 'clubs') {
      const structure = tab === 0
        ? getClubsRowStructure(isMobile, newActions, formProps, { type: 'clubs' })
        : null;

      return (
        <Stack spacing={1}>
          {structure.expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'teams') {
      const structure = tab === 0
        ? getTeamsRowStructure(isMobile, newActions, formProps, { type: 'teams' })
        : null;

      return (
        <Stack spacing={1}>
          {structure.expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'players') {
      const structure = tab === 0
        ? getPlayersRowStructure(isMobile, newActions, formProps, { type: 'players' })
        : null;

      return (
        <Stack spacing={1}>
          {structure.expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'roles') {
      const structure = tab === 0
        ? getRolesRowStructure(isMobile, newActions, formProps, { type: 'roles' })
        : null;

      return (
        <Stack spacing={1}>
          {structure.expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'payemnts') {
      const structure = tab === 0
        ? getPaymentsRowStructure(isMobile, newActions, formProps, { type: 'payemnts' })
        : null;

      return (
        <Stack spacing={1}>
          {structure.expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'meetings') {
      const structure = tab === 0
        ? getMeetingsRowStructure(isMobile, newActions, formProps, { type: 'meetings' })
        : null;

      return (
        <Stack spacing={1}>
          {structure.expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'videos') {
      const structure = tab === 0
        ? getVideoAnalysisRowStructure(isMobile, newActions, formProps, { type: 'videoAnalysis' })
        : getVideosRowStructure(isMobile, newActions, formProps, { type: 'videos' });

      return (
        <Stack spacing={1}>
          {structure.expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'tags') {
      const { expandedRow } = getTagsRowStructure(isMobile, newActions, formProps);
      return (
        <Stack spacing={1}>
          {expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'games') {
      const structure = getGamesRowStructure(isMobile, newActions, formProps, { type: 'games' }, view)
      return (
        <Stack spacing={1}>
          {structure.expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'statsParm') {
      const { expandedRow } = getStatsParmRowStructure(isMobile, newActions, formProps, { type: 'statsParm' });
      return (
        <Stack spacing={1}>
          {expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    if (type === 'scouting') {
      const { expandedRow } = getScoutingRowStructure(isMobile, newActions, formProps, { type: 'scouting' });
      return (
        <Stack spacing={1}>
          {expandedRow.map((row) => (
            <Box key={row.id}>{row.render(item)}</Box>
          ))}
        </Stack>
      );
    }

    return null;
  };

  const dataTable = () => {
    if (type === 'videos') {
      if (tab === 0 && Array.isArray(data?.videoAnalysis)) {
        return data.videoAnalysis;
      }
      if (tab === 1 && Array.isArray(data?.videos)) {
        return data.videos;
      }
      return [];
    }

    return Array.isArray(data) ? data : [];
  };

  const actionsItemsWidth = isMobile ? '10%' : '5%'

  const typeBg = typeBackground?.[type] || {};

  const hasAnyData = () => {
    const list = type === 'videos' ? dataTable() : formProps?.[type] || [];

    if (view === 'profilePlayer') {
      return true
    }

    if (view === 'profileTeam') {
      return dataTable().length > 0;
    }

    return list.length > 0;
  };

  return (
    <Sheet>
    {!hasAnyData() ? (
      <DefaultEmpty
        title={title}
        type={type}
        icon={icon}
        formProps={formProps}
        onAdd={actions.onAdd}
      />
    ) : !dataTable().length > 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography level="body-md" color="neutral">
            לא נמצאו תוצאות לסינון
          </Typography>
        </Box>
      ) : (
      <Box {...boxTableWraperProps}>
      <Table {...tableProps}>
        <thead>
          <tr>
            <th {...thStyle({ isHeader: true, width: actionsItemsWidth })}></th>
            {columns().map((col) => {
              return (
                <th key={col.id} {...thStyle({ ...col, isHeader: true })}>
                  <Box {...iconBoxProps}>
                    <Tooltip title={col.tooltip} placement="top" variant="soft">
                      <Box sx={{ display: 'flex', cursor: 'help' }}>
                        {iconUi({ id: col.iconId, sx: { color: typeBg.text } })}
                      </Box>
                    </Tooltip>

                    {!isMobile && (
                      <Typography level="body-sm" sx={{ color: 'inherit' }}>
                        {col.label}
                      </Typography>
                    )}
                  </Box>
                </th>
              )
            })}
            <th {...thStyle({ isHeader: true, width: actionsItemsWidth })}></th>
          </tr>
        </thead>
        <tbody>
        {dataTable().map((item) => {
          const update = updates[item.id] || getInitialState?.(item);
          const setUpdate = (val) => setUpdates(prev => ({ ...prev, [item.id]: val }));

          return (
            <React.Fragment key={item.id}>
              <tr
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  const isButton = e.target.closest('button, svg, path');
                  if (!isButton) onClick?.(e, item);
                }}
              >
                <td {...thStyle({ isHeader: false, width: actionsItemsWidth })}>
                  <IconButton
                    size={isMobile ? 'xs' : 'md'}
                    variant="plain"
                    sx={{ ml: isMobile ? -0.8 : 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(item.id);
                    }}
                  >
                    {iconUi({ id: expandedId === item.id ? 'expandLess' : 'expandMore' })}
                  </IconButton>
                </td>

                {columns().map((col) => {
                  return (
                    <td key={col.id} {...thStyle({ ...col, isHeader: false })}>
                      <Box {...boxDataProps}>
                        {col.render ? col.render(item) : item[col.id] ?? '-'}
                      </Box>
                    </td>
                  )
                })}

                <td {...thStyle({ isHeader: false, width: actionsItemsWidth })}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <GenericEditMenu
                      type={type}
                      item={item}
                      view={view}
                      update={update}
                      columns={columns}
                      actions={actions}
                      isMobile={isMobile}
                      idDisplay={idDisplay}
                      setUpdate={setUpdate}
                      formProps={formProps}
                    />
                  </Box>
                </td>
              </tr>

              {expandedId === item.id && (
                <tr
                  ref={(el) => (rowRefs.current[item.id] = el)}
                  //style={{ scrollMarginTop: '36px' }}
                >
                  <td colSpan={columns().length + 2} style={{ padding: 0 }}>
                    <Box {...expandedStyle(theme)}>
                      {renderExpandedRow(item)}
                    </Box>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
        </tbody>
      </Table>
        <VideoPreviewDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          videoLink={selectedVideo.link}
          videoName={selectedVideo.name}
        />
      </Box>
    )}
    </Sheet>
  );
}
