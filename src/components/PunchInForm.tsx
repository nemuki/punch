import {
  Avatar,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { FC } from 'react'
import { useAuth } from '../hooks/useAuth.tsx'
import { MessageTemplates, PunchInSettings } from '../types'
import { Clock } from './Clock.tsx'

type Props = {
  punchInForm: UseFormReturnType<PunchInSettings>
  handleSubmitPunchInForm: (values: PunchInSettings) => void
  messageTemplates: MessageTemplates
}

export const PunchInForm: FC<Props> = (props: Props) => {
  const { userProfile } = useAuth()

  return (
    <form
      action="/punch"
      onSubmit={props.punchInForm.onSubmit(props.handleSubmitPunchInForm)}
    >
      <Stack>
        <Textarea
          label="追加メッセージ"
          description="追加のメッセージを入力できます"
          key={props.punchInForm.key('additionalMessage')}
          {...props.punchInForm.getInputProps('additionalMessage')}
        />
        <Checkbox
          description="デフォルトはテレワーク"
          label="出社時はチェック"
          key={props.punchInForm.key('inOffice')}
          {...props.punchInForm.getInputProps('inOffice', {
            type: 'checkbox',
          })}
        />
        <Checkbox
          description="出勤時は9時間後、退勤時は24時に削除されます"
          label="ステータス絵文字を変更する"
          key={props.punchInForm.key('changeStatusEmoji')}
          {...props.punchInForm.getInputProps('changeStatusEmoji', {
            type: 'checkbox',
          })}
        />
        <Center>
          <Clock />
        </Center>
        <Group grow>
          <Button
            type="submit"
            onClick={() =>
              props.punchInForm.setValues((prev) => ({
                ...prev,
                punchIn: 'start',
              }))
            }
          >
            出勤
          </Button>
          <Button
            color="pink"
            type="submit"
            onClick={() => {
              props.punchInForm.setValues((prev) => ({
                ...prev,
                punchIn: 'end',
              }))
            }}
          >
            退勤
          </Button>
        </Group>
        <Title order={2} size="sm">
          送信メッセージプレビュー
        </Title>
        <Card withBorder>
          <Stack>
            {userProfile?.profile && (
              <Group>
                <Avatar
                  radius="sm"
                  size="sm"
                  src={userProfile.profile?.image_192}
                />
                <Text fw={700}>{userProfile.profile?.real_name}</Text>
              </Group>
            )}
            <Box>
              <Text inherit style={{ whiteSpace: 'pre-wrap' }}>
                {props.messageTemplates.office.start}
              </Text>
              <Text inherit style={{ whiteSpace: 'pre-wrap' }}>
                {props.messageTemplates.telework.start}
              </Text>
              <Text inherit style={{ whiteSpace: 'pre-wrap' }}>
                {props.messageTemplates.office.end}
              </Text>
              <Text inherit style={{ whiteSpace: 'pre-wrap' }}>
                {props.messageTemplates.telework.end}
              </Text>

              <Text inherit style={{ whiteSpace: 'pre-wrap' }}>
                {props.punchInForm.values.additionalMessage}
              </Text>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </form>
  )
}
