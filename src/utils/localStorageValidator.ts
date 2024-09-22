import { AppSettings } from '../types'

export const isLocalStorageValid = (value: any): value is AppSettings => {
  if (typeof value.conversations.channelId !== 'string') {
    return false
  }

  if (typeof value.conversations.searchMessage !== 'string') {
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

  return true
}
