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

type Props = {
  deleteConversation: (index: number) => void
}

export const SlackConversationSetting: FC<Props> = (props: Props) => {
  const form = useAppSettingsFormContext()
  const conversations = form.getValues().conversations

  return (
    <Stack>
      <Title order={3} size={'sm'}>
        Slackチャンネル / スレッド検索
      </Title>
      {conversations.map((_, index) => (
        <Card withBorder key={index}>
          <Stack>
            <Group>
              <Text>チャンネル {index + 1}</Text>
              {conversations.length > 1 && (
                <Button
                  color={'red'}
                  onClick={() => {
                    props.deleteConversation(index)
                  }}
                >
                  削除
                </Button>
              )}
            </Group>
            <TextInput
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
      <Group>
        <Button
          onClick={() => {
            form.insertListItem('conversations', {
              channelId: '',
              searchMessage: '',
            })
          }}
          w={'fit-content'}
        >
          チャンネル追加
        </Button>
        <Button type={'submit'} w={'fit-content'}>
          検索
        </Button>
      </Group>
    </Stack>
  )
}
