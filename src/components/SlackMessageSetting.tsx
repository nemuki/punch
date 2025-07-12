import {
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

export const SlackMessageSetting: FC = () => {
  const form = useAppSettingsFormContext()

  return (
    <Stack>
      <Title order={3} size="sm">
        メッセージテンプレート設定
      </Title>
      <Card withBorder>
        <Stack>
          <Text size="sm" c="dimmed">
            出退勤メッセージで使用される文言をカスタマイズできます
          </Text>

          <Text fw={700}>勤務種別</Text>
          <Group grow>
            <TextInput
              label="出社時"
              placeholder="業務"
              key={form.key('messages.workTypes.office')}
              {...form.getInputProps('messages.workTypes.office')}
            />
            <TextInput
              label="テレワーク時"
              placeholder="テレワーク"
              key={form.key('messages.workTypes.telework')}
              {...form.getInputProps('messages.workTypes.telework')}
            />
          </Group>

          <Text fw={700}>動作</Text>
          <Group grow>
            <TextInput
              label="開始時"
              placeholder="開始します"
              key={form.key('messages.actions.start')}
              {...form.getInputProps('messages.actions.start')}
            />
            <TextInput
              label="終了時"
              placeholder="終了します"
              key={form.key('messages.actions.end')}
              {...form.getInputProps('messages.actions.end')}
            />
          </Group>

          <Button type="submit" w="fit-content">
            保存
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}
