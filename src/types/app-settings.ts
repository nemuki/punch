export type AppSettings = {
  conversations: Conversations
  status: StatusEmojiSetting
}

export type Conversations = Conversation[]

export type Conversation = {
  id: string
  channelId: string
  searchMessage: string
}

export type StatusEmojiSetting = {
  emoji: WorkStatus
  text: WorkStatus
}

export type WorkStatus = {
  office: string
  telework: string
  leave: string
}

export type PunchInSettings = {
  changeStatusEmoji: boolean
  inOffice: boolean
  additionalMessage: string
  punchIn?: 'start' | 'end'
}
