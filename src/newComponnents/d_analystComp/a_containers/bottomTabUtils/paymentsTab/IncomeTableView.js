// bottomTabUtils/tabs/IncomeTableView.js
import React from 'react';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Table, Button, Select, Option, Sheet, Divider, IconButton, Avatar } from '@mui/joy';
import { getMonthYearLabel } from '../../../../x_utils/dateUtiles';
import { typeBackground } from '../../../../b_styleObjects/Colors.js'
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js'
import { boxFiltersProps, tableProps } from './X_Style'
import MonthYearPicker from '../../../../f_forms/allFormInputs/dateUi/MonthYearPicker.js'

function getRowColor(mainColumn) {
  switch (mainColumn) {
    case 'player':
      return typeBackground.players.softBg;
    case 'team':
      return typeBackground.teams.softBg;
    case 'club':
      return typeBackground.clubs.softBg;
    default:
      return 'background.surface';
  }
}

export default function IncomeTableView({ payments = [], players = [], teams = [], clubs = [] }) {
  const [mainColumn, setMainColumn] = React.useState('player');
  const [filterBy, setFilterBy] = React.useState(null);
  const [date, setDate] = React.useState('');
  const [filteredPayments, setFilteredPayments] = React.useState(payments);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  React.useEffect(() => {
    let updated = [...payments];

    // סינון לפי שחקן/קבוצה
    if (filterBy) {
      if (mainColumn === 'player') {
        updated = updated.filter(p => p.playerId === filterBy);
      }
      if (mainColumn === 'team') {
        updated = updated.filter(p => {
          const player = players.find(pl => pl.id === p.playerId);
          return player?.teamId === filterBy;
        });
      }
      if (mainColumn === 'club') {
        updated = updated.filter(p => {
          const player = players.find(pl => pl.id === p.playerId);
          return player?.clubId === filterBy;
        });
      }
    }

    // סינון לפי תאריכים
    if (date) {
      updated = updated.filter(p => p.paymentFor === date);
    }

    setFilteredPayments(updated);
  }, [payments, players, filterBy, date]);

  return (
    <Box variant="outlined">

    <Box sx={{ mb: 1 }}>
      {/* כל שורת הסינונים */}
      <Box {...boxFiltersProps}>

        {/* בחירת סוג עמודה (שחקן/קבוצה/מועדון) */}
        <Select
          size='sm'
          placeholder="תצוגת עמודות"
          value={mainColumn}
          variant='solid'
          onChange={(e, val) => setMainColumn(val)}
          sx={{ minWidth: { xs: 120, md: 150 } }}
        >
          <Option value="player">לפי שחקן</Option>
          <Option value="team">לפי קבוצה</Option>
          <Option value="club">לפי מועדון</Option>
        </Select>

        {/* סינון לפי שחקן או קבוצה */}
        <Select
          size='sm'
          placeholder="בחר סינון"
          value={filterBy || ''}
          onChange={(e, val) => setFilterBy(val)}
          sx={{ minWidth: { xs: 120, md: 200 } }}
          slotProps={{ listbox: { sx: { maxHeight: 240, width: '100%' } } }}
        >
          <Option value="">ללא סינון</Option>

          {mainColumn === 'player' && players.map((player) => (
            <Option key={player.id} value={`${player.id}`}>
              {player.playerFullName}
            </Option>
          ))}

          {mainColumn === 'team' && teams.map((team) => (
            <Option key={team.id} value={`${team.id}`}>
              קבוצה: {team.teamName}
            </Option>
          ))}

          {mainColumn === 'club' && clubs.map((club) => (
            <Option key={club.id} value={`${club.id}`}>
              מועדון: {club.clubName}
            </Option>
          ))}
        </Select>

        {isMdUp && <Divider orientation="vertical" sx={{ mx: 1 }} />}

        {/* סינון לפי חודש/שנה */}
        <MonthYearPicker
          context="payment"
          value={date}
          size='sm'
          onChange={(val) => setDate(val)}
        />
        <IconButton size='sm' variant="outlined" sx={{ ml: 1, mt: -0.5 }} onClick={() => setDate('')}>
        {iconUi({id: 'reset'})}
        </IconButton>
      </Box>
    </Box>


      <Table {...tableProps(getRowColor(mainColumn))}>
        <thead>
          <tr>
            <th style={{ width: '30%' }}>חודש</th>

            <th style={{ width: isMdUp ? '6%' : '10%' }}></th>

            {(mainColumn === 'player' || isMdUp) && <th style={{ width: isMdUp ? '24%' : '30%' }}>שחקן</th>}
            {(mainColumn === 'team' || isMdUp) && <th style={{ width: isMdUp ? '24%' : '30%' }}>קבוצה</th>}
            {(mainColumn === 'club' || isMdUp) && <th style={{ width: isMdUp ? '24%' : '30%' }}>מועדון</th>}

            <th style={{ width: '10%' }}>סוג</th>

            <th style={{ width: '20%' }}>סכום</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((payment) => {
            const player = players.find((p) => p.id === payment.playerId);
            const team = teams.find((t) => t.id === player?.teamId);
            const club = clubs.find((c) => c.id === team?.clubId);
            const month = getMonthYearLabel(payment.paymentFor);
            const photo = () => {
              if (mainColumn === 'player') {
                return player?.photo || playerImage
              } else if (mainColumn === 'team') {
                return team?.photo || teamImage
              } else {
                return club?.photo || clubImage
              }
            }
            const avaSize = isMdUp ? { width: 35, height: 35 } : { width: 25, height: 25 }
            return (
              <tr key={payment.id}>
                <td style={{ width: '30%' }}> {month} </td>

                <td style={{ width: isMdUp ? '6%' : '10%' }}> <Avatar src={photo()} sx={avaSize} /> </td>

                {/* שחקן */}
                {(mainColumn === 'player' || isMdUp) &&
                  <td style={{ width: isMdUp ? '24%' : '30%' }}> {player?.playerFullName || '-'} </td>
                }

                {/* קבוצה */}
                {(mainColumn === 'team' || isMdUp) &&
                  <td style={{ width: isMdUp ? '24%' : '30%' }}> {team?.teamName || '-'} </td>
                }

                {/* מועדון */}
                {(mainColumn === 'club' || isMdUp) &&
                  <td style={{ width: isMdUp ? '24%' : '30%' }}> {club?.clubName || '-'} </td>
                }

                <td style={{ width: '10%' }}> {iconUi({id: payment.type})} </td>

                <td style={{ width: '20%' }}> {payment.price?.toLocaleString()} ₪ </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={isMdUp ? 6 : 4}
              style={{ textAlign: 'center', fontWeight: 'bold',
              backgroundColor: getRowColor(mainColumn) }}
            >
              סה"כ
            </td>
            <td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: getRowColor(mainColumn) }}>
              {filteredPayments.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()} ₪
            </td>
          </tr>
        </tfoot>
      </Table>

    </Box>
  );
}
