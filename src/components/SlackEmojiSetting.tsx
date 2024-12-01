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
import { FC } from 'react'
import { useAppSettingsFormContext } from '../context/form-context'

export const SlackEmojiSetting: FC = () => {
  return (
    <Stack>
      <Title order={3} size={'sm'}>
        Slack絵文字設定
      </Title>
      <Card withBorder>
        <Stack>
          <StatusEmojiInput label={'🏢 出社'} emojiKey={'office'} />
          <StatusEmojiInput label={'🏠 テレワーク'} emojiKey={'telework'} />
          <StatusEmojiInput label={'🚪 退勤'} emojiKey={'leave'} />
          <Button type={'submit'} w={'fit-content'}>
            保存
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}

type StatusEmojiInputProps = {
  label: string
  emojiKey: string
}

const StatusEmojiInput: FC<StatusEmojiInputProps> = (
  props: StatusEmojiInputProps,
) => {
  const form = useAppSettingsFormContext()

  return (
    <Box>
      <Text fw={700}>{props.label}</Text>
      <Group grow>
        <TextInput
          label="絵文字"
          key={form.key(`status.emoji.${props.emojiKey}`)}
          {...form.getInputProps(`status.emoji.${props.emojiKey}`)}
        />
        <TextInput
          label="絵文字メッセージ"
          key={form.key(`status.text.${props.emojiKey}`)}
          {...form.getInputProps(`status.text.${props.emojiKey}`)}
        />
      </Group>
    </Box>
  )
}
