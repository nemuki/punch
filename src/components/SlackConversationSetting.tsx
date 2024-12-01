import { Button, Card, Group, Stack, TextInput, Title } from '@mantine/core'
import { randomId } from '@mantine/hooks'
import { FC } from 'react'
import { useAppSettingsFormContext } from '../context/form-context'

type Props = {
  deleteConversation: (index: number) => void
}

export const SlackConversationSetting: FC<Props> = (props: Props) => {
  const form = useAppSettingsFormContext()
  const conversations = form.getValues().conversations

  return (
    <Stack>
      <Group>
        <Title order={2} size={'h5'}>
          Slackチャンネル / スレッド設定
        </Title>
        <Button
          onClick={() => {
            form.insertListItem('conversations', {
              id: randomId(),
              channelId: '',
              searchMessage: '',
            })
          }}
          w={'fit-content'}
          size={'xs'}
        >
          チャンネル追加
        </Button>
      </Group>
      {form.getValues().conversations.map((conversation, index) => (
        <Card withBorder key={conversation.id}>
          <Stack>
            <Group>
              <Title order={3} size={'h6'}>
                チャンネル {index + 1}
              </Title>
              {conversations.length > 1 && (
                <Button
                  color={'red'}
                  onClick={() => {
                    props.deleteConversation(index)
                  }}
                  size="xs"
                >
                  削除
                </Button>
              )}
            </Group>
            <TextInput
              withAsterisk
              label="チャンネルID"
              description="投稿するチャンネルのIDを入力してください"
              key={form.key(`conversations.${index}.channelId`)}
              {...form.getInputProps(`conversations.${index}.channelId`)}
            />
            <TextInput
              label="スレッド検索"
              description="検索文言を含む 当日午前6時以降 のメッセージを部分一致で検索します
指定しない場合はチャンネルに投稿します
例: 勤怠スレッド"
              placeholder="勤怠スレッド"
              styles={{ description: { whiteSpace: 'pre-wrap' } }}
              key={form.key(`conversations.${index}.searchMessage`)}
              {...form.getInputProps(`conversations.${index}.searchMessage`)}
            />
          </Stack>
        </Card>
      ))}
      <Button type={'submit'} w={'fit-content'}>
        保存と検索
      </Button>
    </Stack>
  )
}
