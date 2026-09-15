import {
  Box,
  Button,
  Chip,
  Divider,
  Input,
  Stack,
  Typography,
} from '@mui/joy'

import PageSidePanel from '../../../components/page/PageSidePanel.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { clubsPageSx as sx } from '../sx/clubsPage.sx.js'

export default function ClubsFilters({ model }) {
  return (
    <PageSidePanel scrollable>
      <Box sx={sx.sideSection}>
        <Typography level='title-sm' sx={sx.sideTitle}>סינון מועדונים</Typography>
        <Typography level='body-xs' sx={sx.sideSubtitle}>
          הסינון חל על רשימת המועדונים בעונה הנוכחית.
        </Typography>
      </Box>
      <Divider />
      <Stack spacing={1.15}>
        <Box sx={sx.sideSection}>
          <Typography level='body-xs' sx={sx.filterLabel}>חיפוש</Typography>
          <Input
            size='sm'
            value={model.query}
            onChange={event => model.setQuery(event.target.value)}
            placeholder='מועדון או ליגה'
            startDecorator={iconUi({ id: 'search', size: 'sm' })}
            sx={sx.filterControl}
          />
        </Box>
        <Divider />
        <Box sx={sx.sideSection}>
          <Typography level='body-xs' sx={sx.filterLabel}>רמת מועדון</Typography>
          <Stack direction='row' sx={sx.filterChipGroup}>
            {model.clubLevelOptions.map(option => {
              const selected = model.clubLevels.includes(option.value)

              return (
                <Chip
                  key={option.value}
                  size='sm'
                  variant={selected ? 'solid' : 'outlined'}
                  color={selected ? 'primary' : 'neutral'}
                  sx={sx.clubLevelFilterChip}
                  aria-label={`רמת מועדון ${option.label}`}
                  aria-pressed={selected}
                  onClick={() => model.toggleClubLevel(option.value)}
                >
                  {option.label}
                </Chip>
              )
            })}
          </Stack>
        </Box>
        <Divider />
        <Box sx={sx.sideSection}>
          <Typography level='body-xs' sx={sx.filterLabel}>מסלול ליגה עתידי</Typography>
          <Stack spacing={0.55}>
            <Chip
              size='sm'
              variant={model.leaguePathDirections.includes('down') ? 'solid' : 'outlined'}
              color={model.leaguePathDirections.includes('down') ? 'primary' : 'neutral'}
              startDecorator={iconUi({ id: 'leagueDownPathDirection', size: 'sm' })}
              sx={sx.leaguePathFilterChip}
              aria-pressed={model.leaguePathDirections.includes('down')}
              onClick={() => model.toggleLeaguePathDirection('down')}
            >
              איתור ירידה צפויה ברמת הליגה
            </Chip>
            <Chip
              size='sm'
              variant={model.leaguePathDirections.includes('up') ? 'solid' : 'outlined'}
              color={model.leaguePathDirections.includes('up') ? 'primary' : 'neutral'}
              startDecorator={iconUi({ id: 'leagueUpPathDirection', size: 'sm' })}
              sx={sx.leaguePathFilterChip}
              aria-pressed={model.leaguePathDirections.includes('up')}
              onClick={() => model.toggleLeaguePathDirection('up')}
            >
              איתור עלייה צפויה ברמת הליגה
            </Chip>
          </Stack>
        </Box>
        <Divider />
        <Box sx={sx.sideSection}>
          <Typography level='body-xs' sx={sx.filterLabel}>יחס רמת ליגה למועדון</Typography>
          <Stack spacing={0.55}>
            <Chip
              size='sm'
              variant={model.leagueLevelDirections.includes('below') ? 'solid' : 'outlined'}
              color={model.leagueLevelDirections.includes('below') ? 'primary' : 'neutral'}
              startDecorator={iconUi({ id: 'leagueDownPathDirection', size: 'sm' })}
              sx={sx.leaguePathFilterChip}
              aria-pressed={model.leagueLevelDirections.includes('below')}
              onClick={() => model.toggleLeagueLevelDirection('below')}
            >
              רמת ליגה מתחת לרמת מועדון
            </Chip>
            <Chip
              size='sm'
              variant={model.leagueLevelDirections.includes('above') ? 'solid' : 'outlined'}
              color={model.leagueLevelDirections.includes('above') ? 'primary' : 'neutral'}
              startDecorator={iconUi({ id: 'leagueUpPathDirection', size: 'sm' })}
              sx={sx.leaguePathFilterChip}
              aria-pressed={model.leagueLevelDirections.includes('above')}
              onClick={() => model.toggleLeagueLevelDirection('above')}
            >
              רמת ליגה מעל לרמת מועדון
            </Chip>
          </Stack>
        </Box>
      </Stack>
      <Divider />
      <Button variant='outlined' size='sm' onClick={model.resetFilters} sx={sx.resetButton}>
        איפוס סינון
      </Button>
    </PageSidePanel>
  )
}
