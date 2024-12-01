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
import { useStatusEmojiSettingFormContext } from '../context/form-context'

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
  const form = useStatusEmojiSettingFormContext()

  return (
    <Box>
      <Text fw={700}>{props.label}</Text>
      <Group grow>
        <TextInput
          label="絵文字"
          key={form.key(`emoji.${props.emojiKey}`)}
          {...form.getInputProps(`emoji.${props.emojiKey}`)}
        />
        <TextInput
          label="絵文字メッセージ"
          key={form.key(`text.${props.emojiKey}`)}
          {...form.getInputProps(`text.${props.emojiKey}`)}
        />
      </Group>
    </Box>
  )
}
