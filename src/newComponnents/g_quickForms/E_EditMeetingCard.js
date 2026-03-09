import React, { useState } from 'react';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { drawerConsProps, menuButtonProps, sheetWraperMoadlProps, titleTypoProps, modalProps } from './X_Style'
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { typeBackground } from '../b_styleObjects/Colors.js'
import useObjectUpdateActions from './useObjectUpdateActions';
import { getMeetingDate } from '../x_utils/dateUtiles.js'
import { Typography, Sheet, Drawer, Box, Dropdown, MenuButton, Divider, Modal } from '@mui/joy';
import { ModalDialog, List, ListItem, ListItemButton, ListItemDecorator, ModalClose, DialogTitle} from '@mui/joy';
import { MoreVert } from '@mui/icons-material';

import DeleteConfirmModal from './deleteModal/DeleteConfirmModal.js'
import MeetingEditModalContent from './modalContent/E_MeetingEditModalContent.js'

function DialogTitleDrawer({ item, isMobile, player }) {
  const playerObj = player(item.playerId);
  const playerName = playerObj?.playerFullName || 'שחקן לא נמצא';
  const dateMeeting = getMeetingDate(item)
  return (
    <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, p: 1 }}>
      <Typography {...titleTypoProps('meetings', isMobile)}>
        פעולות עבור פגישה עם <Typography sx={{ color: 'primary.600' }}>{playerName}</Typography>
      </Typography>

      <Typography component="p" level="body-sm" sx={{ color: 'neutral.600' }}>
        תאריך הפגישה: <Typography sx={{ color: 'primary.600' }}>{dateMeeting.date.v4 || '—'}</Typography>
      </Typography>
    </DialogTitle>
  );
}

function DialogTitleModal({ item, actionItem, isMobile, player }) {
  const playerObj = player(item.playerId);
  const playerName = playerObj?.playerFullName || 'שחקן לא נמצא';
  const dateMeeting = getMeetingDate(item)

  const actionLabel = {
    meetingInfo: 'פרטי פגישה',
    meetingStatus: 'סטטוס פגישה',
    meetingType: 'סוג פגישה',
    delete: 'מחיקת פגישה',
  }[actionItem] || '';

  return (
    <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
      <Typography {...titleTypoProps('meetings', isMobile)} sx={{ fontWeight: 'lg' }}>
        עריכת פגישה עם <Typography sx={{ color: 'primary.600' }}>{playerName}</Typography>
      </Typography>

      <Typography component="p" level="body-sm" sx={{ color: 'neutral.600', fontSize: isMobile ? '12px' : '14px' }}>
        {actionLabel} לחודש: <Typography sx={{ color: 'primary.600' }}>{dateMeeting.date.v4 || '—'}</Typography>
      </Typography>
    </DialogTitle>
  )
}

export default function EditMeetingCard({
  item,
  actions,
  columns,
  onSubmit,
  isMobile,
  formProps,
  allShorts,
  type = 'clubs',
  menuConfig = [],
}) {
  const [open, setOpen] = useState(false);
  const [actionItem, setActionItem] = useState('');
  const [isUpdate, setIsUpdate] = useState(false);

  const { showSnackbar } = useSnackbar();

  const {
    update,
    isDirty,
    setUpdate,
    handleSubmit,
    handleReset,
  } = useObjectUpdateActions({
    value: item,
    type,
    onSubmit: async (data) => {
      setIsUpdate(true);
      try {
        await onSubmit?.(data);
        showSnackbar('פגישה עודכנה בהצלחה', 'warning', 'meetings');
        setActionItem('');
      } catch (err) {
        console.error('❌ שגיאה בעדכון:', err);
        showSnackbar('שגיאה בעדכון הפגישה', 'warning', 'meetings');
      } finally {
        setIsUpdate(false);
      }
    },
  });

  const player = (playerId) => formProps?.players.find(i=>i.id === playerId)

  return (
    <>
      <Dropdown>
        <MenuButton onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }} {...menuButtonProps(isMobile, columns)}>
          <MoreVert sx={{ color: '#333', fontSize: isMobile ? 'sm' : 'md'  }} />
        </MenuButton>
      </Dropdown>

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperMoadlProps}>
          <DialogTitleDrawer item={item} isMobile={isMobile} player={player} />
          <ModalClose sx={{ position: 'absolute', top: 15, left: 20, right: 'auto' }} />
          <Divider sx={{ mt: 'auto' }} />
          <List size={isMobile ? 'sm' : 'lg'}>
          {menuConfig.map((cfg, idx) => (
            cfg.id === 'divider' ? (
              <Divider key={`divider-${idx}`} sx={{ my: 2 }} />
            ) : (
              <ListItem
                key={cfg.id}
                color={cfg.color || 'neutral'}
                onClick={(e) => {
                  setActionItem(cfg.id);
                  e.stopPropagation();
                }}
              >
                <ListItemButton>
                  <ListItemDecorator>{iconUi({ id: cfg.iconId || cfg.id })}</ListItemDecorator>
                  {cfg.label}
                </ListItemButton>
              </ListItem>
            )
          ))}
          </List>
        </Sheet>
      </Drawer>
      {actionItem === 'delete' ? (
        <Modal open={!!actionItem} onClose={(e) => e.stopPropagation()}>
          <ModalDialog {...modalProps(open, isMobile)} onClick={(e) => e.stopPropagation()}>
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} player={player} />
            <ModalClose
              variant="outlined"
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
                setActionItem('');
              }}
            />
            <Divider sx={{ my: 1 }} />
            <DeleteConfirmModal
              item={item}
              type={type}
              iconId="delete"
              actions={actions}
              isMobile={isMobile}
              title='אישור מחיקה'
              allShorts={allShorts}
              formProps={formProps}
              onDelete={actions.onDelete}
              onClose={() => setActionItem('')}
            />
          </ModalDialog>
        </Modal>
      ) : (
        <Modal open={!!actionItem} onClose={(e) => e.stopPropagation()}>
          <ModalDialog {...modalProps(open, isMobile)} onClick={(e) => e.stopPropagation()}>
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} player={player} />
            <ModalClose
              variant="outlined"
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
                setActionItem('');
              }}
            />
            <Divider sx={{ my: 1 }} />
            <MeetingEditModalContent
              update={update}
              isDirty={isDirty}
              isUpdate={isUpdate}
              isMobile={isMobile}
              onChange={setUpdate}
              actionItem={actionItem}
              handleReset={handleReset}
              handleSubmit={handleSubmit}
              handleClose={() => setActionItem('')}
            />
          </ModalDialog>
        </Modal>
      )}
    </>
  );
}
