import { Anchor, Box, Card, Skeleton, Stack, Text, Title } from '@mantine/core'
import React, { FC } from 'react'
import { SlackConversations } from '../types'

type Props = {
  slackConversations: SlackConversations
  isFetching: boolean
}

type CardTemplateProps = {
  title: string
  children: React.ReactNode
}

type ChannelProps = {
  channelName?: string
  channelId?: string
  workspaceId?: string
}

type ConversationsProps = {
  threadText?: string
}

export const SlackChannelAndConversations: FC<Props> = (props: Props) => {
  return (
    <Skeleton visible={props.isFetching}>
      <Stack>
        <Title order={2} size={'h5'}>
          Slackチャンネル / スレッド
        </Title>
        {props.slackConversations.map((conversation, index) => (
          <Stack key={index}>
            <Title order={3} size={'h6'}>
              Slackチャンネル {index + 1}
            </Title>
            <Channel
              channelName={conversation.channelName}
              channelId={conversation.channelId}
              workspaceId={conversation.workspaceId}
            />
            <Conversations threadText={conversation.threadText} />
          </Stack>
        ))}
      </Stack>
    </Skeleton>
  )
}

const CardTemplate: FC<CardTemplateProps> = (props: CardTemplateProps) => {
  return (
    <Box>
      <Card withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Title order={4} size={'h6'}>
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
  const url = `https://app.slack.com/client/${props.workspaceId}/${props.channelId}`

  if (props.channelName === undefined) {
    return (
      <CardTemplate title={title}>
        <Text fw={700} c={'red'}>
          チャンネルを検索してください
        </Text>
      </CardTemplate>
    )
  }

  return (
    <CardTemplate title={title}>
      <Anchor href={url} target={'_blank'} fw={700}>
        # {props.channelName}
      </Anchor>
    </CardTemplate>
  )
}

const Conversations: FC<ConversationsProps> = (props: ConversationsProps) => {
  const title = '投稿するスレッド'

  if (props.threadText === undefined) {
    return (
      <CardTemplate title={title}>
        <Text>スレッドが見つかりませんでした。</Text>
        <Text fw={700}>チャンネルに投稿します。</Text>
      </CardTemplate>
    )
  }

  return (
    <CardTemplate title={title}>
      <Text>{props.threadText}</Text>
    </CardTemplate>
  )
}
