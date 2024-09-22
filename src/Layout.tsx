import { AppShell, Container, Group, Title } from '@mantine/core'
import React, { FC } from 'react'
import { User } from './components'

type Props = {
  children: React.ReactNode
}

export const Layout: FC<Props> = (props: Props) => {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group justify="center" h="100%" px="md">
          <Title order={1} size="h3">
            Punch
          </Title>
          <User />
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container>{props.children}</Container>
      </AppShell.Main>
    </AppShell>
  )
}
