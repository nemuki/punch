import { Button, Group, Stack, TextInput, Title } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { FC } from 'react'
import { StatusEmojiSettings } from '../types'

type Props = {
  statusEmojiSettingsForm: UseFormReturnType<StatusEmojiSettings>
  handleSubmit: (values: StatusEmojiSettings) => void
}

export const SlackEmojiSettings: FC<Props> = (props: Props) => {
  return (
    <form onSubmit={props.statusEmojiSettingsForm.onSubmit(props.handleSubmit)}>
      <Stack>
        <Title order={2} size={'sm'}>
          Slack絵文字設定
        </Title>
        <Group grow>
          <TextInput
            label="出社時の絵文字"
            key={props.statusEmojiSettingsForm.key('emoji.office')}
            {...props.statusEmojiSettingsForm.getInputProps('emoji.office')}
          />
          <TextInput
            label="出社時の絵文字メッセージ"
            key={props.statusEmojiSettingsForm.key('text.office')}
            {...props.statusEmojiSettingsForm.getInputProps('text.office')}
          />
        </Group>
        <Group grow>
          <TextInput
            label="テレワーク時の絵文字"
            key={props.statusEmojiSettingsForm.key('emoji.telework')}
            {...props.statusEmojiSettingsForm.getInputProps('emoji.telework')}
          />
          <TextInput
            label="テレワーク時の絵文字メッセージ"
            key={props.statusEmojiSettingsForm.key('text.telework')}
            {...props.statusEmojiSettingsForm.getInputProps('text.telework')}
          />
        </Group>
        <Group grow>
          <TextInput
            label="退勤時の絵文字"
            key={props.statusEmojiSettingsForm.key('emoji.leave')}
            {...props.statusEmojiSettingsForm.getInputProps('emoji.leave')}
          />
          <TextInput
            label="退勤時の絵文字メッセージ"
            key={props.statusEmojiSettingsForm.key('text.leave')}
            {...props.statusEmojiSettingsForm.getInputProps('text.leave')}
          />
        </Group>
        <Button type={'submit'} w={'fit-content'}>
          保存
        </Button>
      </Stack>
    </form>
  )
}
