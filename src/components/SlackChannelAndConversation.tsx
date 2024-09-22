import { Box, Card, Code, Stack, Text, Title } from '@mantine/core'
import { MessageElement } from '@slack/web-api/dist/types/response/ConversationsHistoryResponse'
import React, { FC } from 'react'

type Props = {
  channelName?: string
  conversations?: MessageElement
  isFetching: boolean
}

type CardTemplateProps = {
  title: string
  children: React.ReactNode
}

type ChannelProps = {
  channelName?: string
}

type ConversationsProps = {
  conversations?: MessageElement
}

export const SlackChannelAndConversation: FC<Props> = (props: Props) => {
  if (props.isFetching) {
    return (
      <Stack>
        <Title order={2} size={'h5'}>
          Slackチャンネル / スレッド
        </Title>
        <Text>取得中...</Text>
      </Stack>
    )
  }

  return (
    <Stack>
      <Title order={2} size={'h5'}>
        Slackチャンネル / スレッド
      </Title>
      <Channel channelName={props.channelName} />
      <Conversations conversations={props.conversations} />
    </Stack>
  )
}

const CardTemplate: FC<CardTemplateProps> = (props: CardTemplateProps) => {
  return (
    <Box>
      <Card withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={3} size={'h6'}>
            {props.title}
          </Title>
        </Card.Section>
        <Card.Section withBorder inheritPadding py="xs">
          {props.children}
        </Card.Section>
      </Card>
    </Box>
  )
}

const Channel: FC<ChannelProps> = (props: ChannelProps) => {
  const title = '投稿するチャンネル'

  if (props.channelName === undefined) {
    return (
      <CardTemplate title={title}>
        <Text fw={700} c={'red'}>
          チャンネルを検索してください
        </Text>
      </CardTemplate>
    )
  }

  return <CardTemplate title={title}>{props.channelName}</CardTemplate>
}

const Conversations: FC<ConversationsProps> = (props: ConversationsProps) => {
  const title = '投稿するスレッド'

  if (props.conversations === undefined) {
    return (
      <CardTemplate title={title}>
        <Text>スレッドが見つかりませんでした。</Text>
        <Text>チャンネルに投稿します。</Text>
      </CardTemplate>
    )
  }

  return (
    <CardTemplate title={title}>
      <Text>{props.conversations.text}</Text>
      <details>
        <summary>メッセージを表示</summary>
        <Code block>{JSON.stringify(props.conversations, undefined, 2)}</Code>
      </details>
    </CardTemplate>
  )
}
