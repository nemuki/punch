import { Anchor } from '@mantine/core'
import { env } from '../utils'

export const Maintainer = () => {
  return (
    <>
      {env.USAGE_URL && (
        <Anchor href={env.USAGE_URL} target="_blank">
          使い方
        </Anchor>
      )}
      {env.INQUIRY_CHANNEL_URL && (
        <Anchor href={env.INQUIRY_CHANNEL_URL} target="_blank">
          問い合わせ
        </Anchor>
      )}
    </>
  )
}
