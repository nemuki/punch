import { useCallback, useEffect, useState } from 'react'
import { getConversations } from '../infra/repository/slack.ts'
import { AppSettings, RawSlackConversations } from '../types'
import { isLocalStorageValid } from '../utils'

interface UseConversationsProps {
  appSettings: AppSettings
  accessToken?: string
  authIsLoading: boolean
}

interface UseConversationsReturn {
  slackConversations: RawSlackConversations | undefined
  isConversationsFetching: boolean
  shouldOpenSettings: boolean
  fetchConversations: (
    conversations: AppSettings['conversations'],
  ) => Promise<RawSlackConversations | undefined>
}

export const useConversations = ({
  appSettings,
  accessToken,
  authIsLoading,
}: UseConversationsProps): UseConversationsReturn => {
  const [slackConversations, setSlackConversations] = useState<
    RawSlackConversations | undefined
  >(undefined)
  const [isConversationsFetching, setIsConversationsFetching] = useState(true)
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false)

  const fetchConversations = useCallback(
    async (
      conversations: AppSettings['conversations'],
    ): Promise<RawSlackConversations | undefined> => {
      if (!accessToken || !isLocalStorageValid(appSettings)) {
        return undefined
      }

      try {
        const result = await getConversations({
          conversations,
          accessToken,
        })
        setSlackConversations(result)
        return result
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
        return undefined
      }
    },
    [accessToken, appSettings],
  )

  // Initialize conversations on first load
  useEffect(() => {
    if (authIsLoading || !isLocalStorageValid(appSettings)) {
      return
    }

    const initializeConversations = async () => {
      setIsConversationsFetching(true)

      const hasChannelId = appSettings.conversations?.[0]?.channelId

      if (hasChannelId && accessToken) {
        await fetchConversations(appSettings.conversations)
      } else {
        setShouldOpenSettings(true)
      }

      setIsConversationsFetching(false)
    }

    initializeConversations()
  }, [authIsLoading, accessToken, appSettings, fetchConversations])

  return {
    slackConversations,
    isConversationsFetching,
    shouldOpenSettings,
    fetchConversations,
  }
}
