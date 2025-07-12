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

          <Text fw={700}>出社時の動作</Text>
          <Group grow>
            <TextInput
              label="開始時"
              placeholder="開始します"
              key={form.key('messages.actions.office.start')}
              {...form.getInputProps('messages.actions.office.start')}
            />
            <TextInput
              label="終了時"
              placeholder="終了します"
              key={form.key('messages.actions.office.end')}
              {...form.getInputProps('messages.actions.office.end')}
            />
          </Group>

          <Text fw={700}>テレワーク時の動作</Text>
          <Group grow>
            <TextInput
              label="開始時"
              placeholder="開始します"
              key={form.key('messages.actions.telework.start')}
              {...form.getInputProps('messages.actions.telework.start')}
            />
            <TextInput
              label="終了時"
              placeholder="終了します"
              key={form.key('messages.actions.telework.end')}
              {...form.getInputProps('messages.actions.telework.end')}
            />
          </Group>

          <Text fw={700}>プレビュー</Text>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              各組み合わせの送信メッセージ例
            </Text>
            <Group grow>
              <Card withBorder radius="sm" p="xs">
                <Text size="xs" c="dimmed" mb={4}>
                  出社 - 開始
                </Text>
                <Text size="sm">
                  {form.values.messages?.workTypes?.office || '業務'}
                  {form.values.messages?.actions?.office?.start || '開始します'}
                </Text>
              </Card>
              <Card withBorder radius="sm" p="xs">
                <Text size="xs" c="dimmed" mb={4}>
                  出社 - 終了
                </Text>
                <Text size="sm">
                  {form.values.messages?.workTypes?.office || '業務'}
                  {form.values.messages?.actions?.office?.end || '終了します'}
                </Text>
              </Card>
            </Group>
            <Group grow>
              <Card withBorder radius="sm" p="xs">
                <Text size="xs" c="dimmed" mb={4}>
                  テレワーク - 開始
                </Text>
                <Text size="sm">
                  {form.values.messages?.workTypes?.telework || 'テレワーク'}
                  {form.values.messages?.actions?.telework?.start ||
                    '開始します'}
                </Text>
              </Card>
              <Card withBorder radius="sm" p="xs">
                <Text size="xs" c="dimmed" mb={4}>
                  テレワーク - 終了
                </Text>
                <Text size="sm">
                  {form.values.messages?.workTypes?.telework || 'テレワーク'}
                  {form.values.messages?.actions?.telework?.end || '終了します'}
                </Text>
              </Card>
            </Group>
          </Stack>

          <Button type="submit" w="fit-content">
            保存
          </Button>
        </Stack>
      </Card>
    </Stack>
  )
}
