import { Anchor, AppShell, Container, Group, Title } from '@mantine/core'
import React, { FC } from 'react'
import { User } from './components'
import { env } from './utils'

type Props = {
  children: React.ReactNode
}

export const Layout: FC<Props> = (props: Props) => {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group justify="center" h="100%" px="md">
          <Title order={1} size="h3">
            Punch 👊
          </Title>
          <Anchor href={env.MAINTAINER_URL} target={'_blank'}>
            Maintainer
          </Anchor>
          <Anchor href={env.USAGE_URL} target={'_blank'}>
            Usage
          </Anchor>
          <User />
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container>{props.children}</Container>
      </AppShell.Main>
    </AppShell>
  )
}
