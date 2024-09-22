export type AppSettings = {
  conversations: Conversations
  status?: StatusEmojiSettings
}

export type Conversations = {
  channelId: string
  searchMessage: string
}

export type WorkStatus = {
  office?: string
  telework?: string
  leave?: string
}

export type StatusEmojiSettings = {
  emoji: WorkStatus
  text: WorkStatus
}

export type PunchInSettings = {
  changeStatusEmoji: boolean
  attendance: boolean
  additionalMessage: string
  punchIn?: 'start' | 'end'
}
