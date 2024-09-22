export type AppSettings = {
  conversations: Conversations
  status?: {
    emoji: WorkStatus
    text: WorkStatus
  }
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

export type PunchInSettings = {
  changeStatusEmoji: boolean
  attendance: boolean
  additionalMessage: string
  punchIn?: 'start' | 'end'
}
