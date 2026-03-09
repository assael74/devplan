import React, { useEffect, useState } from 'react';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import { Button, Typography, Box, Chip, Avatar, Divider, Alert } from '@mui/joy';

const tagTypeLabelMap = {
  videoAnalysis: 'ניתוח וידאו',
  video: 'וידאו כללי',
};

export const getTagsRowStructure = (isMobile, actions, formProps) => {
  const videos = formProps.videos
  const videoAnalysis = formProps.videoAnalysis
  const allVideos = videos.concat(videoAnalysis)
  const mainRow = [
    {
      id: 'tagName',
      label: 'שם תגית',
      tooltip: 'שם התג',
      iconId: 'name',
      width: '30%',
      render: (item) => `#${item.tagName}`,
    },
    {
      id: 'tagType',
      label: 'סוג',
      tooltip: 'סוג התג',
      iconId: 'tags',
      width: '30%',
      render: (item) => tagTypeLabelMap[item.tagType] || 'לא ידוע',
    },
    {
      id: 'tagPlayers',
      label: 'שחקנים',
      tooltip: 'שחקן מתוייגים',
      iconId: 'players',
      width: '15%',
      render: (item) => (item.tagPlayers?.length || 0),
    },
    {
      id: 'tagVideos',
      label: 'וידאו',
      tooltip: 'תגי וידאו',
      iconId: 'video',
      width: '15%',
      render: (item) => {
        const filteredVideos = allVideos.filter(i => i.tags?.includes(item.id));
        return filteredVideos.length
      }
    },
  ];

  const expandedRow = [
    {
      id: 'tagVideosExpanded',
      render: (item) => {
        const tag = formProps?.tags.find((p) => p.id === item?.id);
        const list = tag.tagType === 'video' ? formProps.videos : formProps.videoAnalysis
        const videos = list?.filter(v =>
          Array.isArray(v.tags) && v.tags.includes(tag.id)
        ) || [];
        const isNoVideos = videos.length === 0;

        if (isNoVideos) return ( <Box>אין וידאו עם התג הזה</Box> );

        return (
          <Box display="flex" flexWrap="wrap" gap={2} p={2}>
          {videos.map((video) => {
            return (
              <>
                <Chip
                  key={tag.id}
                  color="success"
                  variant="outlined"
                  size={isMobile ? 'xs' : 'sm'}
                  startDecorator={iconUi({id: 'video', size: isMobile ? 'xs' : 'sm'})}
                >
                  <Typography fontSize={isMobile ? '10px' : '12px'}>"{video.name}"</Typography>
                </Chip>
              </>
            );
          })}
          </Box>
        )
      }
    }
  ];

  return { mainRow, expandedRow };
};
