import { createFormContext } from '@mantine/form'
import { Conversation, PunchInSettings, StatusEmojiSetting } from '../types'

export const [
  ConversationSettingFormProvider,
  useConversationSettingFormContext,
  useConversationSettingForm,
] = createFormContext<Conversation>()

export const [
  StatusEmojiSettingFormProvider,
  useStatusEmojiSettingFormContext,
  useStatusEmojiSettingForm,
] = createFormContext<StatusEmojiSetting>()

export const [
  PunchInSettingFormProvider,
  usePunchInSettingFormContext,
  usePunchInSettingForm,
] = createFormContext<PunchInSettings>()
