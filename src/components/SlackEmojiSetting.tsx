import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { FC } from 'react'
import { StatusEmojiSettings } from '../types'

type Props = {
  statusEmojiSettingsForm: UseFormReturnType<StatusEmojiSettings>
  handleSubmit: (values: StatusEmojiSettings) => void
}

export const SlackEmojiSetting: FC<Props> = (props: Props) => {
  return (
    <form onSubmit={props.statusEmojiSettingsForm.onSubmit(props.handleSubmit)}>
      <Stack>
        <Title order={3} size={'sm'}>
          Slack絵文字設定
        </Title>
        <Card withBorder>
          <Stack>
            <StatusEmojiInput
              label={'🏢 出社'}
              emojiKey={'office'}
              statusEmojiSettingsForm={props.statusEmojiSettingsForm}
            />
            <StatusEmojiInput
              label={'🏠 テレワーク'}
              emojiKey={'telework'}
              statusEmojiSettingsForm={props.statusEmojiSettingsForm}
            />
            <StatusEmojiInput
              label={'🚪 退勤'}
              emojiKey={'leave'}
              statusEmojiSettingsForm={props.statusEmojiSettingsForm}
            />
            <Button type={'submit'} w={'fit-content'}>
              保存
            </Button>
          </Stack>
        </Card>
      </Stack>
    </form>
  )
}

// <Text fw={700}>出社時</Text>
//               <Group grow>
//                 <TextInput
//                   label="絵文字"
//                   key={props.statusEmojiSettingsForm.key('emoji.office')}
//                   {...props.statusEmojiSettingsForm.getInputProps(
//                     'emoji.office',
//                   )}
//                 />
//                 <TextInput
//                   label="絵文字メッセージ"
//                   key={props.statusEmojiSettingsForm.key('text.office')}
//                   {...props.statusEmojiSettingsForm.getInputProps(
//                     'text.office',
//                   )}
//                 />
//               </Group>
// を　コンポーネント化する
type StatusEmojiInputProps = {
  label: string
  emojiKey: string
  statusEmojiSettingsForm: UseFormReturnType<StatusEmojiSettings>
}

const StatusEmojiInput: FC<StatusEmojiInputProps> = (
  props: StatusEmojiInputProps,
) => {
  return (
    <Box>
      <Text fw={700}>{props.label}</Text>
      <Group grow>
        <TextInput
          label="絵文字"
          key={props.statusEmojiSettingsForm.key(`emoji.${props.emojiKey}`)}
          {...props.statusEmojiSettingsForm.getInputProps(
            `emoji.${props.emojiKey}`,
          )}
        />
        <TextInput
          label="絵文字メッセージ"
          key={props.statusEmojiSettingsForm.key(`text.${props.emojiKey}`)}
          {...props.statusEmojiSettingsForm.getInputProps(
            `text.${props.emojiKey}`,
          )}
        />
      </Group>
    </Box>
  )
}
