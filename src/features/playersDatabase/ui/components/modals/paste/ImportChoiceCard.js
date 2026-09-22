import {
  Box,
  Radio,
  Typography,
} from '@mui/joy'

import { importChoiceCardSx as sx } from './sx/importChoiceCard.sx.js'

export default function ImportChoiceCard({
  value,
  label,
  description,
  image,
  selected = false,
  disabled = false,
  disabledHint = '',
  size = 'regular',
  descriptionLevel = 'body-xs',
  radioSx,
  cardSx,
}) {
  return (
    <Box
      component='label'
      sx={[
        sx.card,
        sx.cardSize[size] || sx.cardSize.regular,
        selected ? sx.cardSelected : null,
        disabled ? sx.cardDisabled : null,
        cardSx,
      ]}
    >
      <Box sx={sx.cardHeader}>
        <Box sx={sx.cardCopy}>
          <Radio
            value={value}
            disabled={disabled}
            label={label}
            sx={[sx.radio, radioSx]}
          />
          {description ? (
            <Typography level={descriptionLevel} sx={sx.description}>
              {description}
            </Typography>
          ) : null}
        </Box>

        {image ? (
          <Box
            component='img'
            src={image}
            alt=''
            sx={[sx.image, sx.imageSize[size] || sx.imageSize.regular]}
          />
        ) : null}
      </Box>

      {disabledHint ? (
        <Typography level='body-xs' sx={sx.disabledHint}>
          {disabledHint}
        </Typography>
      ) : null}
    </Box>
  )
}
