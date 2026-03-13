// src/features/players/components/preview/PreviewDomainCard/PreviewDomainCardOverlay.js

import React, { useRef, useState, useMemo } from 'react'
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Checkbox from '@mui/joy/Checkbox';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Stack from '@mui/joy/Stack';
import RadioGroup from '@mui/joy/RadioGroup';
import Radio from '@mui/joy/Radio';
import Sheet from '@mui/joy/Sheet';
import Switch from '@mui/joy/Switch';
import Typography from '@mui/joy/Typography';
import TuneIcon from '@mui/icons-material/TuneRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import MeetingRoomRoundedIcon from '@mui/icons-material/MeetingRoomRounded';
import HotelRoundedIcon from '@mui/icons-material/HotelRounded';
import Done from '@mui/icons-material/Done';

import PreviewDomainCardHeader from './PreviewDomainCardHeader'
import { overlaySx as sx } from './PreviewDomainCardOverlay.sx'

import { getDomainDef } from './domainRegistry'
import { getEntityKind } from './utils/getEntityKind'

export default function PreviewDomainCardOverlay({
  d,
  entity,
  open,
  onClose,
  setOpen,
  playerPhoto,
  fullName,
  context,
  videoActions,
  birthYearText,
  onSaveInfo,
}) {
  const def = useMemo(() => {
    if (!d?.key) return null
    const entityKind = getEntityKind(entity)
    return getDomainDef(entityKind, d.key)
  }, [d?.key, entity])

  const domainImg = def?.image || null
  const DomainModal = def?.Modal
  const container = def?.container || 'modal'
  const content = DomainModal ? (
    <DomainModal
      d={d}
      items={d?.data || []}
      entity={entity}
      context={context}
      videoActions={videoActions}
      onClose={onClose}
      onSave={onSaveInfo}
    />
  ) : (
    <DialogContent>תוכן יתווסף בהמשך</DialogContent>
  )

  return (
    <Drawer
      size="md"
      variant="plain"
      anchor='bottom'
      open={open}
      onClose={() => setOpen(false)}
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: { md: 3, sm: 0 },
            boxShadow: 'none',
            top: 50,
            height: 'calc(100vh - 90px)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Sheet
        sx={{
          borderRadius: 'md',
          px: 2,
          pt: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          height: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          maxWidth: { xs: '100%', sm: 500, md: 800 },
          mx: 'auto',
        }}
      >
        <ModalClose />
        <PreviewDomainCardHeader
          label={d?.label}
          playerPhoto={playerPhoto}
          fullName={fullName}
          birthYearText={birthYearText}
          domainImg={domainImg}
        />
        <Divider sx={{ mt: 'auto' }} />
        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.bodyScrollSx} className="dpScrollThin">{content}</Box>
        </DialogContent>
        <Box sx={{ height: 5 }} />
      </Sheet>
    </Drawer>
  );
}
