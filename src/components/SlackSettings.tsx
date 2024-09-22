import { Button, Collapse, Stack } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { FC } from 'react'
import { Conversations, StatusEmojiSettings } from '../types'
import { SlackConversationSetting } from './SlackConversationSetting.tsx'
import { SlackEmojiSetting } from './SlackEmojiSetting.tsx'

type Props = {
  isOpen: boolean
  conversationSettingForm: UseFormReturnType<Conversations>
  handleSubmitConversationSettingForm: (values: Conversations) => void
  statusEmojiSettingsForm: UseFormReturnType<StatusEmojiSettings>
  handleSubmitStatusEmojiSettingsForm: (values: StatusEmojiSettings) => void
}

export const SlackSettings: FC<Props> = (props: Props) => {
  const [opened, { toggle }] = useDisclosure(props.isOpen)

  return (
    <>
      <Button onClick={toggle}>Slack設定を開く</Button>
      <Collapse in={opened}>
        <Stack>
          <SlackConversationSetting
            conversationSettingForm={props.conversationSettingForm}
            handleSubmit={props.handleSubmitConversationSettingForm}
          />
          <SlackEmojiSetting
            statusEmojiSettingsForm={props.statusEmojiSettingsForm}
            handleSubmit={props.handleSubmitStatusEmojiSettingsForm}
          />
        </Stack>
      </Collapse>
    </>
  )
}
