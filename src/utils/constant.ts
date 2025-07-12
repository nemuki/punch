import { randomId } from '@mantine/hooks'
import { AppSettings } from '../types'
import { env } from './env.ts'

const slackOauthAuthorizeUrl = new URL('https://slack.com/oauth/v2/authorize')
slackOauthAuthorizeUrl.searchParams.append('client_id', env.SLACK_CLIENT_ID)
slackOauthAuthorizeUrl.searchParams.append('scope', '')
slackOauthAuthorizeUrl.searchParams.append(
  'redirect_uri',
  env.SLACK_REDIRECT_URI,
)
slackOauthAuthorizeUrl.searchParams.append(
  'user_scope',
  'channels:history,channels:read,users.profile:read,users.profile:write,chat:write',
)

const slackOauthTokenLocalStorageKey: string = 'punch-slack-oauth-token'
const appSettingsLocalStorageKey: string = 'punch-app-settings'

const defaultAppSettings: AppSettings = {
  conversations: [
    {
      id: randomId(),
      channelId: '',
      searchMessage: '',
    },
  ],
  status: {
    emoji: {
      office: ':office:',
      telework: ':house_with_garden:',
      leave: ':soon:',
    },
    text: {
      office: '出社しています',
      telework: 'テレワーク',
      leave: '退勤しています',
    },
  },
  messages: {
    workTypes: {
      office: '業務',
      telework: 'テレワーク',
    },
    actions: {
      start: '開始します',
      end: '終了します',
    },
  },
}

export const applicationConstants = {
  slackOauthAuthorizeUrl: slackOauthAuthorizeUrl.toString(),
  defaultAppSettings,
  slackOauthTokenLocalStorageKey,
  appSettingsLocalStorageKey,
} as const
