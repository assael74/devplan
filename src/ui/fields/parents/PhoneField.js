// src/ui/fields/parents/PhoneField.js

import * as React from 'react'

import PhoneField from '../core/PhoneField.js'

export default function ParentPhoneField({
  variant = 'outlined',
  ...props
}) {
  return <PhoneField {...props} variant={variant} />
}
