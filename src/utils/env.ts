const getEnvValue = (key: string): string => {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} not set`)
  }
  return value
}

const getOptionalEnvValue = (key: string, defaultValue = ''): string => {
  return import.meta.env[key] || defaultValue
}

const getNullableEnvValue = (key: string): string | undefined => {
  return import.meta.env[key]
}

const getBooleanEnvValue = (key: string, defaultValue = false): boolean => {
  const value = import.meta.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

const isDevMode = getBooleanEnvValue('VITE_DEV_MODE')

export const env = {
  SLACK_CLIENT_ID: isDevMode
    ? getOptionalEnvValue('VITE_SLACK_CLIENT_ID')
    : getEnvValue('VITE_SLACK_CLIENT_ID'),
  SLACK_CLIENT_SECRET: isDevMode
    ? getOptionalEnvValue('VITE_SLACK_CLIENT_SECRET')
    : getEnvValue('VITE_SLACK_CLIENT_SECRET'),
  SLACK_REDIRECT_URI: isDevMode
    ? getOptionalEnvValue('VITE_SLACK_REDIRECT_URI')
    : getEnvValue('VITE_SLACK_REDIRECT_URI'),
  USAGE_URL: getNullableEnvValue('VITE_USAGE_URL'),
  MAINTAINER_URL: getNullableEnvValue('VITE_MAINTAINER_URL'),
  DEV_MODE: isDevMode,
} as const
