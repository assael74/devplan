// 📁 bottomTabUtils/tables/videoTableColumns.js
import { Button, Typography, Box, Chip, Avatar, Divider } from '@mui/joy';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import DriveVideoPlayer from '../../../../k_videoPlayer/DriveVideoPlayer.js'
import VideoActionsCell from '../../../../k_videoPlayer/VideoActionsCell';
import EditExpanVideos from '../../../../g_quickForms/quickExpandForm/G_EditExpanVideos.js'
import EditExpanVideoAnalysis from '../../../../g_quickForms/quickExpandForm/GA_EditExpanVideoAnalysis.js'

export const getVideoAnalysisRowStructure = (isMobile, newActions, formProps, { type }) => {
  const onEdit = newActions.onEdit || (() => {});
  const handleOpenDialog = newActions.handleOpenDialog
  const mainRow = isMobile
    ? [
        {
          id: 'analysName',
          label: 'שם ניתוח',
          tooltip: 'שם ניתוח',
          iconId: 'analysis',
          render: (item) => `"${item.name}"` || '-',
          width: '35%',
        },
        {
          id: 'analysisPlayers',
          label: 'שחקנים',
          tooltip: 'מספר שחקנים',
          iconId: 'players',
          render: (item) =>
            Array.isArray(item.players) && item.players.length > 0
              ? item.players.length
              : '0',
          width: '10%',
        },
        {
          id: 'analysLink',
          label: 'וידאו',
          tooltip: 'קישור לוידאו',
          iconId: 'video',
          render: (item) => (
            <VideoActionsCell
              link={item.link}
              onWatch={() => handleOpenDialog(item.link, item.name || item.name)}
            />
          ),
          width: '25%'
        }
      ]
    : [
        {
          id: 'analysName',
          label: 'שם ניתוח',
          tooltip: 'שם הוידאו',
          iconId: 'analysis',
          render: (item) => `"${item.name}"` || '-',
          width: '30%'
        },
        {
          id: 'analysDate',
          label: 'חודש/שנה',
          tooltip: 'תאריך הניתוח',
          iconId: 'meeting',
          render: (item) => item.analysDate || '-',
          width: '15%'
        },
        {
          id: 'analysisPlayers',
          label: 'שחקנים',
          tooltip: 'מספר שחקנים',
          iconId: 'players',
          render: (item) =>
            Array.isArray(item.players) && item.players.length > 0
              ? item.players.length
              : '0',
          width: '25%'
        },
        {
          id: 'analysLink',
          label: 'וידאו',
          tooltip: 'קישור וידאו',
          iconId: 'video',
          render: (item) => (
            <VideoActionsCell
              link={item.link}
              onWatch={() => handleOpenDialog(item.link, item.name || item.name)}
            />
          ),
          width: '10%'
        }
      ];

  const expandedRow = [
    {
      id: 'expandedForm',
      render: (item) => (
        <EditExpanVideoAnalysis
          item={item}
          formProps={formProps}
          actions={newActions}
          type="videoAnalysis"
        />
      )
    },
  ];

  return { mainRow, expandedRow };
};

export const getVideosRowStructure = (isMobile, newActions, formProps, { type }) => {
  const onEdit = newActions.onEdit || (() => {});
  const handleOpenDialog = newActions.handleOpenDialog
  const mainRow = isMobile
    ? [
        {
          id: 'videoName',
          label: 'שם הוידאו',
          iconId: 'name',
          render: (item) => `"${item.name}"` || '-',
          width: '40%'
        },
        {
          id: 'videoLink',
          label: 'וידאו',
          iconId: 'video',
          render: (item) => (
            <VideoActionsCell
              link={item.link}
              onWatch={() => handleOpenDialog(item.link, item.name || item.name)}
            />
          ),
          width: '30%'
        }
      ]
    : [
        {
          id: 'videoName',
          label: 'שם הוידאו',
          iconId: 'video',
          render: (item) => `"${item.name}"` || '-',
          width: '35%'
        },
        {
          id: 'videoLink',
          label: 'וידאו',
          iconId: 'video',
          render: (item) => (
            <VideoActionsCell
              link={item.link}
              onWatch={() => handleOpenDialog(item.link, item.name || item.name)}
            />
          ),
          width: '15%'
        }
      ];

  const expandedRow = [
    {
      id: 'expandedForm',
      render: (item) => (
        <EditExpanVideos
          item={item}
          formProps={formProps}
          actions={newActions}
          type="videos"
        />
      )
    },
  ];

  return { mainRow, expandedRow };
};
