import React, { useState, useEffect } from 'react';
import { deleteVideo } from '../../a_firestore/actionData/deleteData/deleteVideo.js';
import { deleteVideoAnalysis } from '../../a_firestore/actionData/deleteData/deleteVideoAnalysis.js';
import { Typography, Box } from '@mui/joy';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { isVideoComplete } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { useObjectAddStatus } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { getDefaultActions } from '../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import playerImage from '../../b_styleObjects/images/playerImage.jpg';
import NewVideoForm from '../../f_forms/G_NewVideo.js'
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';
import LoadingCardContainer from '../a_containers/H_LoadingCardContainer.js';

const bottomTabs = [
  { id: 'videoAnalysis', label: 'ניתוחי וידאו', idIcon: 'videoAnalysis', value: 0 },
  { id: 'videoGeneral', label: 'וידאו כללי', idIcon: 'videoGeneral', value: 1 },
];

export default function VideosLayout(props) {
  const { clubs, teams, players, meetings, payments, videos, videoAnalysis, tags, allShorts, gameStats } = props;
  const [idDisplay, setIdDisplay] = useState('cardList');
  const [tab, setTab] = React.useState(0);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewVideo, setIsLoadingVideo] = useState(false);

  const { showSnackbar } = useSnackbar();

  const formProps = {
    players,
    teams,
    clubs,
    meetings,
    payments,
    tags,
    videos,
    gameStats
  }

  const addActions = getDefaultActions({ type: 'videos' });
  const editActions = getDefaultQuickActions({ type: 'videos' });

  const handleClearAfterAdd = () => {
    setIsAdding(false);
    setLastAddedId(null);
    setIsLoadingVideo(false);
  };

  const allVideosRaw = [...(videos || []), ...(videoAnalysis || [])];

  const allVideos = allVideosRaw.filter(isVideoComplete);
  //console.log(allVideos, allVideosRaw)
  const displayVideos = isLoadingNewVideo
    ? [...allVideosRaw, { id: '__loading__' }]
    : allVideos;

  useObjectAddStatus({
    list: allVideos,
    objectId: lastAddedId,
    isWaiting: isAdding,
    type: 'videos',
    clear: handleClearAfterAdd,
  });

  const actions = {
    ...addActions,
    ...editActions,
    videosList: displayVideos,
    onAdd: async (data, internalActions) => {
      setIsAdding(true);
      setLastAddedId(data.id);
      setIsLoadingVideo(true);
      await addActions.onAdd(data, internalActions);
    },
    onDelete: async (video) => {
      if (video.type === 'videoAnalyses') {
        await deleteVideoAnalysis(video, showSnackbar, allShorts);
      } else {
        await deleteVideo(video, showSnackbar, allShorts);
      }
    },
    setTab: setTab,
    tab: tab,
    setIdDisplay: setIdDisplay
  };
  //console.log(actions)
  return (
    <GenericObjectLayout
      tab={tab}
      type="videos"
      id="videosLayout"
      view='profileAnalyst'
      title={tab === 0 ? 'ניתוחי וידאו' : 'וידאו כללי'}
      icon={tab === 0 ? 'videoAnalysis' : 'videoGeneral'}
      idDisplay={idDisplay}
      rowData={{ videos: videos, videoAnalysis: videoAnalysis }}
      formProps={formProps}
      bottomTabs={bottomTabs}
      columns={{ xs: 2, sm: 2, md: 8 }}
      form={NewVideoForm}
      getInitialState={(p) => {
        return {
          id: p?.id || '',
          link: p?.link || '',
          name: p?.name || '',
          players: p?.players || [],
          tags: p?.tags || [],
          comments: p?.comments || '',
          analysDate: p?.analysDate || '',
          meetingId: p?.meetingId || ''
        };
      }}
      onClick={(e, p, actionItem, navigate) => {
        //navigate(`/Player/${player.id}`);
      }}
      actions={actions}
    />
  );
}
