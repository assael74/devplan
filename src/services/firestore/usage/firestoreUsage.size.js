// src/services/firestore/usage/firestoreUsage.size.js

export function estimatePayloadBytes(value) {
  try {
    return new Blob([JSON.stringify(value || null)]).size
  } catch {
    return 0
  }
}

export function bytesToKb(bytes) {
  return Number((Number(bytes || 0) / 1024).toFixed(2))
}

export function estimatePayloadKb(value) {
  return bytesToKb(estimatePayloadBytes(value))
}
