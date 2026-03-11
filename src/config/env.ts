/** Environment variables (Vite exposes them via import.meta.env). */
export const env = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const
