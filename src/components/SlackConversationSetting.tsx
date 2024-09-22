import { Button, Card, Stack, TextInput, Title } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { FC } from 'react'
import { Conversation } from '../types'

type Props = {
  conversationSettingForm: UseFormReturnType<Conversation>
  handleSubmit: (values: Conversation) => void
}

export const SlackConversationSetting: FC<Props> = (props: Props) => {
  return (
    <form onSubmit={props.conversationSettingForm.onSubmit(props.handleSubmit)}>
      <Stack>
        <Title order={3} size={'sm'}>
          Slackチャンネル / スレッド検索
        </Title>
        <Card withBorder>
          <Stack>
            <TextInput
              label="チャンネルID"
              description="投稿するチャンネルのIDを入力してください"
              key={props.conversationSettingForm.key('channelId')}
              {...props.conversationSettingForm.getInputProps('channelId')}
            />
            <TextInput
              label="スレッド検索"
              description="検索文言を含む 当日午前6時以降 のメッセージを部分一致で検索します
指定しない場合はチャンネルに投稿します
例: 勤怠スレッド"
              placeholder="勤怠スレッド"
              styles={{ description: { whiteSpace: 'pre-wrap' } }}
              key={props.conversationSettingForm.key('searchMessage')}
              {...props.conversationSettingForm.getInputProps('searchMessage')}
            />
            <Button type={'submit'} w={'fit-content'}>
              検索
            </Button>
          </Stack>
        </Card>
      </Stack>
    </form>
  )
}
