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
} from './app-settings.ts'

export type RawSlackConversations = RawSlackConversation[]

export type RawSlackConversation = {
  conversationsInfo?: ConversationsInfoResponse
  conversationsHistory?: ConversationsHistoryResponse
}

export type SlackConversations = SlackConversation[]

export type SlackConversation = {
  channelId?: string
  channelName?: string
  workspaceId?: string
  threadTs?: string
  threadText?: string
}
