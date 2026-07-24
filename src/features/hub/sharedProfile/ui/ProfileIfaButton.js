// src/features/hub/sharedProfile/ui/ProfileIfaButton.js

import React from 'react'
import { Box, Button, Tooltip } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import ifaImage from '../../../../ui/core/images/ifaImage.png'
import { openProfileExternalLink } from '../logic/headerModel.shared.js'

export default function ProfileIfaButton({
  ifaLink,
  variant = 'soft',
}) {
  const tooltipTitle = ifaLink
    ? 'פתח באתר ההתאחדות'
    : 'אין קישור להתאחדות'

  return (
    <Tooltip title={tooltipTitle}>
      <span>
        <Button
          size="sm"
          variant={variant}
          color="neutral"
          disabled={!ifaLink}
          onClick={() => openProfileExternalLink(ifaLink)}
          startDecorator={
            <Box
              component="img"
              src={ifaImage}
              alt="התאחדות"
              sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                objectFit: 'contain',
              }}
            />
          }
          endDecorator={
            <OpenInNewIcon
              sx={{
                fontSize: 16,
              }}
            />
          }
          sx={{
            minHeight: 34,
            px: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 10,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          התאחדות
        </Button>
      </span>
    </Tooltip>
  )
}
