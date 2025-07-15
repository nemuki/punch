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

export const SlackMessageSetting: FC = () => {
  const form = useAppSettingsFormContext()

  return (
    <Stack>
      <Title order={3} size="sm">
        メッセージテンプレート設定
      </Title>
      <Card withBorder>
        <Stack>
          <Box>
            <Text size="sm" c="dimmed">
              出退勤メッセージで使用される文言をカスタマイズできます
            </Text>
            <Text size="sm" c="dimmed">
              空にすると追加メッセージのみが送信されます
            </Text>
          </Box>
          <Box>
            <Text fw={700}>🏢 出社</Text>
            <Group grow>
              <TextInput
                label="出勤"
                placeholder="業務開始します"
                key={form.key('messages.actions.office.start')}
                {...form.getInputProps('messages.actions.office.start')}
              />
              <TextInput
                label="退勤"
                placeholder="業務終了します"
                key={form.key('messages.actions.office.end')}
                {...form.getInputProps('messages.actions.office.end')}
              />
            </Group>
          </Box>

          <Box>
            <Text fw={700}>🏠 テレワーク</Text>
            <Group grow>
              <TextInput
                label="出勤"
                placeholder="テレワーク開始します"
                key={form.key('messages.actions.telework.start')}
                {...form.getInputProps('messages.actions.telework.start')}
              />
              <TextInput
                label="退勤"
                placeholder="テレワーク終了します"
                key={form.key('messages.actions.telework.end')}
                {...form.getInputProps('messages.actions.telework.end')}
              />
            </Group>
          </Box>

          <Button type="submit" w="fit-content">
            保存
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}
