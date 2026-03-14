import { readLocalStorageValue, useLocalStorage } from '@mantine/hooks'
import { UsersProfileGetResponse } from '@slack/web-api'
import React, { FC, useEffect, useState } from 'react'
import {
  fetchToken,
  fetchUserProfile,
  revokeToken,
} from '../infra/api/slack.ts'
import { applicationConstants, env } from '../utils'

type SlackOauthToken = {
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}

type AuthContextProps = {
  authIsLoading: boolean
  authErrorMessage: string | undefined
  slackOauthToken: SlackOauthToken
  userProfile: UsersProfileGetResponse | undefined
  handleLogout: () => void
  handleRemoveLocalStorageSlackOauthToken: () => void
}

type AuthProviderProps = {
  children: React.ReactNode
}

export const AuthContext = React.createContext<AuthContextProps | undefined>(
  undefined,
)

export const AuthProvider: FC<AuthProviderProps> = (
  props: AuthProviderProps,
) => {
  const [authIsLoading, setAuthIsLoading] = useState<boolean>(true)
  const [authErrorMessage, setAuthErrorMessage] = useState<string | undefined>(
    undefined,
  )
  const [userProfile, setUserProfile] = useState<
    UsersProfileGetResponse | undefined
  >(undefined)

  const [
    localStorageSlackOauthToken,
    setLocalStorageSlackOauthToken,
    removeLocalStorageSlackOauthToken,
  ] = useLocalStorage<SlackOauthToken>({
    key: applicationConstants.slackOauthTokenLocalStorageKey,
    defaultValue: readLocalStorageValue<SlackOauthToken>({
      key: applicationConstants.slackOauthTokenLocalStorageKey,
      defaultValue: {},
    }),
  })

  const urlSearchParams = new URLSearchParams(window.location.search)
  const oauthAuthorizationCode = urlSearchParams.get('code')

  const millisecondsInSecond = 1000
  const currentTimestamp = Date.now() / millisecondsInSecond

  /**
   * 初回アクセス時の処理
   */
  useEffect(() => {
    // 開発モードの場合は処理をスキップ
    if (env.DEV_MODE) {
      setAuthIsLoading(false)
      return
    }

    // ログイン情報がない場合は何もしない
    if (
      oauthAuthorizationCode === null &&
      Object.keys(localStorageSlackOauthToken).length === 0
    ) {
      setAuthIsLoading(false)
      return
    }
    ;(async () => {
      if (oauthAuthorizationCode) {
        await getAuthorizationToken()
      } else {
        const isAuth = await getRefreshToken()

        if (isAuth) {
          await getUserProfile()
        }
      }
    })()

    setAuthIsLoading(false)
  }, [oauthAuthorizationCode, localStorageSlackOauthToken])

  // 開発モードの場合は認証をバイパス
  if (env.DEV_MODE) {
    const mockUserProfile: UsersProfileGetResponse = {
      ok: true,
      profile: {
        title: 'Developer',
        phone: '',
        skype: '',
        real_name: '開発者',
        real_name_normalized: '開発者',
        display_name: '開発者',
        display_name_normalized: '開発者',
        fields: undefined,
        status_text: '',
        status_emoji: '',
        status_expiration: 0,
        avatar_hash: '',
        image_original: '',
        is_custom_image: false,
        first_name: '開発',
        last_name: '者',
        image_24: '',
        image_32: '',
        image_48: '',
        image_72: '',
        image_192: '',
        image_512: '',
        image_1024: '',
        status_text_canonical: '',
      },
    }

    const mockSlackOauthToken: SlackOauthToken = {
      accessToken: 'dev-mode-token',
      refreshToken: 'dev-mode-refresh-token',
      expiresAt: Date.now() / 1000 + 86400, // 24時間後
    }

    const value: AuthContextProps = {
      authIsLoading: false,
      authErrorMessage: undefined,
      slackOauthToken: mockSlackOauthToken,
      userProfile: mockUserProfile,
      handleLogout: () => {
        console.log('開発モード: ログアウト処理は実行されません')
      },
      handleRemoveLocalStorageSlackOauthToken: () => {
        console.log('開発モード: LocalStorage の削除は実行されません')
      },
    }

    return (
      <AuthContext.Provider value={value}>
        {props.children}
      </AuthContext.Provider>
    )
  }

  const handleSetError = (
    message: string,
    error: string | undefined | unknown,
  ) => {
    setAuthErrorMessage(`${message} ${error}`)
    console.error({ message, error })
    setAuthIsLoading(false)
  }

  /**
   * LocalStorage の Slack OAuth トークンを削除する
   */
  const handleRemoveLocalStorageSlackOauthToken = () => {
    removeLocalStorageSlackOauthToken()
    window.location.reload()
  }

  /**
   * ログアウト処理
   */
  const handleLogout = async () => {
    if (!localStorageSlackOauthToken.accessToken) {
      handleRemoveLocalStorageSlackOauthToken()
      return
    }

    const errorMessage = 'トークン削除処理でエラーが発生しました'

    try {
      const response = await revokeToken({
        accessToken: localStorageSlackOauthToken.accessToken,
      })

      if (!response.ok) {
        handleSetError(errorMessage, response.error)
        return
      }
    } catch (error) {
      handleSetError(errorMessage, error)
      return
    }

    handleRemoveLocalStorageSlackOauthToken()
  }

  /**
   * アクセストークンを取得する
   */
  const getAuthorizationToken = async () => {
    if (!oauthAuthorizationCode) {
      return
    }

    const errorMessage = '認可コード取得処理でエラーが発生しました'

    try {
      const response = await fetchToken({
        grantType: 'authorization_code',
        token: oauthAuthorizationCode,
      })

      if (!response.ok) {
        setAuthErrorMessage(`${errorMessage} ${response.error}`)
        return
      }

      if (!response.authed_user?.access_token) {
        handleSetError(
          errorMessage,
          'access_token がレスポンスに含まれていません',
        )
        return
      }

      if (!response.authed_user?.refresh_token) {
        handleSetError(
          errorMessage,
          'refresh_token がレスポンスに含まれていません',
        )
        return
      }

      if (!response.authed_user?.expires_in) {
        handleSetError(
          errorMessage,
          'expires_in がレスポンスに含まれていません',
        )
        return
      }

      setLocalStorageSlackOauthToken({
        accessToken: response.authed_user.access_token,
        refreshToken: response.authed_user.refresh_token,
        expiresAt: currentTimestamp + response.authed_user.expires_in,
      })

      window.location.href = env.SLACK_REDIRECT_URI
    } catch (error) {
      handleSetError(errorMessage, error)
    }
  }

  /**
   * リフレッシュトークンを取得する
   */
  const getRefreshToken = async (): Promise<boolean | undefined> => {
    const { refreshToken, expiresAt } = localStorageSlackOauthToken

    if (!refreshToken) {
      return false
    }

    const isTokenExpired = expiresAt && expiresAt < currentTimestamp

    console.info({ isTokenExpired, expiresAt, currentTimestamp })

    if (!isTokenExpired) {
      return true
    }

    const errorMessage = 'リフレッシュトークン取得処理でエラーが発生しました'

    try {
      const response = await fetchToken({
        grantType: 'refresh_token',
        token: refreshToken,
      })

      if (!response.ok) {
        handleSetError(errorMessage, response.error)
        return false
      }

      setLocalStorageSlackOauthToken({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: response.expires_in
          ? currentTimestamp + response.expires_in
          : undefined,
      })

      window.location.reload()
    } catch (error) {
      handleSetError(errorMessage, error)
    }

    return undefined
  }

  /**
   * ユーザ情報を取得する
   */
  const getUserProfile = async () => {
    if (!localStorageSlackOauthToken.accessToken) {
      return
    }

    const errorMessage = 'ユーザ情報取得処理でエラーが発生しました'

    try {
      const response = await fetchUserProfile({
        accessToken: localStorageSlackOauthToken.accessToken,
      })

      if (!response.ok) {
        handleSetError(errorMessage, response.error)
        return
      }

      setUserProfile(response)
    } catch (error) {
      handleSetError(errorMessage, error)
    }
  }

  const value: AuthContextProps = {
    authIsLoading,
    authErrorMessage,
    slackOauthToken: localStorageSlackOauthToken,
    userProfile,
    handleLogout,
    handleRemoveLocalStorageSlackOauthToken,
  }

  return (
    <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
  )
}
