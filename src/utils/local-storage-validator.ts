import { AppSettings } from '../types'

// biome-ignore lint/suspicious/noExplicitAny: any is used to validate the type of localStorage value
export const isLocalStorageValid = (value: any): value is AppSettings => {
  if (typeof value.conversations !== 'object') {
    return false
  }

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
