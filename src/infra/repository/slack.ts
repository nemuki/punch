import { notifications } from '@mantine/notifications'
import {
  ConversationsHistoryResponse,
  ConversationsInfoResponse,
} from '@slack/web-api'
import {
  chatPostMessage,
  fetchConversationsHistory,
  fetchConversationsInfo,
  updateStatusEmoji,
} from '../api/slack.ts'

export const getConversations = async (args: {
  channelId: string
  accessToken?: string
  searchMessage?: string
}): Promise<{
  conversationsInfo?: ConversationsInfoResponse
  conversationsHistory?: ConversationsHistoryResponse
}> => {
  const conversationsInfo = await getConversationsInfo({
    channelId: args.channelId,
    accessToken: args.accessToken,
  })

  if (!args.searchMessage) {
    return {
      conversationsInfo: conversationsInfo,
      conversationsHistory: undefined,
    }
  }

  const conversationsHistory = await getConversationsHistory({
    channelId: args.channelId,
    accessToken: args.accessToken,
  })

  return {
    conversationsInfo: conversationsInfo,
    conversationsHistory: conversationsHistory,
  }
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

export const postMessage = async (args: {
  channelId: string
  message: string
  threadTs?: string
  accessToken?: string
}) => {
  if (args.accessToken) {
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
          title: 'メッセージ送信完了',
          message: args.message,
          color: 'teal',
        })
      } else {
        console.error(response)
        notifications.show({
          title: 'メッセージ送信エラー',
          message: 'Slack メッセージ送信時にエラーが発生しました',
          color: 'red',
        })
      }
    } catch (error) {
      console.error(error)
      notifications.show({
        title: 'メッセージ送信エラー',
        message: 'Slack メッセージ送信時にエラーが発生しました',
        color: 'red',
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
