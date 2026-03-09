import React, { useState } from 'react';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { drawerConsProps, menuButtonProps, sheetWraperMoadlProps, titleTypoProps, modalProps } from './X_Style'
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import useObjectUpdateActions from './useObjectUpdateActions';
import { Typography, Sheet, Drawer, Dropdown, MenuButton, Divider, Modal } from '@mui/joy';
import { ModalDialog, List, ListItem, ListItemButton, ListItemDecorator, ModalClose, DialogTitle} from '@mui/joy';
import { MoreVert } from '@mui/icons-material';

import EditImageCard from './imageUpload/EditImageCard.js'
import DeleteConfirmModal from './deleteModal/DeleteConfirmModal.js'
import TeamEditModalContent from './modalContent/B_TeamEditModalContent.js'

const diffRoles = (oldRoles = [], newRoles = []) => {
  const added = [];
  const removed = [];
  const updated = [];

  const oldMap = new Map(oldRoles.map(r => [r.id, r]));
  const newMap = new Map(newRoles.map(r => [r.id, r]));

  for (const [id, oldItem] of oldMap.entries()) {
    const newItem = newMap.get(id);
    if (!newItem) {
      removed.push(oldItem);
    } else if (
      oldItem.type !== newItem.type ||
      oldItem.clubId !== newItem.clubId ||
      oldItem.teamId !== newItem.teamId
    ) {
      updated.push({ oldItem, newItem });
    }
  }

  for (const [id, newItem] of newMap.entries()) {
    if (!oldMap.has(id)) {
      added.push(newItem);
    }
  }

  return { added, removed, updated };
};

function DialogTitleDrawer({ item, isMobile, club }) {
  const clubObj = club(item.clubId);
  const clubName = clubObj?.clubName || 'מועדון לא נמצא';

  return (
    <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, p: 1 }}>
      <Typography {...titleTypoProps('teams', isMobile)}>
        פעולות עבור קבוצה
      </Typography>

      <Typography level="body-sm" sx={{ color: 'neutral.600', fontSize: isMobile ? '12px' : '14px' }}>
        <Typography sx={{ color: 'primary.600' }}>{item.teamName}</Typography> ({clubName})
      </Typography>
    </DialogTitle>
  );
}

function DialogTitleModal({ item, actionItem, isMobile, club }) {
  const clubObj = club(item.clubId);
  const clubName = clubObj?.clubName || 'מועדון לא נמצא';
  const actionLabel = {
    teamInfo: 'עריכת פרטי הקבוצה',
    teamCoach: 'עריכת פרטי המאמן',
    delete: 'מחיקת קבוצה',
  }[actionItem] || '';

  return (
    <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
      <Typography level="title-md" sx={{ color: 'text.secondary' }}>
        {actionLabel}
      </Typography>
      <Typography {...titleTypoProps('teams', isMobile)}>
        <Typography sx={{ color: 'primary.600' }}>{item.teamName}</Typography> ({clubName})
      </Typography>
    </DialogTitle>
  )
}

export default function EditTeamCard({
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
        const oldRoles = data.oldItem.roles || [];
        const newRoles = data.newItem.roles || [];

        const oldRoleIds = oldRoles.map(r => r.id).sort();
        const newRoleIds = newRoles.map(r => r.id).sort();

        const rolesChanged = JSON.stringify(oldRoleIds) !== JSON.stringify(newRoleIds);

        const otherDataChanged = (
          item.teamName !== data.teamName ||
          item.ifaLink !== data.ifaLink
          // תוכל להוסיף כאן עוד שדות בעתיד
        );

        if (otherDataChanged) {
          await onSubmit?.(data);
          showSnackbar('קבוצה עודכנה בהצלחה', 'warning', 'teams');
          setActionItem('');
        }

        if (rolesChanged && actions.onEditRole) {
          const { added, removed, updated } = diffRoles(oldRoles, newRoles);

          const changedRoles = [
            ...added.map(staff => ({
              oldItem: staff,
              newItem: { ...staff, teamId: item.id, clubId: item.clubId },
            })),
            ...removed.map(staff => ({
              oldItem: staff,
              newItem: { ...staff, teamId: '', clubId: staff.clubId },
            })),
            ...updated.map(({ oldItem, newItem }) => ({
              oldItem,
              newItem: { ...newItem, teamId: item.id },
            })),
          ];

          for (const roleChange of changedRoles) {
            await actions.onEditRole(roleChange, actions);
          }

          showSnackbar('עודכנו אנשי הצוות', 'warning', 'roles');
          setActionItem('');
        }

      } catch (err) {
        console.error('❌ שגיאה בעדכון:', err);
        showSnackbar('שגיאה בעדכון הקבוצה', 'warning', 'teams');
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
          <DialogTitleDrawer item={item} isMobile={isMobile} club={club} />
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
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} club={club} />
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
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} club={club} />
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
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} club={club} />
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
            <TeamEditModalContent
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
