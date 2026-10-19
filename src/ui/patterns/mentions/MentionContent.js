// src/ui/patterns/mentions/MentionContent.js

import * as React from 'react'
import { Link } from '@mui/joy'
import { normalizeMentionContent } from './mentionContent.model.js'

export default function MentionContent({ value }) {
  return normalizeMentionContent(value).map((part, index) => (
    part.type === 'mention' ? (
      part.href ? (
        <Link key={index} href={part.href} target='_blank' rel='noopener noreferrer'>
          {part.label}
        </Link>
      ) : <strong key={index}>{part.label}</strong>
    ) : <React.Fragment key={index}>{part.text}</React.Fragment>
  ))
}
