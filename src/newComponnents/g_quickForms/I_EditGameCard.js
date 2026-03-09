import React, { useState } from 'react';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { drawerConsProps, menuButtonProps, sheetWraperMoadlProps, titleTypoProps, modalProps } from './X_Style'
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { typeBackground } from '../b_styleObjects/Colors.js'
import useObjectUpdateActions from './useObjectUpdateActions';
import { getFullDateIl } from '../x_utils/dateUtiles.js'
import { normalizePlayerStatsList } from '../f_forms/helpers/useSmartStatChange.js';
import { generateTeamStats } from '../f_forms/helpers/calcultor';
import { Typography, Sheet, Drawer, Box, Dropdown, MenuButton, Divider, Modal, Avatar, Chip } from '@mui/joy';
import { ModalDialog, List, ListItem, ListItemButton, ListItemDecorator, ModalClose, DialogTitle} from '@mui/joy';
import { MoreVert } from '@mui/icons-material';

import DeleteConfirmModal from './deleteModal/DeleteConfirmModal.js'
import GameEditModalContent from './modalContent/I_GameEditModalContent.js'

function DialogTitleDrawer({ item, isMobile, team, club }) {
  const clubName = club(item.clubId)?.clubName || '';
  const teamName = team(item.teamId)?.teamName || '';
  const rivel = item.rivel || '';
  const date = item.gameDate || '';

  return (
    <DialogTitle
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.3,
        p: isMobile ? 1 : 2
      }}
    >
      {/* שורה 1: כותרת פעולה */}
      <Typography {...titleTypoProps('games', isMobile)} sx={{ color: 'primary.600' }}>
        עריכת משחק
      </Typography>

      {/* שורה 2: שם קבוצה ומועדון */}
      <Typography level="body-sm" sx={{ color: 'neutral.700', fontSize: isMobile ? '12px' : '14px' }}>
        {teamName} ({clubName})
      </Typography>

      {/* שורה 3: יריבה + תאריך */}
      <Typography level="body-sm" sx={{ color: 'neutral.600', fontSize: isMobile ? '12px' : '13px' }}>
        מול {rivel} | {getFullDateIl(date)}
      </Typography>
    </DialogTitle>
  );
}

function DialogTitleModal({ item, actionItem, isMobile, team, club, player, view }) {
  const clubName = club(item.clubId)?.clubName || '';
  const teamName = team(item.teamId)?.teamName || '';
  const rivel = item.rivel || '';
  const date = item.gameDate || '';

  const actionLabel =
    {
      gameStats: 'עריכת סטטיסטיקה אישית',
      gameInfo: 'עריכת פרטי משחק',
      gameResult: 'עריכת תוצאת משחק',
      gameTime: 'עריכת זמני משחק',
      delete: 'מחיקת משחק',
    }[actionItem] || '';

  const inPlayerProfile = player !== null && actionItem === 'gameStats' && player;

  return (
    <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
     {!inPlayerProfile && (
       <Typography component="p" level="body-sm" sx={{ color: 'primary.600', fontSize: isMobile ? '12px' : '14px' }}>
         {actionLabel}
       </Typography>
     )}

      {inPlayerProfile ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, direction: 'rtl' }}>
          <Box>
            <Typography level="title-sm" sx={{ fontWeight: 'lg', fontSize: isMobile ? '12px' : '14px' }}>
              {player.playerFullName}
            </Typography>
            <Chip size="sm" variant="soft" color="neutral">
              {teamName}
            </Chip>
            <Chip size="sm" variant="soft" color="primary" sx={{ mr: 0.2 }}>
              {clubName}
            </Chip>
          </Box>
          <Avatar
            src={player.photo || undefined}
            size={isMobile ? 'sm' : 'md'}
            sx={{ border: '1px solid', borderColor: 'neutral.outlinedBorder' }}
          />
        </Box>
      ) : (
        <Typography level="body-sm" sx={{ color: 'neutral.700', fontSize: isMobile ? '12px' : '14px' }}>
          {teamName} ({clubName})
        </Typography>
      )}

      {/* שורה 3: יריבה + תאריך */}
      <Typography level="body-sm" sx={{ color: 'neutral.600', fontSize: isMobile ? '12px' : '13px' }}>
        מול {rivel} | {getFullDateIl(date)}
      </Typography>
    </DialogTitle>
  );
}

export default function EditGameCard({
  view,
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
    onSubmit: async ({ oldItem, newItem }) => {
      setIsUpdate(true);
      try {
        const addOld = { ...oldItem, id: item.id };
        const addNew = { ...newItem, id: item.id };
        const derivedType = type === 'videos' ? item.type : type;

        await actions.onEdit({
          oldItem: addOld,
          newItem: addNew,
          type: derivedType, // 'games'
        });

        showSnackbar('משחק עודכן בהצלחה', 'warning', 'games');
        setActionItem('');
      } catch (err) {
        console.error('❌ שגיאה בעדכון:', err);
        showSnackbar('שגיאה בעדכון', 'warning', 'games');
      } finally {
        setIsUpdate(false);
      }
    },
  });

  const team = (teamId) => formProps?.teams.find(i=>i.id === teamId)
  const club = (clubId) => formProps?.clubs.find(i=>i.id === clubId)
  const player = view === 'profilePlayer' ? formProps.players.find(i => i.id === update.gameStats.playerId) : null;
  //console.log(view, onSubmit)
  const menuList = menuConfig.filter(p => !p.view || (Array.isArray(p.view) ? p.view.includes(view) : p.view === view));

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
          <DialogTitleDrawer item={item} isMobile={isMobile} team={team} club={club} />
          <ModalClose sx={{ position: 'absolute', top: 15, left: 20, right: 'auto' }} />
          <Divider sx={{ mt: 'auto' }} />
          <List size={isMobile ? 'sm' : 'lg'}>
          {menuList.map((cfg, idx) => (
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
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} team={team} club={club} />
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
          <ModalDialog {...modalProps(open, isMobile)} onClick={(e) => e.stopPropagation()} >
            <DialogTitleModal item={item} actionItem={actionItem} isMobile={isMobile} team={team} club={club} player={player} view={view} />
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
            <GameEditModalContent
              view={view}
              update={update}
              actions={actions}
              isDirty={isDirty}
              isUpdate={isUpdate}
              isMobile={isMobile}
              onChange={setUpdate}
              formProps={formProps}
              clubs={formProps.clubs}
              teams={formProps.teams}
              actionItem={actionItem}
              handleReset={handleReset}
              handleSubmit={handleSubmit}
              setActionItem={setActionItem}
              handleClose={() => setActionItem('')}
            />
          </ModalDialog>
        </Modal>
      )}
    </>
  );
}
