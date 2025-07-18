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
import {
  type LocalStorageValidationResult,
  applicationConstants,
  isLocalStorageValid,
  validateLocalStorage,
} from './utils'

function App() {
  const { authErrorMessage, authIsLoading, slackOauthToken } = useAuth()

  // State
  const [hasLocalStorageError, setHasLocalStorageError] = useState(false)
  const [localStorageValidationResult, setLocalStorageValidationResult] =
    useState<LocalStorageValidationResult | null>(null)

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
  const validationResult = validateLocalStorage(localStorageAppSettings)
  if (!validationResult.isValid) {
    if (!hasLocalStorageError) {
      setHasLocalStorageError(true)
      setLocalStorageValidationResult(validationResult)
    }
  }

  // form
  const punchInForm = usePunchInSettingForm({
    mode: 'controlled',
    initialValues: {
      changeStatusEmoji:
        localStorageAppSettings.savedPunchInSettings?.changeStatusEmoji ??
        false,
      inOffice: localStorageAppSettings.savedPunchInSettings?.inOffice ?? false,
      additionalMessage:
        localStorageAppSettings.savedPunchInSettings?.additionalMessage ?? '',
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

  const createPunchInStartMessage = (values: PunchInSettings) => {
    const baseMessage = values.inOffice
      ? localStorageAppSettings.messages.office.start
      : localStorageAppSettings.messages.telework.start
    return `${baseMessage}\n${values.additionalMessage}`
  }

  const createPunchInEndMessage = (values: PunchInSettings) => {
    const baseMessage = values.inOffice
      ? localStorageAppSettings.messages.office.end
      : localStorageAppSettings.messages.telework.end
    return `${baseMessage}\n${values.additionalMessage}`
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

    setLocalStorageAppSettings((prev) => ({
      ...prev,
      savedPunchInSettings: {
        changeStatusEmoji: values.changeStatusEmoji,
        inOffice: values.inOffice,
        additionalMessage: values.additionalMessage,
      },
    }))

    if (values.punchIn === 'start') {
      // 出勤時の処理
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
  if (
    hasLocalStorageError &&
    localStorageValidationResult &&
    !localStorageValidationResult.isValid
  ) {
    return <LocalStorageError validationResult={localStorageValidationResult} />
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
          messageTemplates={localStorageAppSettings.messages}
        />
      </Grid.Col>
    </Grid>
  )
}

export default App
