import { Button, Collapse, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect } from 'react'
import {
  AppSettingsFormProvider,
  useAppSettingsForm,
} from '../context/form-context.ts'
import { AppSettings, RawSlackConversations } from '../types'
import { SlackConversationSetting, SlackEmojiSetting } from './index'

interface SettingsFormProps {
  localStorageAppSettings: AppSettings
  onSubmit: (values: AppSettings) => Promise<RawSlackConversations | undefined>
  shouldOpenSettings: boolean
}

export const SettingsForm = ({
  localStorageAppSettings,
  onSubmit,
  shouldOpenSettings,
}: SettingsFormProps) => {
  const [
    isSettingsOpen,
    { toggle: toggleSettingsOpen, open: setIsSettingsOpen },
  ] = useDisclosure(false)

  const appSettingsForm = useAppSettingsForm({
    mode: 'uncontrolled',
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

  // Open settings automatically when needed
  useEffect(() => {
    if (shouldOpenSettings) {
      setIsSettingsOpen()
    }
  }, [shouldOpenSettings, setIsSettingsOpen])

  const deleteConversation = (index: number) => {
    appSettingsForm.removeListItem('conversations', index)
    onSubmit(appSettingsForm.getValues())
  }

  const handleSubmit = (values: typeof appSettingsForm.values) => {
    onSubmit(values)
  }

  return (
    <>
      <Button onClick={toggleSettingsOpen}>Slack設定を開く</Button>
      <Collapse in={isSettingsOpen}>
        <AppSettingsFormProvider form={appSettingsForm}>
          <form onSubmit={appSettingsForm.onSubmit(handleSubmit)}>
            <Stack>
              <SlackConversationSetting
                deleteConversation={deleteConversation}
              />
              <SlackEmojiSetting />
            </Stack>
          </form>
        </AppSettingsFormProvider>
      </Collapse>
    </>
  )
}
