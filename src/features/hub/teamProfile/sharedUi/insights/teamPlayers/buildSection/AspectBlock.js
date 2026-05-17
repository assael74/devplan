// teamProfile/sharedUi/insights/teamPlayers/buildSection/AspectBlock.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import RangeCardsGrid from '../shared/RangeCardsGrid.js'
import PositionCards from './PositionCards.js'
import AspectPlayers from './AspectPlayers.js'

import {
  Takeaway,
} from '../../../../../../../ui/patterns/insights/index.js'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { blockSx as sx } from './sx/block.sx'

import {
  buildAspectBlockModel,
  getPlayers,
} from './buildSection.ui.js'

export default function AspectBlock({
  id,
  title,
  icon,
  type,
  cards = {},
}) {
  const [selectedId, setSelectedId] = React.useState(null)
  const [positionMode, setPositionMode] = React.useState('primary')

  React.useEffect(() => {
    if (type === 'position') {
      setSelectedId(null)
    }
  }, [type, positionMode])

  const blockModel = React.useMemo(() => {
    return buildAspectBlockModel({
      id,
      type,
      cards,
      selectedId,
      onSelect: setSelectedId,
      positionMode,
    })
  }, [id, type, cards, selectedId, positionMode])

  const {
    status,
    selectedCard,
    selectedTakeaway,
    cards: viewCards,
  } = blockModel

  return (
    <Box sx={sx.buildAspect}>
      <Box sx={sx.buildAspectHead}>
        <Box sx={sx.buildAspectTitleWrap}>
          <Box sx={sx.buildAspectIcon}>
            {iconUi({ id: icon })}
          </Box>

          <Typography level="title-sm" sx={sx.buildAspectTitle}>
            {title}
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={status.color}
          sx={sx.buildAspectStatus}
        >
          {status.label}
        </Chip>
      </Box>

      <Box sx={sx.buildRows}>
        {type === 'position' ? (
          <PositionCards
            cards={viewCards}
            mode={positionMode}
            onModeChange={setPositionMode}
            selectedCard={selectedCard}
            selectedTakeaway={selectedTakeaway}
            renderDetails={() => (
              <AspectPlayers
                players={getPlayers(selectedCard)}
                card={selectedCard}
                type={type}
              />
            )}
          />
        ) : (
          <>
            <RangeCardsGrid cards={viewCards} />

            {selectedTakeaway ? (
              <Takeaway
                item={selectedTakeaway.item}
                details={selectedTakeaway.details}
                icon="keyPlayer"
                value="פירוט"
                withMenu={false}
                renderDetails={() => (
                  <AspectPlayers
                    players={getPlayers(selectedCard)}
                    card={selectedCard}
                    type={type}
                  />
                )}
              />
            ) : null}
          </>
        )}
      </Box>
    </Box>
  )
}
