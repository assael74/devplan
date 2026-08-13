// features/hub/playerProfile/desktop/modules/info/components/PlayerPositionCard.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, Sheet, Snackbar, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { positionSx as sx } from './sx/position.sx.js'

import PlayerPositionFields from '../../../../../../../ui/forms/players/edit/PlayerPositionFields.js'

import {
  buildPlayerTargetsState,
} from '../../../../../../../shared/players/targets/index.js'

const emptyText = '—'

const getPositionsText = (positions = []) => {
  if (!Array.isArray(positions) || !positions.length) return 'לא נבחרו עמדות'
  return positions.join(' · ')
}

export default function PlayerPositionCard({
  player,
  team,
  draft,
  setDraft,
  pending,
}) {
  const [snack, setSnack] = useState(false)

  const livePlayer = useMemo(() => {
    return {
      ...(player || {}),
      ...(draft || {}),
    }
  }, [player, draft])

  const targets = useMemo(() => {
    return buildPlayerTargetsState({
      player: livePlayer,
      team: team || livePlayer?.team,
    })
  }, [livePlayer, team])

  const positionLabel =
    targets?.labels?.position ||
    targets?.position?.layerLabel ||
    targets?.position?.label ||
    emptyText

  const roleLabel =
    targets?.labels?.role ||
    targets?.role?.label ||
    emptyText

  return (
    <>
      <Sheet variant="outlined" sx={sx.card}>
        <Box sx={sx.headWrap}>
          <Box sx={sx.headSecondWrap}>
            <Box sx={sx.positionInfoItem}>
              <Typography level="body-xs" sx={sx.positionInfoLabel}>
                עמדות שנבחרו
              </Typography>

              <Typography level="title-sm" sx={sx.positionInfoValue} noWrap>
                {getPositionsText(draft?.positions)}
              </Typography>
            </Box>

            <Box sx={sx.positionInfoItem}>
              <Typography level="body-xs" sx={sx.positionInfoLabel}>
                שכבת יעד
              </Typography>

              <Typography level="title-sm" sx={sx.positionInfoValue} noWrap>
                {positionLabel}
              </Typography>
            </Box>

            <Box sx={sx.positionInfoItem}>
              <Typography level="body-xs" sx={sx.positionInfoLabel}>
                השפעה על יעדים
              </Typography>

              <Typography level="body-xs" sx={sx.positionInfoSub} noWrap>
                שינוי עמדה יעדכן את היעדים לפי שכבת עמדה ומעמד בסגל
              </Typography>
            </Box>
          </Box>

          <Box sx={sx.summaryChips}>
            <Chip
              size="sm"
              variant="soft"
              color={positionLabel === emptyText ? 'neutral' : 'primary'}
              startDecorator={iconUi({ id: 'position' })}
              sx={{ fontWeight: 700 }}
            >
              {positionLabel}
            </Chip>

            <Chip
              size="sm"
              variant="soft"
              color={roleLabel === emptyText ? 'neutral' : 'success'}
              startDecorator={iconUi({ id: 'player' })}
              sx={{ fontWeight: 700 }}
            >
              {roleLabel}
            </Chip>
          </Box>
        </Box>

        <Box sx={sx.positionGrid}>
          <PlayerPositionFields
            draft={draft}
            onDraft={setDraft}
            disabled={pending}
            onLimitReached={() => setSnack(true)}
          />
        </Box>
      </Sheet>

      <Snackbar
        open={snack}
        color="warning"
        variant="soft"
        autoHideDuration={2200}
        onClose={() => setSnack(false)}
      >
        ניתן לבחור עד 4 עמדות לשחקן.
      </Snackbar>
    </>
  )
}
