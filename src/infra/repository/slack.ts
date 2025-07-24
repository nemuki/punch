import { notifications } from '@mantine/notifications'
import {
  ConversationsHistoryResponse,
  ConversationsInfoResponse,
} from '@slack/web-api'
import { Conversations } from '../../types/app-settings.ts'
import { RawSlackConversations, SlackConversations } from '../../types/index.ts'
import { env } from '../../utils'
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
  // 開発モードの場合はモックデータを返す
  if (env.DEV_MODE) {
    return args.conversations.map((conversation) => ({
      id: conversation.id,
      conversationsInfo: {
        ok: true,
        channel: {
          id: conversation.channelId,
          name: `dev-channel-${conversation.id}`,
          context_team_id: 'dev-team-id',
        },
      },
      conversationsHistory: {
        ok: true,
        messages: [
          {
            type: 'message',
            text: conversation.searchMessage || 'デモメッセージ',
            ts: '1234567890.123456',
          },
        ],
      },
    }))
  }

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
  // 開発モードの場合はメッセージをコンソールに出力
  if (env.DEV_MODE) {
    console.log('開発モード: メッセージ送信をシミュレート')
    args.conversations.forEach((conversation) => {
      console.log(
        `チャンネル: ${conversation.channelName || conversation.channelId}`,
      )
      console.log(`メッセージ: ${args.message}`)
      if (conversation.threadTs) {
        console.log(`スレッド: ${conversation.threadTs}`)
      }

      notifications.show({
        title: `${conversation.channelName || 'Dev Channel'} メッセージ送信完了 (開発モード)`,
        message: args.message,
        color: 'blue',
        position: 'top-right',
      })
    })
    return
  }

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
  // 開発モードの場合はステータス更新をシミュレート
  if (env.DEV_MODE) {
    console.log('開発モード: ステータス絵文字更新をシミュレート')
    console.log(`絵文字: ${args.statusEmoji}`)
    console.log(`テキスト: ${args.statusText}`)
    console.log(
      `有効期限: ${new Date(args.statusExpiration * 1000).toLocaleString()}`,
    )

    notifications.show({
      title: 'ステータス更新完了 (開発モード)',
      message: `${args.statusEmoji} ${args.statusText}`,
      color: 'blue',
      position: 'top-right',
    })
    return
  }

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
