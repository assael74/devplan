import React, { useState } from 'react';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { drawerConsProps, menuButtonProps, sheetWraperMoadlProps, titleTypoProps, modalProps } from './X_Style'
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { typeBackground } from '../b_styleObjects/Colors.js'
import useObjectUpdateActions from './useObjectUpdateActions';
import { Typography, Sheet, Drawer, Box, Dropdown, MenuButton, Divider, Modal } from '@mui/joy';
import { ModalDialog, List, ListItem, ListItemButton, ListItemDecorator, ModalClose, DialogTitle} from '@mui/joy';
import { MoreVert } from '@mui/icons-material';

import EditImageCard from './imageUpload/EditImageCard.js'
import DeleteConfirmModal from './deleteModal/DeleteConfirmModal.js'
import RoleEditModalContent from './modalContent/L_RoleEditModalContent.js'

function DialogTitleDrawer({ item, isMobile, club, team }) {
  const clubObj = club(item.clubId);
  const teamObj = team(item.teamId);
  const clubName = clubObj?.clubName || 'מועדון לא הוגדר';
  const teamName = teamObj?.teamName || 'קבוצה לא הוגדרה';

  return (
    <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, p: 1 }}>
      <Typography {...titleTypoProps('roles', isMobile)}>
        פעולות עבור איש הצוות
      </Typography>

      <Typography level="body-sm" sx={{ color: 'neutral.600', fontSize: isMobile ? '12px' : '14px' }}>
        <Typography sx={{ color: 'primary.600' }}>{item.fullName}</Typography> ({clubName} - {teamName})
      </Typography>
    </DialogTitle>
  );
}

function DialogTitleModal({ item, actionItem, isMobile, club, team }) {
  const clubObj = club(item.clubId);
  const teamObj = team(item.teamId);
  const clubName = clubObj?.clubName || 'מועדון לא הוגדר';
  const teamName = teamObj?.teamName || 'קבוצה לא הוגדרה';
  const actionLabel = {
    rolesInfo: 'עריכת פרטי איש הצוות',
    delete: 'מחיקת איש צוות',
  }[actionItem] || '';

  return (
    <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
      <Typography level="title-md" sx={{ color: 'text.secondary' }}>
        {actionLabel}
      </Typography>
      <Typography {...titleTypoProps('roles', isMobile)}>
        <Typography sx={{ color: 'primary.600' }}>{item.fullName}</Typography> ({clubName}-{teamName})
      </Typography>
    </DialogTitle>
  )
}

export default function EditRoleCard({
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

  const club = (clubId) => formProps?.clubs.find(i=> i.id === clubId)
  const team = (teamId) => formProps?.teams.find(i=> i.id === teamId)

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
        showSnackbar('איש צוות עודכן בהצלחה', 'warning', 'roles');
        setActionItem('');
      } catch (err) {
        console.error('❌ שגיאה בעדכון:', err);
        showSnackbar('שגיאה בעדכון איש הצוות', 'warning', 'teams');
      } finally {
        setIsUpdate(false);
      }
    },
  });

  return (
    <>
      <Dropdown>
        <MenuButton onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }} {...menuButtonProps(isMobile, columns)}>
          <MoreVert sx={{ color: '#333', fontSize: isMobile ? 'sm' : 'md' }} />
        </MenuButton>
      </Dropdown>

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperMoadlProps}>
          <DialogTitleDrawer item={item} isMobile={isMobile} club={club} team={team} />
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

      {actionItem === 'photo' ? (
        <Modal open={!!actionItem} onClose={(e) => e.stopPropagation()}>
          <ModalDialog {...modalProps(open, isMobile)} onClick={(e) => e.stopPropagation()}>
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} club={club} team={team} />
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
            <EditImageCard
              type={type}
              value={update}
              isUpdate={isUpdate}
              isDirty={isDirty}
              isMobile={isMobile}
              onChange={setUpdate}
              formProps={formProps}
              handleReset={handleReset}
              handleSubmit={handleSubmit}
            />
          </ModalDialog>
        </Modal>
      ) : actionItem === 'delete' ? (
        <Modal open={!!actionItem} onClose={(e) => e.stopPropagation()}>
          <ModalDialog {...modalProps(open, isMobile)} onClick={(e) => e.stopPropagation()}>
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} club={club} team={team} />
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
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} club={club} team={team} />
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
            <RoleEditModalContent
              update={update}
              isDirty={isDirty}
              isUpdate={isUpdate}
              isMobile={isMobile}
              onChange={setUpdate}
              formProps={formProps}
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
