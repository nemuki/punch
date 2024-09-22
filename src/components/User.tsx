import { Avatar, Button, Text } from '@mantine/core'
import { useAuth } from '../hooks/useAuth.tsx'

export const User = () => {
  const { userProfile, handleLogout } = useAuth()

  if (!userProfile) {
    return null
  }

  return (
    <>
      <Avatar radius="sm" size={'sm'} src={userProfile.profile?.image_192} />
      <Text>{userProfile.profile?.real_name}</Text>
      <Button
        onClick={() => {
          handleLogout()
        }}
        w={'fit-content'}
        size="xs"
      >
        ログアウト
      </Button>
    </>
  )
}
