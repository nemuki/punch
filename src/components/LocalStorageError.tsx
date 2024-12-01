import { Box, Button, Stack, Text } from '@mantine/core'
import { FC } from 'react'

export const LocalStorageError: FC = () => {
  return (
    <Stack>
      <Box>
        <Text>メンテナンス中に設定情報を変更しました by 開発者</Text>
        <Text>お手数ですが、初期化と再設定をお願いします 🙏</Text>
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
