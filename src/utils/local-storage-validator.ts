import { AppSettings } from '../types'
import { applicationConstants } from './constant'

export type LocalStorageValidationResult =
  | { isValid: true }
  | {
      isValid: false
      reason: 'missing-version' | 'version-mismatch' | 'invalid-structure'
      // biome-ignore lint/suspicious/noExplicitAny: any is used to store unknown localStorage content for debugging
      currentData: any
      expectedVersion: number
      actualVersion?: number
    }

export const validateLocalStorage = (
  // biome-ignore lint/suspicious/noExplicitAny: any is used to validate the type of localStorage value
  value: any,
): LocalStorageValidationResult => {
  const expectedVersion = applicationConstants.defaultAppSettings.version

  // Check if version exists
  if (typeof value.version !== 'number') {
    return {
      isValid: false,
      reason: 'missing-version',
      currentData: value,
      expectedVersion,
    }
  }

  // Check version match
  if (value.version !== expectedVersion) {
    return {
      isValid: false,
      reason: 'version-mismatch',
      currentData: value,
      expectedVersion,
      actualVersion: value.version,
    }
  }

  // Check structure validity
  if (!isStructureValid(value)) {
    return {
      isValid: false,
      reason: 'invalid-structure',
      currentData: value,
      expectedVersion,
      actualVersion: value.version,
    }
  }

  return { isValid: true }
}

// biome-ignore lint/suspicious/noExplicitAny: any is used to validate the type of localStorage value
const isStructureValid = (value: any): value is AppSettings => {
  if (!Array.isArray(value.conversations)) {
    return false
  }

  if (typeof value.status?.emoji?.office !== 'string') {
    return false
  }

  if (typeof value.status?.emoji?.telework !== 'string') {
    return false
  }

  if (typeof value.status?.emoji?.leave !== 'string') {
    return false
  }

  if (typeof value.status?.text?.office !== 'string') {
    return false
  }

  if (typeof value.status?.text?.telework !== 'string') {
    return false
  }

  if (typeof value.status?.text?.leave !== 'string') {
    return false
  }

  return true
}

// Keep the old function for backward compatibility
// biome-ignore lint/suspicious/noExplicitAny: any is used to validate the type of localStorage value
export const isLocalStorageValid = (value: any): value is AppSettings => {
  const result = validateLocalStorage(value)
  return result.isValid
}
