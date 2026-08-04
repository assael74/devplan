// src/ui/fields/parents/EmailField.js

import * as React from 'react'

import { iconUi } from '../../core/icons/iconUi.js'
import EmailField from '../core/EmailField.js'

export default function ParentEmailField({
  variant = 'outlined',
  startDecorator = iconUi({ id: 'email' }),
  ...props
}) {
  return (
    <EmailField
      {...props}
      variant={variant}
      startDecorator={startDecorator}
    />
  )
}
