import {
  ConversationsHistoryResponse,
  ConversationsInfoResponse,
} from '@slack/web-api'

export type {
  AppSettings,
  Conversation,
  Conversations,
  WorkStatus,
  PunchInSettings,
  StatusEmojiSetting,
  MessageTemplates,
  WorkTypes,
  Actions,
} from './app-settings.ts'

export type RawSlackConversations = RawSlackConversation[]

export type RawSlackConversation = {
  id: string
  conversationsInfo?: ConversationsInfoResponse
  conversationsHistory?: ConversationsHistoryResponse
}

export type SlackConversations = SlackConversation[]

export type SlackConversation = {
  id: string
  channelId?: string
  channelName?: string
  workspaceId?: string
  threadTs?: string
  threadText?: string
}
