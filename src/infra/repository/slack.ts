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

export const getConversations = async (
  channelId: string,
  setConversationsHistory: (value: ConversationsHistoryResponse) => void,
  setConversationsInfo: (value: ConversationsInfoResponse) => void,
  accessToken?: string,
  searchMessage?: string,
) => {
  const conversationsInfo = await getConversationsInfo(channelId, accessToken)

  if (conversationsInfo) {
    setConversationsInfo(conversationsInfo)
  }

  if (searchMessage) {
    const conversationsHistory = await getConversationsHistory(
      channelId,
      accessToken,
    )

    if (conversationsHistory) {
      setConversationsHistory(conversationsHistory)
    }
  }
}

const getConversationsHistory = async (
  channelId: string,
  accessToken?: string,
): Promise<ConversationsHistoryResponse | undefined> => {
  if (accessToken) {
    try {
      const response = await fetchConversationsHistory(accessToken, channelId)

      if (!response.ok) {
        console.error(response.error)
      }

      return response
    } catch (error) {
      console.error(error)
    }
  }
}

const getConversationsInfo = async (
  channelId: string,
  accessToken?: string,
): Promise<ConversationsInfoResponse | undefined> => {
  if (accessToken) {
    try {
      const response = await fetchConversationsInfo(accessToken, channelId)

      if (!response.ok) {
        console.error(response.error)
      }

      return response
    } catch (error) {
      console.error(error)
    }
  }
}

export const postMessage = async (
  channelId: string,
  message: string,
  threadTs?: string,
  accessToken?: string,
) => {
  if (accessToken) {
    try {
      const response = await chatPostMessage(
        accessToken,
        channelId,
        message,
        threadTs,
      )

      if (response.ok) {
        console.info(response)
        notifications.show({
          title: 'メッセージ送信完了',
          message: message,
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

export const updateEmoji = async (
  statusEmoji: string,
  statusText: string,
  statusExpiration: number,
  accessToken?: string,
) => {
  if (accessToken) {
    try {
      await updateStatusEmoji(
        accessToken,
        statusEmoji,
        statusText,
        statusExpiration,
      )
    } catch (error) {
      console.error(error)
    }
  }
}
