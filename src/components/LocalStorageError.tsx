import { Box, Button, Code, Stack, Text, Title } from '@mantine/core'
import { FC } from 'react'
import type { LocalStorageValidationResult } from '../utils'

type Props = {
  validationResult: LocalStorageValidationResult & { isValid: false }
}

export const LocalStorageError: FC<Props> = ({ validationResult }) => {
  const { reason, currentData, expectedVersion, actualVersion } =
    validationResult

  const getErrorMessage = () => {
    switch (reason) {
      case 'missing-version':
        return 'ローカルストレージにバージョン情報がありません'
      case 'version-mismatch':
        return `バージョンが一致しません（期待: v${expectedVersion}, 実際: v${actualVersion}）`
      case 'invalid-structure':
        return 'ローカルストレージの構造が不正です'
      default:
        return 'ローカルストレージのバリデーションエラー'
    }
  }

  const getChannelIds = () => {
    try {
      if (
        currentData?.conversations &&
        Array.isArray(currentData.conversations)
      ) {
        return (
          currentData.conversations
            // biome-ignore lint/suspicious/noExplicitAny: any is used to safely extract data from unknown localStorage content
            .map((conv: any) => conv.channelId)
            .filter((id: string) => id && id.trim() !== '')
        )
      }
    } catch (error) {
      console.error('Error extracting channel IDs:', error)
    }
    return []
  }

  const getSearchMessages = () => {
    try {
      if (
        currentData?.conversations &&
        Array.isArray(currentData.conversations)
      ) {
        return (
          currentData.conversations
            // biome-ignore lint/suspicious/noExplicitAny: any is used to safely extract data from unknown localStorage content
            .map((conv: any) => conv.searchMessage)
            .filter((msg: string) => msg && msg.trim() !== '')
        )
      }
    } catch (error) {
      console.error('Error extracting search messages:', error)
    }
    return []
  }

  const channelIds = getChannelIds()
  const searchMessages = getSearchMessages()

  return (
    <Stack gap="lg">
      <Box>
        <Title order={3}>設定情報エラー</Title>
        <Text c="red" mt="xs">
          {getErrorMessage()}
        </Text>
        <Text mt="xs">メンテナンス中に設定情報を変更しました by 開発者</Text>
        <Text>お手数ですが、初期化と再設定をお願いします 🙏</Text>
      </Box>

      {channelIds.length > 0 && (
        <Box>
          <Text fw={500} mb="xs">
            設定されていたチャンネルID:
          </Text>
          {channelIds.map((id: string, index: number) => (
            <Code key={index} block mb="xs">
              {id}
            </Code>
          ))}
        </Box>
      )}

      {searchMessages.length > 0 && (
        <Box>
          <Text fw={500} mb="xs">
            設定されていたスレッド検索の文言:
          </Text>
          {searchMessages.map((msg: string, index: number) => (
            <Code key={index} block mb="xs">
              {msg}
            </Code>
          ))}
        </Box>
      )}

      <Box>
        <Text fw={500} mb="xs">
          現在のローカルストレージ内容（JSON）:
        </Text>
        <Code block style={{ maxHeight: '300px', overflow: 'auto' }}>
          {JSON.stringify(currentData, null, 2)}
        </Code>
      </Box>

      <Button
        w="fit-content"
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
