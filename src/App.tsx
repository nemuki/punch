import { Button, Grid, Stack } from '@mantine/core'
import { readLocalStorageValue, useLocalStorage } from '@mantine/hooks'
import { useMemo, useState } from 'react'
import {
  AuthError,
  LocalStorageError,
  PunchInForm,
  SettingsForm,
  SlackChannelAndConversations,
} from './components'
import { usePunchInSettingForm } from './context/form-context.ts'
import { useAuth } from './hooks/useAuth.tsx'
import { useConversations } from './hooks/useConversations.tsx'
import { postMessages, updateEmoji } from './infra/repository/slack.ts'
import {
  AppSettings,
  PunchInSettings,
  SlackConversation,
  SlackConversations,
} from './types'
import { applicationConstants, isLocalStorageValid } from './utils'

function App() {
  const { authErrorMessage, authIsLoading, slackOauthToken } = useAuth()

  // State
  const [hasLocalStorageError, setHasLocalStorageError] = useState(false)

  const [localStorageAppSettings, setLocalStorageAppSettings] =
    useLocalStorage<AppSettings>({
      key: applicationConstants.appSettingsLocalStorageKey,
      defaultValue: readLocalStorageValue<AppSettings>({
        key: applicationConstants.appSettingsLocalStorageKey,
        defaultValue: applicationConstants.defaultAppSettings,
      }),
    })

  // Conversation management
  const {
    slackConversations,
    isConversationsFetching,
    shouldOpenSettings,
    fetchConversations,
  } = useConversations({
    appSettings: localStorageAppSettings,
    accessToken: slackOauthToken.accessToken,
    authIsLoading,
  })

  // Check for localStorage errors
  if (!isLocalStorageValid(localStorageAppSettings)) {
    if (!hasLocalStorageError) {
      setHasLocalStorageError(true)
    }
  }

  // form
  const punchInForm = usePunchInSettingForm({
    mode: 'controlled',
    initialValues: {
      changeStatusEmoji: false,
      inOffice: false,
      additionalMessage: '',
      punchIn: undefined,
    },
  })

  const filteredSlackConversations = useMemo<SlackConversations>(() => {
    if (!isLocalStorageValid(localStorageAppSettings)) {
      return []
    }

    if (slackConversations) {
      return localStorageAppSettings.conversations.map((appConversation) => {
        const id = appConversation.id
        const channelId = appConversation.channelId
        const searchMessage = appConversation.searchMessage

        const rawSlackConversation = slackConversations.find(
          (conversation) => conversation.id === id,
        )

        const baseResult: SlackConversation = {
          id: id,
          channelId: channelId,
          channelName: rawSlackConversation?.conversationsInfo?.channel?.name,
          workspaceId:
            rawSlackConversation?.conversationsInfo?.channel?.context_team_id,
        }

        if (!searchMessage) {
          return baseResult
        }

        const threadText = rawSlackConversation?.conversationsHistory?.messages
          ?.filter((message) => message.type === 'message')
          .filter((message) => message?.text?.includes(searchMessage))[0]

        return {
          ...baseResult,
          threadTs: threadText?.ts,
          threadText: threadText?.text,
        }
      })
    } else {
      return localStorageAppSettings.conversations.map(
        (conversation): SlackConversation => {
          return {
            id: conversation.id,
          }
        },
      )
    }
  }, [slackConversations, localStorageAppSettings])

  const handleSubmitAppSettingsForm = async (values: AppSettings) => {
    const result = await fetchConversations(values.conversations)
    if (result) {
      setLocalStorageAppSettings(values)
    }
    return result
  }

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

  /**
   * 出勤時の関数
   */
  const handleSubmitPunchInForm = (values: typeof punchInForm.values) => {
    if (values.punchIn === undefined) {
      return
    }

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

      postMessages({
        conversations: filteredSlackConversations,
        message: createPunchInStartMessage(values),
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

      postMessages({
        conversations: filteredSlackConversations,
        message: createPunchInEndMessage(values),
        accessToken: slackOauthToken.accessToken,
      })
    }
  }

  // Render
  if (hasLocalStorageError) {
    return <LocalStorageError />
  }

  if (Object.keys(slackOauthToken).length === 0) {
    return (
      <Button component="a" href={applicationConstants.slackOauthAuthorizeUrl}>
        Login with Slack
      </Button>
    )
  }

  if (authErrorMessage) {
    return <AuthError message={authErrorMessage} />
  }

  return (
    <Grid>
      <Grid.Col span={6}>
        <Stack>
          <SlackChannelAndConversations
            slackConversations={filteredSlackConversations}
            isFetching={isConversationsFetching}
          />
          <SettingsForm
            localStorageAppSettings={localStorageAppSettings}
            onSubmit={handleSubmitAppSettingsForm}
            shouldOpenSettings={shouldOpenSettings}
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
