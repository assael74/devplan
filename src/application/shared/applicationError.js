// src/application/shared/applicationError.js

export class ApplicationError extends Error {
  constructor(message, { code = 'APPLICATION_ERROR', cause = null, meta = null } = {}) {
    super(message)
    this.name = 'ApplicationError'
    this.code = code
    this.cause = cause
    this.meta = meta
  }
}
