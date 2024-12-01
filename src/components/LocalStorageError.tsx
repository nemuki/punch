import { Box, Button, Card, Group, Stack, Text } from '@mantine/core'
import { FC } from 'react'
import { AppSettings } from '../types'

type Props = {
  localStorageAppSettings: AppSettings
}

export const LocalStorageError: FC<Props> = (props: Props) => {
  return (
    <Stack>
      <Box>
        <Text>メンテナンス中に設定情報を変更しました by 開発者</Text>
        <Text>お手数ですが、初期化をお願いします 🙏</Text>
      </Box>
      <Box>
        <Text fw={700}>🚨 以下はメモしてください！</Text>
        <Card withBorder>
          <Group>
            <Text fw={700}>チャンネルID: </Text>
            <Text>{props.localStorageAppSettings.conversations.channelId}</Text>
          </Group>
          <Group>
            <Text fw={700}>スレッド検索文言:</Text>
            <Text>
              {props.localStorageAppSettings.conversations.searchMessage}
            </Text>
          </Group>
        </Card>
      </Box>
      <Button
        w={'fit-content'}
        onClick={() => {
          localStorage.clear()
          window.location.reload()
        }}
      >
        初期化
      </Button>
    </Stack>
  )
}
