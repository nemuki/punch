import { notifications } from '@mantine/notifications'
import {
  ConversationsHistoryResponse,
  ConversationsInfoResponse,
} from '@slack/web-api'
import { Conversations } from '../../types/app-settings.ts'
import { RawSlackConversations, SlackConversations } from '../../types/index.ts'
import {
  chatPostMessage,
  fetchConversationsHistory,
  fetchConversationsInfo,
  updateStatusEmoji,
} from '../api/slack.ts'

export const getConversations = async (args: {
  conversations: Conversations
  accessToken?: string
}): Promise<RawSlackConversations> => {
  const results = await Promise.all(
    args.conversations.map(async (conversation) => {
      const conversationsInfo = await getConversationsInfo({
        channelId: conversation.channelId,
        accessToken: args.accessToken,
      })

      const conversationsHistory = await getConversationsHistory({
        channelId: conversation.channelId,
        accessToken: args.accessToken,
      })

      return { id: conversation.id, conversationsInfo, conversationsHistory }
    }),
  )

  return results
}

const getConversationsHistory = async (args: {
  channelId: string
  accessToken?: string
}): Promise<ConversationsHistoryResponse | undefined> => {
  if (args.accessToken) {
    try {
      const response = await fetchConversationsHistory({
        channelId: args.channelId,
        accessToken: args.accessToken,
      })

      if (!response.ok) {
        console.error(response.error)
      }

      return response
    } catch (error) {
      console.error(error)
    }
  }
}

const getConversationsInfo = async (args: {
  channelId: string
  accessToken?: string
}): Promise<ConversationsInfoResponse | undefined> => {
  if (args.accessToken) {
    try {
      const response = await fetchConversationsInfo({
        channelId: args.channelId,
        accessToken: args.accessToken,
      })

      if (!response.ok) {
        console.error(response.error)
      }

      return response
    } catch (error) {
      console.error(error)
    }
  }
}

export const postMessages = async (args: {
  conversations: SlackConversations
  message: string
  accessToken?: string
}) => {
  if (args.accessToken) {
    args.conversations.forEach((conversation) => {
      if (!conversation.channelId) {
        return
      }

      postMessage({
        channelId: conversation.channelId,
        channelName: conversation.channelName,
        message: args.message,
        threadTs: conversation.threadTs,
        accessToken: args.accessToken,
      })
    })
  }
}

const postMessage = async (args: {
  channelId: string
  channelName?: string
  message: string
  threadTs?: string
  accessToken?: string
}) => {
  if (args.accessToken) {
    const position = 'top-right'

    try {
      const response = await chatPostMessage({
        accessToken: args.accessToken,
        channelId: args.channelId,
        message: args.message,
        threadTs: args.threadTs,
      })

      if (response.ok) {
        console.info(response)
        notifications.show({
          title: `${args.channelName} メッセージ送信完了`,
          message: args.message,
          color: 'teal',
          position,
        })
      } else {
        console.error(response)
        notifications.show({
          title: `${args.channelName} メッセージ送信エラー`,
          message: 'Slack メッセージ送信時にエラーが発生しました',
          color: 'red',
          position,
        })
      }
    } catch (error) {
      console.error(error)
      notifications.show({
        title: `${args.channelName} メッセージ送信エラー`,
        message: 'Slack メッセージ送信時にエラーが発生しました',
        color: 'red',
        position,
      })
    }
  }
}

export const updateEmoji = async (args: {
  statusEmoji: string
  statusText: string
  statusExpiration: number
  accessToken?: string
}) => {
  if (args.accessToken) {
    try {
      await updateStatusEmoji({
        statusEmoji: args.statusEmoji,
        statusText: args.statusText,
        statusExpiration: args.statusExpiration,
        accessToken: args.accessToken,
      })
    } catch (error) {
      console.error(error)
    }
  }
}
