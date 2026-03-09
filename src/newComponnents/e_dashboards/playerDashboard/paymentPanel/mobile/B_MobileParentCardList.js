import * as React from 'react';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { useSnackbar } from '../../../../h_componnetsUtils/SnackBar/SnackbarProvider';
import { useObjectUpdateStatus } from '../../../../h_componnetsUtils/SnackBar/useObjectUpdateStatus';
import { parentCardProps, buttEditProps, addCardProps, deleteButtProps } from './X_Style'
import { Card, Stack, Typography, Button, Box, Avatar, IconButton } from '@mui/joy';

import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import ParentFormModal from './BB_ParentFormModal';

function generateParentId(name) {
  const slug = name?.trim()?.toLowerCase()?.replace(/\s+/g, "-") || "parent";

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

  return `${slug}-${datePart}-${timePart}`;
}

export default function MobileParentCardList({ parents = [], setParents, player, actions }) {
  const [open, setOpen] = React.useState(false);
  const [selectedParent, setSelectedParent] = React.useState(null);
  const [editIndex, setEditIndex] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { showSnackbar } = useSnackbar();

  const handleAdd = () => {
    setSelectedParent(null);
    setEditIndex(null);
    setOpen(true);
  };

  const handleEdit = (parent, index) => {
    setSelectedParent(parent);
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = async (index) => {
    const updated = [...parents];
    updated.splice(index, 1); // הסרה

    setParents(updated);

    const oldItem = {
      id: player.id,
      parents: player.parents || [],
    };

    const newItem = {
      id: player.id,
      parents: updated,
    };

    const hasChanged = JSON.stringify(newItem) !== JSON.stringify(oldItem);
    if (!hasChanged) return;

    setIsSubmitting(true);

    try {
      await actions.editPlayer.onEdit(
        { oldItem, newItem },
        {
          ...actions,
          onClose: actions?.onClose,
        }
      );
      showSnackbar('🗑️ הורה נמחק בהצלחה');
    } catch (err) {
      console.error('❌ שגיאה במחיקת הורה:', err.message);
    }
  };

  const handleSubmit = async (newData) => {
    const updated = [...parents];
    const parentId = newData.id || generateParentId(newData.parentName);
    const parentWithId = { ...newData, id: parentId };

    if (editIndex !== null) {
      updated[editIndex] = parentWithId;
    } else {
      updated.push(parentWithId);
    }

    setParents(updated);
    setOpen(false);

    const oldItem = {
      id: player.id,
      parents: player.parents || [],
    };

    const newItem = {
      id: player.id,
      parents: updated,
    };

    const hasChanged = JSON.stringify(newItem) !== JSON.stringify(oldItem);
    if (!hasChanged) return;

    setIsSubmitting(true);

    try {
      await actions.editPlayer.onEdit(
        { oldItem, newItem },
        {
          ...actions,
          onClose: actions?.onClose,
        }
      );
      showSnackbar('👪 פרטי ההורה נשמרו בהצלחה');
    } catch (err) {
      console.error('❌ שגיאה בעדכון הורים:', err.message);
    }
  };

  useObjectUpdateStatus({
    updatedItem: { id: player.id, parents }, // או formData אם יש
    objectId: player.id,
    isWaiting: isSubmitting,
    type: 'players',
    clear: () => setIsSubmitting(false),
  });

  return (
    <>
      <Stack spacing={2} mt={-3}>
        <Typography level="h5" fontWeight="lg" color="primary">
          אנשי קשר / הורים
        </Typography>

        {/* הודעה כשהרשימה ריקה */}
        {parents.length === 0 && (
          <Typography level="body-sm" color="neutral">
            לא הוזנו עדיין פרטי הורים
          </Typography>
        )}

        <Stack direction={{ md: 'row', xs: 'column' }} spacing={2} flexWrap="wrap">
          {parents.map((parent, index) => (
            <Card key={index} {...parentCardProps}>
              <Stack spacing={2} alignItems="center">
                <Avatar src={playerImage} size="lg" variant="soft" color="neutral" />

                <Stack spacing={0.5} alignItems="center">
                  <Typography fontWeight="lg">
                    {parent.parentName || 'לא צויין'}
                  </Typography>
                  <Typography level="body-sm" color="neutral">
                    {`${parent.parentRole || 'הורה'} של ${player?.playerFullName || '---'}`}
                  </Typography>
                  {parent.parentEmail && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailRoundedIcon fontSize="small" />
                      <Typography level="body-sm">{parent.parentEmail}</Typography>
                    </Stack>
                  )}
                  {parent.parentPhone && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneRoundedIcon fontSize="small" />
                      <Typography level="body-sm">{parent.parentPhone}</Typography>
                    </Stack>
                  )}
                  {(!parent.parentPhone && !parent.parentEmail) && (
                    <Typography level="body-sm" color="neutral">אין פרטי קשר</Typography>
                  )}
                </Stack>
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button {...deleteButtProps} onClick={() => handleDelete(index)}>
                  מחק
                </Button>
                <Button {...buttEditProps} onClick={() => handleEdit(parent, index)}>
                  ערוך
                </Button>
              </Box>
            </Card>
          ))}

          {/* כרטיס להוספת הורה */}
          <Card {...addCardProps} onClick={handleAdd} >
            <IconButton size="lg" variant="soft" color="primary">
              <AddRoundedIcon />
            </IconButton>
            <Typography level="body-sm" mt={1}>
              הוסף הורה
            </Typography>
          </Card>
        </Stack>
      </Stack>

      <ParentFormModal
        open={open}
        onClose={() => setOpen(false)}
        initialData={selectedParent}
        onSubmit={handleSubmit}
      />
    </>
  );
}
