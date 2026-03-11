/** Canonical error shape returned by the backend (ack errors, Socket error events). */
export interface AppError {
  code: string
  message: string
}
