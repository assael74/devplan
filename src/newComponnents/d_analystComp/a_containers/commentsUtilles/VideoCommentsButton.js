import React, { useState, useMemo } from 'react';
import {
  IconButton,
  Tooltip,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  ModalClose,
  Typography,
  Input,
  Box
} from '@mui/joy';
import CommentIcon from '@mui/icons-material/Comment';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function VideoCommentsButton({ update, setUpdate }) {
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const commentsArray = useMemo(() => {
    if (!update.comments) return [];
    return update.comments.split('\n');
  }, [update.comments]);

  const CommentsList = (
    <Box sx={{ maxWidth: 250 }}>
      {commentsArray.length ? (
        commentsArray.map((c, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography level="body-sm" sx={{ flex: 1 }}>{c}</Typography>
          </Box>
        ))
      ) : (
        <Typography level="body-sm">אין הערות</Typography>
      )}
    </Box>
  );
  
  return (
    <>
      {isMobile ? (
        <IconButton
          size="xs"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <CommentIcon fontSize="xs" />
        </IconButton>
      ) : (
        <Tooltip title={update.comments !== '' ? update.comments : 'אין הערות'} placement="top">
          <IconButton
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          >
            <CommentIcon fontSize="xs" />
          </IconButton>
        </Tooltip>
      )}

      <Modal
        open={open}
        onClose={(e) => {
          e.stopPropagation();
          setOpen(false)
        }}
      >
        <ModalDialog sx={{ width: '90%', maxWidth: 320 }} onClick={(e) => e.stopPropagation()}>
          <DialogTitle>💬 הערות לוידאו</DialogTitle>
          <ModalClose />
          <DialogContent sx={{ direction: 'rtl' }}>
            {CommentsList}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </>
  );
}
