import { Anchor } from '@mantine/core'
import { env } from '../utils'

export const Maintainer = () => {
  return (
    <>
      {env.MAINTAINER_URL && (
        <Anchor href={env.MAINTAINER_URL} target="_blank">
          作ってる人
        </Anchor>
      )}
      {env.USAGE_URL && (
        <Anchor href={env.USAGE_URL} target="_blank">
          使い方
        </Anchor>
      )}
    </>
  )
}
