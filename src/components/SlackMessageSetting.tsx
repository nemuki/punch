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

          <Text fw={700}>出社時の動作</Text>
          <Group grow>
            <TextInput
              label="開始時"
              placeholder="業務開始します"
              key={form.key('messages.actions.office.start')}
              {...form.getInputProps('messages.actions.office.start')}
            />
            <TextInput
              label="終了時"
              placeholder="業務終了します"
              key={form.key('messages.actions.office.end')}
              {...form.getInputProps('messages.actions.office.end')}
            />
          </Group>

          <Text fw={700}>テレワーク時の動作</Text>
          <Group grow>
            <TextInput
              label="開始時"
              placeholder="テレワーク開始します"
              key={form.key('messages.actions.telework.start')}
              {...form.getInputProps('messages.actions.telework.start')}
            />
            <TextInput
              label="終了時"
              placeholder="テレワーク終了します"
              key={form.key('messages.actions.telework.end')}
              {...form.getInputProps('messages.actions.telework.end')}
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
