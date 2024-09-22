import { Button, Collapse, Stack } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { FC } from 'react'
import { Conversation, StatusEmojiSetting } from '../types'
import { SlackConversationSetting } from './SlackConversationSetting.tsx'
import { SlackEmojiSetting } from './SlackEmojiSetting.tsx'

type Props = {
  isOpen: boolean
  toggleSettingsOpen: () => void
  conversationSettingForm: UseFormReturnType<Conversation>
  handleSubmitConversationSettingForm: (values: Conversation) => void
  statusEmojiSettingForm: UseFormReturnType<StatusEmojiSetting>
  handleSubmitStatusEmojiSettingForm: (values: StatusEmojiSetting) => void
}

export const SlackSettings: FC<Props> = (props: Props) => {
  return (
    <>
      <Button onClick={props.toggleSettingsOpen}>Slack設定を開く</Button>
      <Collapse in={props.isOpen}>
        <Stack>
          <SlackConversationSetting
            conversationSettingForm={props.conversationSettingForm}
            handleSubmit={props.handleSubmitConversationSettingForm}
          />
          <SlackEmojiSetting
            statusEmojiSettingsForm={props.statusEmojiSettingForm}
            handleSubmit={props.handleSubmitStatusEmojiSettingForm}
          />
        </Stack>
      </Collapse>
    </>
  )
}
