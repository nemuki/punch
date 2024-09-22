export type AppSettings = {
  conversations: Conversation
  status: StatusEmojiSetting
}

export type Conversation = {
  channelId: string
  searchMessage: string
}

export type WorkStatus = {
  office: string
  telework: string
  leave: string
}

export type StatusEmojiSetting = {
  emoji: WorkStatus
  text: WorkStatus
}

export type PunchInSettings = {
  changeStatusEmoji: boolean
  inOffice: boolean
  additionalMessage: string
  punchIn?: 'start' | 'end'
}
