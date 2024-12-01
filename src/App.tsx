import { Button, Collapse, Grid, Stack } from '@mantine/core'
import {
  readLocalStorageValue,
  useDisclosure,
  useLocalStorage,
} from '@mantine/hooks'
import { useEffect, useMemo, useState } from 'react'
import {
  AuthError,
  PunchInForm,
  SlackChannelAndConversations,
  SlackConversationSetting,
  SlackEmojiSetting,
} from './components'
import {
  AppSettingsFormProvider,
  useAppSettingsForm,
  usePunchInSettingForm,
} from './context/form-context.ts'
import { useAuth } from './hooks/useAuth.tsx'
import {
  getConversations,
  postMessage,
  updateEmoji,
} from './infra/repository/slack.ts'
import {
  AppSettings,
  PunchInSettings,
  RawSlackConversations,
  SlackConversation,
  SlackConversations,
} from './types'
import { applicationConstants } from './utils'

function App() {
  const { authErrorMessage, slackOauthToken } = useAuth()

  // State
  const [isConversationsFetching, setIsConversationsFetching] = useState(true)
  const [slackConversations, setSlackConversations] = useState<
    RawSlackConversations | undefined
  >(undefined)

  const [
    isSettingsOpen,
    { toggle: toggleSettingsOpen, open: setIsSettingsOpen },
  ] = useDisclosure(false)

  const [localStorageAppSettings, setLocalStorageAppSettings] =
    useLocalStorage<AppSettings>({
      key: applicationConstants.appSettingsLocalStorageKey,
      defaultValue: readLocalStorageValue<AppSettings>({
        key: applicationConstants.appSettingsLocalStorageKey,
        defaultValue: applicationConstants.defaultAppSettings,
      }),
    })

  // form
  const appSettingsForm = useAppSettingsForm({
    mode: 'controlled',
    initialValues: localStorageAppSettings,
    validate: {
      conversations: {
        channelId: (value) => {
          if (!value) {
            return 'チャンネルIDは必須です'
          }
        },
      },
    },
  })
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
    if (slackConversations) {
      const appSettingsFormValues = appSettingsForm.getValues()

      return slackConversations.map((conversation) => {
        const channelId = conversation.conversationsInfo?.channel?.id || ''
        const searchMessage = appSettingsFormValues.conversations.find(
          (item) =>
            item.channelId === conversation.conversationsInfo?.channel?.id,
        )?.searchMessage

        const baseResult: SlackConversation = {
          channelId: channelId,
          channelName: conversation.conversationsInfo?.channel?.name || '',
          workspaceId:
            conversation.conversationsInfo?.channel?.context_team_id || '',
        }

        if (!searchMessage) {
          return baseResult
        }

        const threadText = conversation.conversationsHistory?.messages
          ?.filter((message) => message.type === 'message')
          .filter((message) => message?.text?.includes(searchMessage))[0]

        return {
          ...baseResult,
          threadTs: threadText?.ts,
          threadText: threadText?.text,
        }
      })
    } else {
      const empty: SlackConversation = {}

      return localStorageAppSettings.conversations.map(() => empty)
    }
  }, [slackConversations])

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

  const deleteConversation = (index: number) => {
    appSettingsForm.removeListItem('conversations', index)
    handleSubmitAppSettingsForm(appSettingsForm.getValues())
  }

  const handleSubmitAppSettingsForm = async (
    values: typeof appSettingsForm.values,
  ) => {
    const result = await getConversations({
      conversations: values.conversations,
      accessToken: slackOauthToken.accessToken,
    })

    setSlackConversations(result)
    setLocalStorageAppSettings(values)
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
      if (appSettingsForm.values.conversations[0].channelId) {
        const result = await getConversations({
          conversations: appSettingsForm.values.conversations,
          accessToken: slackOauthToken.accessToken,
        })

        setSlackConversations(result)
      } else {
        setIsSettingsOpen()
      }

      setIsConversationsFetching(false)
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
          <Button onClick={toggleSettingsOpen}>Slack設定を開く</Button>
          <Collapse in={isSettingsOpen}>
            <AppSettingsFormProvider form={appSettingsForm}>
              <form
                onSubmit={appSettingsForm.onSubmit(handleSubmitAppSettingsForm)}
              >
                <Stack>
                  <SlackConversationSetting
                    deleteConversation={deleteConversation}
                  />
                  <SlackEmojiSetting />
                </Stack>
              </form>
            </AppSettingsFormProvider>
          </Collapse>
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
