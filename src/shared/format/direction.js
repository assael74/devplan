// src/shared/format/direction.js

export const LRM = '\u200E'

export const formatLtr = value => {
  return `${LRM}${value}`
}
