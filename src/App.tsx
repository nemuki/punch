import { Button, Grid, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { readLocalStorageValue, useLocalStorage } from '@mantine/hooks'
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
  SlackSettings,
} from './components'
import { useAuth } from './hooks/useAuth.tsx'
import {
  getConversations,
  postMessage,
  updateEmoji,
} from './infra/repository/slack.ts'
import {
  AppSettings,
  Conversations,
  PunchInSettings,
  StatusEmojiSettings,
} from './types'
import { applicationConstants, isLocalStorageValid } from './utils'

function App() {
  const { authErrorMessage, slackOauthToken } = useAuth()

  // State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hasLocalStorageError, setHasLocalStorageError] = useState(false)
  const [isConversationsFetching, setIsConversationsFetching] = useState(true)
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

  const handleSubmitConversationSettingForm = (
    values: typeof conversationSettingForm.values,
  ) => {
    getConversations(
      values.channelId,
      setConversationsHistory,
      setConversationsInfo,
      slackOauthToken.accessToken,
      values.searchMessage,
    )

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

    const nineHoursLater = new Date()
    nineHoursLater.setHours(nineHoursLater.getHours() + 9)
    const nineHoursLaterUnixTime = Math.floor(nineHoursLater.getTime() / 1000)

    const midnight = new Date()
    midnight.setDate(midnight.getDate() + 1)
    midnight.setHours(0, 0, 0, 0)
    const midnightUnixTime = Math.floor(midnight.getTime() / 1000)

    if (values.punchIn === 'start') {
      // 出社時の処理
      if (values.changeStatusEmoji) {
        // ステータス絵文字を変更する
        if (values.attendance) {
          updateEmoji(
            localStorageAppSettings.status.emoji.office,
            localStorageAppSettings.status.text.office,
            nineHoursLaterUnixTime,
            slackOauthToken.accessToken,
          )
        } else {
          updateEmoji(
            localStorageAppSettings.status.emoji.telework,
            localStorageAppSettings.status.text.telework,
            nineHoursLaterUnixTime,
            slackOauthToken.accessToken,
          )
        }
      }

      postMessage(
        channelId,
        createPunchInStartMessage(values),
        filteredConversations?.ts,
        slackOauthToken.accessToken,
      )
    } else if (values.punchIn === 'end') {
      // 退勤時の処理
      if (values.changeStatusEmoji) {
        // ステータス絵文字を変更する
        updateEmoji(
          localStorageAppSettings.status.emoji.leave,
          localStorageAppSettings.status.text.leave,
          midnightUnixTime,
          slackOauthToken.accessToken,
        )
      }

      postMessage(
        channelId,
        createPunchInEndMessage(values),
        filteredConversations?.ts,
        slackOauthToken.accessToken,
      )
    }
  }

  /**
   * 初回アクセス時の処理
   */
  useEffect(() => {
    ;(async () => {
      if (conversationSettingForm.values.channelId) {
        await getConversations(
          conversationSettingForm.values.channelId,
          setConversationsHistory,
          setConversationsInfo,
          slackOauthToken.accessToken,
          conversationSettingForm.values.searchMessage,
        )
      } else {
        setIsSettingsOpen(true)
      }
      setIsConversationsFetching(false)

      if (!isLocalStorageValid(localStorageAppSettings)) {
        setHasLocalStorageError(true)
      }
    })()
  }, [])

  // Render
  if (Object.keys(slackOauthToken).length === 0) {
    return (
      <Button
        component={'a'}
        href={applicationConstants.slackOauthAuthorizeUrl}
      >
        Login with Slack
      </Button>
    )
  }

  if (hasLocalStorageError) {
    return (
      <LocalStorageError
        localStorageAppSettings={localStorageAppSettings}
        removeLocalStorageAppSettings={removeLocalStorageAppSettings}
      />
    )
  }

  if (authErrorMessage) {
    return <AuthError message={authErrorMessage} />
  }

  return (
    <Grid>
      <Grid.Col span={6}>
        <Stack>
          <SlackChannelAndConversation
            channelName={conversationsInfo?.channel?.name}
            conversations={filteredConversations}
            isFetching={isConversationsFetching}
          />
          <SlackSettings
            isOpen={isSettingsOpen}
            conversationSettingForm={conversationSettingForm}
            handleSubmitConversationSettingForm={
              handleSubmitConversationSettingForm
            }
            statusEmojiSettingsForm={statusEmojiSettingsForm}
            handleSubmitStatusEmojiSettingsForm={
              handleSubmitStatusEmojiSettingsForm
            }
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
  )
}

export default App
