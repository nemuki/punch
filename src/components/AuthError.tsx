import { Button, Group, Stack, Text } from '@mantine/core'
import { FC } from 'react'
import { useAuth } from '../hooks/useAuth.tsx'

type Props = {
  message: string
}

export const AuthError: FC<Props> = (props: Props) => {
  const { handleRemoveLocalStorageSlackOauthToken } = useAuth()

  return (
    <Stack>
      <Text c={'red'} fw={500}>
        {props.message}
      </Text>
      <Group>
        <Button
          onClick={() => {
            window.location.reload()
          }}
        >
          リトライ（だいたいこっちで治る）
        </Button>
        <Button
          onClick={() => {
            handleRemoveLocalStorageSlackOauthToken()
          }}
        >
          ログイン情報を削除
        </Button>
      </Group>
    </Stack>
  )
}
