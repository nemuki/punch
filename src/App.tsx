import { Button, Grid, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import {
  readLocalStorageValue,
  useDisclosure,
  useLocalStorage,
} from '@mantine/hooks'
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
  Conversation,
  PunchInSettings,
  StatusEmojiSetting,
} from './types'
import { applicationConstants, isLocalStorageValid } from './utils'

function App() {
  const { authErrorMessage, slackOauthToken } = useAuth()

  // State
  const [
    isSettingsOpen,
    { toggle: toggleSettingsOpen, open: setIsSettingsOpen },
  ] = useDisclosure(false)
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
  const conversationSettingForm = useForm<Conversation>({
    mode: 'uncontrolled',
    initialValues: localStorageAppSettings.conversations,
  })
  const statusEmojiSettingForm = useForm<StatusEmojiSetting>({
    mode: 'uncontrolled',
    initialValues: localStorageAppSettings.status,
  })
  const punchInForm = useForm<PunchInSettings>({
    mode: 'controlled',
    initialValues: {
      changeStatusEmoji: false,
      inOffice: false,
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
    const baseMessage = getWorkStatus(values.inOffice)
    return `${baseMessage}開始します\n${values.additionalMessage}`
  }

  const createPunchInEndMessage = (values: PunchInSettings) => {
    const baseMessage = getWorkStatus(values.inOffice)
    return `${baseMessage}終了します\n${values.additionalMessage}`
  }

  const handleSubmitConversationSettingForm = (
    values: typeof conversationSettingForm.values,
  ) => {
    getConversations({
      channelId: values.channelId,
      setConversationsHistory,
      setConversationsInfo,
      accessToken: slackOauthToken.accessToken,
      searchMessage: values.searchMessage,
    })

    setLocalStorageAppSettings((prev) => ({
      ...prev,
      conversations: values,
    }))
  }

  const handleSubmitStatusEmojiSettingsForm = (
    values: typeof statusEmojiSettingForm.values,
  ) => {
    setLocalStorageAppSettings((prev) => ({
      ...prev,
      status: values,
    }))
  }

  /**
   * 出勤時の関数
   */
  const handleSubmitPunchInForm = (values: typeof punchInForm.values) => {
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
        if (values.inOffice) {
          updateEmoji({
            statusEmoji: localStorageAppSettings.status.emoji.office,
            statusText: localStorageAppSettings.status.text.office,
            statusExpiration: nineHoursLaterUnixTime,
            accessToken: slackOauthToken.accessToken,
          })
        } else {
          updateEmoji({
            statusEmoji: localStorageAppSettings.status.emoji.telework,
            statusText: localStorageAppSettings.status.text.telework,
            statusExpiration: nineHoursLaterUnixTime,
            accessToken: slackOauthToken.accessToken,
          })
        }
      }

      postMessage({
        channelId,
        message: createPunchInStartMessage(values),
        threadTs: filteredConversations?.ts,
        accessToken: slackOauthToken.accessToken,
      })
    } else if (values.punchIn === 'end') {
      // 退勤時の処理
      if (values.changeStatusEmoji) {
        // ステータス絵文字を変更する
        updateEmoji({
          statusEmoji: localStorageAppSettings.status.emoji.leave,
          statusText: localStorageAppSettings.status.text.leave,
          statusExpiration: midnightUnixTime,
          accessToken: slackOauthToken.accessToken,
        })
      }

      postMessage({
        channelId,
        message: createPunchInEndMessage(values),
        threadTs: filteredConversations?.ts,
        accessToken: slackOauthToken.accessToken,
      })
    }
  }

  /**
   * 初回アクセス時の処理
   */
  useEffect(() => {
    ;(async () => {
      if (conversationSettingForm.values.channelId) {
        await getConversations({
          channelId: conversationSettingForm.values.channelId,
          setConversationsHistory,
          setConversationsInfo,
          accessToken: slackOauthToken.accessToken,
          searchMessage: conversationSettingForm.values.searchMessage,
        })
      } else {
        setIsSettingsOpen()
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
            conversationsInfo={conversationsInfo}
            conversations={filteredConversations}
            isFetching={isConversationsFetching}
          />
          <SlackSettings
            isOpen={isSettingsOpen}
            toggleSettingsOpen={toggleSettingsOpen}
            conversationSettingForm={conversationSettingForm}
            handleSubmitConversationSettingForm={
              handleSubmitConversationSettingForm
            }
            statusEmojiSettingForm={statusEmojiSettingForm}
            handleSubmitStatusEmojiSettingForm={
              handleSubmitStatusEmojiSettingsForm
            }
          />
        </Stack>
      </Grid.Col>
      <Grid.Col span={6}>
        <PunchInForm
          punchInForm={punchInForm}
          handleSubmitPunchInForm={handleSubmitPunchInForm}
          getWorkStatus={getWorkStatus}
        />
      </Grid.Col>
    </Grid>
  )
}

export default App
