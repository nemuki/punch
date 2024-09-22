import {
  Button,
  Card,
  Checkbox,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { FC } from 'react'
import { PunchInSettings } from '../types'

type Props = {
  punchInForm: UseFormReturnType<PunchInSettings>
  handlePunchIn: (values: PunchInSettings) => void
  getWorkStatus: (attendance: boolean) => string
}

export const PunchInForm: FC<Props> = (props: Props) => {
  return (
    <form onSubmit={props.punchInForm.onSubmit(props.handlePunchIn)}>
      <Stack>
        <Checkbox
          description={''}
          label={'ステータス絵文字を変更する'}
          key={props.punchInForm.key('changeStatusEmoji')}
          {...props.punchInForm.getInputProps('changeStatusEmoji')}
        ></Checkbox>
        <Checkbox
          description={'デフォルトはテレワーク'}
          label={'出社時はチェック'}
          key={props.punchInForm.key('attendance')}
          {...props.punchInForm.getInputProps('attendance')}
        ></Checkbox>
        <Textarea
          label="追加メッセージ"
          description={'追加のメッセージを入力できます'}
          key={props.punchInForm.key('additionalMessage')}
          {...props.punchInForm.getInputProps('additionalMessage')}
        />
        <Group grow>
          <Button
            type={'submit'}
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
            color={'pink'}
            type={'submit'}
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
        <Title order={2} size={'sm'}>
          送信メッセージプレビュー
        </Title>
        <Card withBorder>
          <Text>
            {props.getWorkStatus(props.punchInForm.values.attendance)}
            開始 / 終了します
          </Text>
          <Text inherit style={{ whiteSpace: 'pre-wrap' }}>
            {props.punchInForm.values.additionalMessage}
          </Text>
        </Card>
      </Stack>
    </form>
  )
}
