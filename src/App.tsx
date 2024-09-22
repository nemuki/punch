import { Button, Grid, Group, Loader, Stack, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { readLocalStorageValue, useLocalStorage } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  ConversationsHistoryResponse,
  ConversationsInfoResponse,
} from '@slack/web-api'
import { useEffect, useMemo, useState } from 'react'
import {
  AuthError,
  LocalStorageError,
  PunchInForm,
  SlackChannelAndConversation,
  SlackConversationSetting,
  SlackEmojiSetting,
} from './components'
import { useAuth } from './hooks/useAuth.tsx'
import {
  chatPostMessage,
  fetchConversationsHistory,
  fetchConversationsInfo,
} from './infra/slackApi.ts'
import {
  AppSettings,
  Conversations,
  PunchInSettings,
  StatusEmojiSettings,
} from './types'
import { applicationConstants, isLocalStorageValid } from './utils'

function App() {
  const { authIsLoading, authErrorMessage, slackOauthToken } = useAuth()

  // State
  const [hasLocalStorageError, setHasLocalStorageError] = useState(false)
  const [conversationsHistory, setConversationsHistory] = useState<
    ConversationsHistoryResponse | undefined
  >(undefined)
  const [conversationsInfo, setConversationsInfo] = useState<
    ConversationsInfoResponse | undefined
  >(undefined)
  const [
    localStorageAppSettings,
    setLocalStorageAppSettings,
    removeLocalStorageAppSettings,
  ] = useLocalStorage<AppSettings>({
    key: 'appSettings',
    defaultValue: readLocalStorageValue<AppSettings>({
      key: 'appSettings',
      defaultValue: applicationConstants.defaultAppSettings,
    }),
  })

  // form
  const conversationSettingForm = useForm<Conversations>({
    mode: 'uncontrolled',
    initialValues: localStorageAppSettings.conversations,
  })
  const statusEmojiSettingsForm = useForm<StatusEmojiSettings>({
    mode: 'uncontrolled',
    initialValues: localStorageAppSettings.status,
  })
  const punchInForm = useForm<PunchInSettings>({
    mode: 'controlled',
    initialValues: {
      changeStatusEmoji: false,
      attendance: false,
      additionalMessage: '',
      punchIn: undefined,
    },
  })

  const filteredConversations = useMemo(() => {
    return conversationsHistory?.messages
      ?.filter((message) => message.type === 'message')
      .filter((message) =>
        message?.text?.includes(
          conversationSettingForm.getValues().searchMessage,
        ),
      )[0]
  }, [conversationsHistory])

  const getConversationsHistory = async (channelId: string) => {
    if (slackOauthToken.accessToken) {
      try {
        const response = await fetchConversationsHistory(
          slackOauthToken.accessToken,
          channelId,
        )

        if (!response.ok) {
          console.error(response.error)
        }

        setConversationsHistory(response)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const getConversationsInfo = async (channelId: string) => {
    if (slackOauthToken.accessToken) {
      try {
        const response = await fetchConversationsInfo(
          slackOauthToken.accessToken,
          channelId,
        )

        if (!response.ok) {
          console.error(response.error)
        }

        setConversationsInfo(response)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const getConversations = (values: typeof conversationSettingForm.values) => {
    getConversationsInfo(values.channelId)

    if (values.searchMessage) {
      getConversationsHistory(values.channelId)
    }
  }

  const postMessage = async (channelId: string, message: string) => {
    if (slackOauthToken.accessToken) {
      try {
        const response = await chatPostMessage(
          slackOauthToken.accessToken,
          channelId,
          message,
          filteredConversations?.ts,
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

  const getWorkStatus = (attendance: boolean): string =>
    attendance ? '業務' : 'テレワーク'

  const createPunchInStartMessage = (values: PunchInSettings) => {
    const baseMessage = getWorkStatus(values.attendance)
    return `${baseMessage}開始します\n${values.additionalMessage}`
  }

  const createPunchInEndMessage = (values: PunchInSettings) => {
    const baseMessage = getWorkStatus(values.attendance)
    return `${baseMessage}終了します\n${values.additionalMessage}`
  }

  const handleSubmitconversationSettingForm = (
    values: typeof conversationSettingForm.values,
  ) => {
    getConversations(values)

    setLocalStorageAppSettings((prev) => ({
      ...prev,
      conversations: values,
    }))
  }

  const handleSubmitStatusEmojiSettingsForm = (
    values: typeof statusEmojiSettingsForm.values,
  ) => {
    setLocalStorageAppSettings((prev) => ({
      ...prev,
      status: values,
    }))
  }

  /**
   * 出勤時の関数
   *
   * ステータス絵文字を変更する場合は、絵文字を変更する
   * メッセージを追加する場合は、メッセージを追加する
   * chatPostMessageを呼び出す
   */
  const handlePunchIn = (values: typeof punchInForm.values) => {
    if (values.punchIn === undefined) {
      return
    }

    const channelId = localStorageAppSettings.conversations.channelId

    if (values.punchIn === 'start') {
      // 出社時の処理
      if (values.changeStatusEmoji) {
        // ステータス絵文字を変更する
      }

      // postMessageを呼び出す
      postMessage(channelId, createPunchInStartMessage(values))
    } else if (values.punchIn === 'end') {
      // 退勤時の処理
      if (values.changeStatusEmoji) {
        // ステータス絵文字を変更する
      }

      // postMessageを呼び出す
      postMessage(channelId, createPunchInEndMessage(values))
    }
  }

  /**
   * 初回アクセス時の処理
   */
  useEffect(() => {
    if (conversationSettingForm.values.channelId) {
      getConversations(conversationSettingForm.values)
    }

    if (!isLocalStorageValid(localStorageAppSettings)) {
      setHasLocalStorageError(true)
    }
  }, [])

  // Render
  if (hasLocalStorageError) {
    return (
      <LocalStorageError
        localStorageAppSettings={localStorageAppSettings}
        removeLocalStorageAppSettings={removeLocalStorageAppSettings}
      />
    )
  }

  if (Object.keys(slackOauthToken).length === 0) {
    return (
      <>
        <Button
          component={'a'}
          href={applicationConstants.slackOauthAuthorizeUrl}
        >
          Login with Slack
        </Button>
      </>
    )
  }

  if (authErrorMessage) {
    return <AuthError message={authErrorMessage} />
  }

  if (authIsLoading) {
    return (
      <Group>
        <Loader />
        <Text>Authenticating...</Text>
      </Group>
    )
  }

  return (
    <>
      <Grid>
        <Grid.Col span={6}>
          <Stack>
            <SlackChannelAndConversation
              channelName={conversationsInfo?.channel?.name}
              conversations={filteredConversations}
            />
            <SlackConversationSetting
              conversationSettingForm={conversationSettingForm}
              handleSubmit={handleSubmitconversationSettingForm}
            />
            <SlackEmojiSetting
              statusEmojiSettingsForm={statusEmojiSettingsForm}
              handleSubmit={handleSubmitStatusEmojiSettingsForm}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={6}>
          <PunchInForm
            punchInForm={punchInForm}
            handlePunchIn={handlePunchIn}
            getWorkStatus={getWorkStatus}
          />
        </Grid.Col>
      </Grid>
    </>
  )
}

export default App
