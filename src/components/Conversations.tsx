import { Box, Code, Text } from '@mantine/core'
import { MessageElement } from '@slack/web-api/dist/types/response/ConversationsHistoryResponse'

export const Conversations = (props: { conversations?: MessageElement }) => {
  if (props.conversations === undefined) {
    return (
      <Box>
        <Text>スレッドが見つかりませんでした。</Text>
        <Text>チャンネルに投稿します。</Text>
      </Box>
    )
  }

  return (
    <>
      <Code block>{props.conversations.text}</Code>
      <details>
        <summary>メッセージを表示</summary>
        <Code block>{JSON.stringify(props.conversations, undefined, 2)}</Code>
      </details>
    </>
  )
}
