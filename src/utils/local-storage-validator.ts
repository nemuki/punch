import { AppSettings } from '../types'

// biome-ignore lint/suspicious/noExplicitAny: any is used to validate the type of localStorage value
export const isLocalStorageValid = (value: any): value is AppSettings => {
  if (!Array.isArray(value.conversations)) {
    return false
  }

  if (typeof value.status.emoji.office !== 'string') {
    return false
  }

  if (typeof value.status.emoji.telework !== 'string') {
    return false
  }

  if (typeof value.status.emoji.leave !== 'string') {
    return false
  }

  if (typeof value.status.text.office !== 'string') {
    return false
  }

  if (typeof value.status.text.telework !== 'string') {
    return false
  }

  if (typeof value.status.text.leave !== 'string') {
    return false
  }

  // Validate message templates (with fallback for backward compatibility)
  if (value.messages) {
    if (typeof value.messages.workTypes?.office !== 'string') {
      return false
    }

    if (typeof value.messages.workTypes?.telework !== 'string') {
      return false
    }

    // Support both old flat structure and new nested structure
    if (value.messages.actions?.office && value.messages.actions?.telework) {
      // New nested structure
      if (typeof value.messages.actions.office.start !== 'string') {
        return false
      }
      if (typeof value.messages.actions.office.end !== 'string') {
        return false
      }
      if (typeof value.messages.actions.telework.start !== 'string') {
        return false
      }
      if (typeof value.messages.actions.telework.end !== 'string') {
        return false
      }
    } else if (value.messages.actions?.start && value.messages.actions?.end) {
      // Old flat structure - migrate it
      const oldActions = value.messages.actions
      value.messages.actions = {
        office: {
          start: oldActions.start,
          end: oldActions.end,
        },
        telework: {
          start: oldActions.start,
          end: oldActions.end,
        },
      }
    } else {
      return false
    }
  }

  return true
}
