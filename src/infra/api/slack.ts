import {
  AuthRevokeResponse,
  ConversationsHistoryResponse,
  ConversationsInfoResponse,
  OauthV2AccessResponse,
  UsersProfileGetResponse,
} from '@slack/web-api'
import { env } from '../../utils'

const slackApiBaseUrl = 'https://slack.com/api'

/**
 * Slackの oauth.v2.access APIを呼び出す
 * https://api.slack.com/methods/oauth.v2.access
 *
 * @param args
 */
export async function fetchToken(args: {
  grantType: 'authorization_code' | 'refresh_token'
  token: string
}): Promise<OauthV2AccessResponse> {
  const params = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID,
    client_secret: env.SLACK_CLIENT_SECRET,
    redirect_uri: env.SLACK_REDIRECT_URI,
    grant_type: args.grantType,
  })

  switch (args.grantType) {
    case 'authorization_code':
      params.append('code', args.token)
      break
    case 'refresh_token':
      params.append('refresh_token', args.token)
      break
  }

  const response = await fetch(`${slackApiBaseUrl}/oauth.v2.access`, {
    method: 'POST',
    body: params,
  })

  return response.json()
}

/**
 * Slackの auth.revoke APIを呼び出す
 * https://api.slack.com/methods/auth.revoke
 *
 * @param args
 */
export const revokeToken = async (args: {
  accessToken: string
}): Promise<AuthRevokeResponse> => {
  const formData = new FormData()
  formData.append('token', args.accessToken)

  return fetch(`${slackApiBaseUrl}/auth.revoke`, {
    method: 'POST',
    body: formData,
  })
}

/**
 * Slackの users.profile.get APIを呼び出す
 * https://api.slack.com/methods/users.profile.get
 *
 * @param args
 */
export const fetchUserProfile = async (args: {
  accessToken: string
}): Promise<UsersProfileGetResponse> => {
  const formData = new FormData()
  formData.append('token', args.accessToken)

  const response = await fetch(`${slackApiBaseUrl}/users.profile.get`, {
    method: 'POST',
    body: formData,
  })

  return response.json()
}

/**
 * Slackの conversations.history APIを呼び出す
 * https://api.slack.com/methods/conversations.history
 *
 * @param args
 */
export const fetchConversationsHistory = async (args: {
  accessToken: string
  channelId: string
}): Promise<ConversationsHistoryResponse> => {
  const formData = new FormData()
  formData.append('token', args.accessToken)
  formData.append('channel', args.channelId)

  const todayAm6 = new Date()
  todayAm6.setHours(6, 0, 0, 0)
  const todayAm6UnixTime = Math.floor(todayAm6.getTime() / 1000)

  formData.append('oldest', todayAm6UnixTime.toString())

  const response = await fetch(`${slackApiBaseUrl}/conversations.history`, {
    method: 'POST',
    body: formData,
  })

  return response.json()
}

/**
 * Slackの conversations.info APIを呼び出す
 * https://api.slack.com/methods/conversations.info
 *
 * @param args
 */
export const fetchConversationsInfo = async (args: {
  accessToken: string
  channelId: string
}): Promise<ConversationsInfoResponse> => {
  const formData = new FormData()
  formData.append('token', args.accessToken)
  formData.append('channel', args.channelId)

  const response = await fetch(`${slackApiBaseUrl}/conversations.info`, {
    method: 'POST',
    body: formData,
  })

  return response.json()
}

/**
 * Slackの chat.postMessage APIを呼び出す
 * https://api.slack.com/methods/chat.postMessage
 *
 * @param args
 */
export const chatPostMessage = async (args: {
  accessToken: string
  channelId: string
  message: string
  threadTs?: string
}): Promise<Response> => {
  const formData = new FormData()
  formData.append('token', args.accessToken)
  formData.append('channel', args.channelId)
  formData.append('text', args.message)
  formData.append('unfurl_media', 'false')

  if (args.threadTs) {
    formData.append('thread_ts', args.threadTs)
  }

  return fetch(`${slackApiBaseUrl}/chat.postMessage`, {
    method: 'POST',
    body: formData,
  })
}

/**
 * Slackの users.profile.set APIを呼び出す
 *
 * @param args
 */
export const updateStatusEmoji = async (args: {
  accessToken: string
  statusEmoji: string
  statusText: string
  statusExpiration: number
}): Promise<Response> => {
  const formData = new FormData()
  formData.append('token', args.accessToken)
  formData.append(
    'profile',
    JSON.stringify({
      status_emoji: args.statusEmoji,
      status_text: args.statusText,
      status_expiration: args.statusExpiration,
    }),
  )

  return fetch(`${slackApiBaseUrl}/users.profile.set`, {
    method: 'POST',
    body: formData,
  })
}
