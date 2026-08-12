// src/features/playersDatabase/ui/components/modals/paste/StatsImportModal.js

import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
  Tooltip,
  Typography,
} from '@mui/joy'

import {
  PLAYER_STATS_PLACEHOLDER,
  STATS_SEASON_STATUS_OPTIONS,
} from '../../../pages/teamPage/logic/teamPage.constants.js'
import PasteModal from './PasteModal.js'
import { statsImportModalSx as sx } from './sx/statsImportModal.sx.js'

function clean(value) {
  return String(value || '').trim()
}

function MetaLink({ href, children }) {
  const safeHref = clean(href)
  const missingLabel = children

  if (!safeHref) {
    return (
      <Typography component='span' level='body-sm' sx={sx.missingLink}>
        {missingLabel || 'לא הוגדר קישור למקור'}
      </Typography>
    )
  }

  return (
    <Tooltip title={safeHref} placement='top' arrow>
      <Typography
        component='a'
        href={safeHref}
        target='_blank'
        rel='noopener noreferrer'
        referrerPolicy='no-referrer'
        level='body-sm'
        dir='ltr'
        sx={sx.metaLink}
      >
        {children}
      </Typography>
    </Tooltip>
  )
}

export default function StatsImportModal({
  team,
  seasonKey,
  hasTeamPlayers,
  columns,
  source,
  controller,
}) {
  const teamUrl = clean(source.teamUrl || team.teamUrl)
  const leagueName = clean(source.leagueName || team.leagueName)
  const leagueUrl = clean(source.leagueUrl || team?.domain?.metadata?.seasonUrl)
  const hasPreviewRows = controller.rows.length > 0
  const seasonStatusOption = STATS_SEASON_STATUS_OPTIONS.find(option => (
    option.value === controller.seasonStatus
  ))

  const description = (
    <Box sx={sx.description}>
      <MetaLink href={teamUrl} missingLabel='לא הוגדר קישור לקבוצה'>
        {team.name || 'קבוצה'}
      </MetaLink>

      <Typography component='span' level='body-sm'>·</Typography>
      <MetaLink href={leagueUrl} missingLabel='לא הוגדר קישור לליגה'>
        {leagueName || 'ליגה'}
      </MetaLink>

      {seasonKey ? (
        <>
          <Typography component='span' level='body-sm'>·</Typography>
          <Typography component='span' level='body-sm'>
            עונה {seasonKey}
          </Typography>
        </>
      ) : null}

      {team.birthYear ? (
        <>
          <Typography component='span' level='body-sm'>·</Typography>
          <Typography component='span' level='body-sm'>
            שנתון {team.birthYear}
          </Typography>
        </>
      ) : null}
    </Box>
  )

  const beforePaste = (
    <FormControl
      size='sm'
      required
      sx={[
        sx.seasonStatus,
        hasPreviewRows ? sx.seasonStatusCompact : null,
      ]}
    >
      <FormLabel>סוג טעינת הסטטיסטיקה</FormLabel>
      <Select
        value={controller.seasonStatus || null}
        placeholder='בחר סוג טעינה'
        onChange={(event, value) => controller.changeSeasonStatus(value)}
      >
        {STATS_SEASON_STATUS_OPTIONS.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
      {!hasPreviewRows ? (
        <FormHelperText>
          {seasonStatusOption?.description || 'בחירה חובה לפני הצגת הנתונים'}
        </FormHelperText>
      ) : null}
    </FormControl>
  )

  return (
    <PasteModal
      open={controller.open}
      title={`טעינת סטטיסטיקות - ${team.name}`}
      description={description}
      iconId='addStats'
      columns={columns}
      rows={controller.rows}
      value={controller.pasteValue}
      placeholder={PLAYER_STATS_PLACEHOLDER}
      busy={controller.busy}
      disabled={!hasTeamPlayers || controller.hasInvalidRows || !controller.seasonStatus}
      confirmLabel='אישור טעינת סטטיסטיקות'
      beforePaste={beforePaste}
      pasteDisabled={!controller.seasonStatus}
      previewSummary={[
        {
          key: 'exceptions',
          color: controller.exceptionRowsCount ? 'warning' : 'neutral',
          label: `${controller.exceptionRowsCount} חריגים`,
        },
      ]}
      onValueChange={controller.setPasteValue}
      onPaste={controller.parse}
      onClear={controller.clearPaste}
      onCellChange={controller.changeCell}
      getRowStatus={controller.getRowStatus}
      onConfirm={controller.confirm}
      onClose={controller.close}
    />
  )
}
