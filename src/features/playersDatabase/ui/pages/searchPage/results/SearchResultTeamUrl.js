// features/playersDatabase/ui/pages/searchPage/results/SearchResultTeamUrl.js

import {
  Box,
  Button,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { searchResultTeamUrlSx as sx } from './sx/searchResultTeamUrl.sx.js'

const clean = value => String(value || '').trim()

export default function SearchResultTeamUrl({ row, onEdit }) {
  const teamUrl = clean(row?.teamUrl || row?.metadata?.teamUrl)

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.titleWrap}>
          <Box sx={sx.icon}>
            {iconUi({
              id: 'link',
              size: 'sm',
            })}
          </Box>
          <Typography level='title-sm' sx={sx.title}>
            קישור קבוצה
          </Typography>
        </Box>

        <Button
          size='sm'
          variant='plain'
          startDecorator={iconUi({
            id: 'edit',
            size: 'sm',
          })}
          onClick={() => onEdit?.(row)}
          sx={sx.editButton}
        >
          עריכה
        </Button>
      </Box>

      {teamUrl ? (
        <Typography
          component='a'
          href={teamUrl}
          target='_blank'
          rel='noreferrer'
          level='body-sm'
          sx={sx.url}
        >
          {teamUrl}
        </Typography>
      ) : (
        <Typography level='body-sm' sx={sx.empty}>
          לא הוגדר קישור לקבוצה בעונה זו.
        </Typography>
      )}
    </Box>
  )
}
