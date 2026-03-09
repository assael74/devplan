import React, { useState, useRef, useMemo, useEffect } from 'react';
import { cardProps, typoVideoNameProps, tagsBoxProps } from './containersStyle/EB_CardVideoStyle.js'
import { Card, CardContent } from '@mui/joy';
import { MenuButton, IconButton, Typography, Dropdown, Menu, MenuItem, Box, useTheme } from '@mui/joy';
import { ListItemDecorator, Avatar, Input, Chip, Tooltip } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import useMediaQuery from '@mui/material/useMediaQuery';
import { typeBackground } from '../../b_styleObjects/Colors.js'
import GenericEditMenu from './F_GenericEditMenu'
import DriveVideoBox from '../../k_videoPlayer/DriveVideoBox.js'
import DriveVideoPlayer from '../../k_videoPlayer/DriveVideoPlayer.js'
import VideoCommentsButton from './commentsUtilles/VideoCommentsButton.js'
import { getDrivePreviewLink, getDriveFileId } from '../../k_videoPlayer/helpers/getDrivePreviewLink.js';

export default function CardVideoContainer({
  type,
  item,
  view,
  onClick,
  actions,
  columns,
  sx = {},
  idDisplay,
  formProps,
  allShorts,
  chips = [],
  content = null,
  getInitialState,
  menuComponent = null,
}) {
  const [update, setUpdate] = React.useState(() => getInitialState(item));
  const [newTag, setNewTag] = useState('');
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [actionItem, setActionItem] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !update.tags?.includes(trimmed)) {
      setUpdate(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmed],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setUpdate(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove),
    }));
  };

  const flexBasis = {
    menu: isMobile ? '18%' : '25%',
    image: '10%',
    name: isMobile ? '55%' : '35%',
    chips: isMobile ? '100%' : '40%'
  };

  const videoName = item.name
  const videoLink = item.link
  const videoTags = item.tags
  const videoId = getDriveFileId(videoLink);
  const previewUrl = `https://drive.google.com/file/d/${videoId}/preview`;

  const handleCardClick = (e) => {
    if (e.target.closest('.menu-button')) return;
    setOpen(true);
  };

  return (
    <>
      <Card onClick={handleCardClick} {...cardProps} >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography {...typoVideoNameProps}>
            {videoName}
          </Typography>
          <Box sx={{ ml: 0.5 }}>
            <GenericEditMenu
              type={type}
              item={item}
              view={view}
              update={update}
              columns={columns}
              actions={actions}
              isMobile={isMobile}
              flexBasis={flexBasis}
              setUpdate={setUpdate}
              formProps={formProps}
              allShorts={allShorts}
              idDisplay={idDisplay}
              menuComponent={menuComponent}
            />
          </Box>
        </div>
        {/* אזור הוידאו */}
        <CardContent sx={{ mt: -0.5 }}>
          <Box sx={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 2, overflow: 'hidden', backgroundColor: '#eee' }}>
            <iframe
              src={`https://drive.google.com/file/d/${videoId}/preview`}
              width="100%"
              height="100%"
              style={{ border: 'none', pointerEvents: 'none', borderRadius: 8 }}
            />
          </Box>
        </CardContent>
        {/* תגיות */}
        <CardContent sx={{ mt: -1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <VideoCommentsButton update={update} setUpdate={setUpdate} />
            <Box {...tagsBoxProps}>
              {(update.tags || []).map((tag) => (
                <Chip
                  key={tag}
                  size='sm'
                  variant="outlined"
                >
                <Typography sx={{ fontSize: '10px' }}>#{tag}</Typography>
                </Chip>
              ))}
            </Box>
          </Box>
        </CardContent>

      </Card>

      <DriveVideoPlayer
        open={open}
        onClose={() => setOpen(false)}
        videoLink={videoLink}
        videoName={videoName}
      />
    </>
  );
}
