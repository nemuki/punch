import { useCallback } from 'react'
import useSWR from 'swr'
import { getConversations } from '../infra/repository/slack.ts'
import { AppSettings, RawSlackConversations } from '../types'
import { isLocalStorageValid } from '../utils'

interface UseConversationsSWRProps {
  appSettings: AppSettings
  accessToken?: string
  authIsLoading: boolean
}

interface UseConversationsSWRReturn {
  slackConversations: RawSlackConversations | undefined
  isConversationsFetching: boolean
  shouldOpenSettings: boolean
  fetchConversations: (
    conversations: AppSettings['conversations'],
  ) => Promise<RawSlackConversations | undefined>
  mutateConversations: () => Promise<RawSlackConversations | undefined>
}

// Create a unique key that includes the current date to ensure fresh data each day
const createSwrKey = (
  conversations: AppSettings['conversations'],
  accessToken?: string,
): string | null => {
  if (!accessToken || !conversations?.length) {
    return null
  }

  // Include current date (YYYY-MM-DD) to ensure fresh data each day
  const today = new Date().toISOString().split('T')[0]
  const conversationIds = conversations
    .map((c) => c.id)
    .sort()
    .join(',')

  return `conversations-${today}-${conversationIds}`
}

// SWR fetcher function
const conversationsFetcher = async ([_key, conversations, accessToken]: [
  string,
  AppSettings['conversations'],
  string,
]): Promise<RawSlackConversations> => {
  return await getConversations({
    conversations,
    accessToken,
  })
}

export const useConversationsSWR = ({
  appSettings,
  accessToken,
  authIsLoading,
}: UseConversationsSWRProps): UseConversationsSWRReturn => {
  const isValidSettings = isLocalStorageValid(appSettings)
  const hasChannelId = appSettings.conversations?.[0]?.channelId
  const shouldOpenSettings = !hasChannelId && !authIsLoading && isValidSettings

  // Create SWR key
  const swrKey = createSwrKey(appSettings.conversations, accessToken)

  // Use SWR for conversation fetching with auto-refresh configurations
  const {
    data: slackConversations,
    isLoading,
    mutate,
  } = useSWR(
    swrKey ? [swrKey, appSettings.conversations, accessToken] : null,
    conversationsFetcher,
    {
      // Refresh when window gets focus (returning from idle)
      revalidateOnFocus: true,
      // Refresh when network reconnects
      revalidateOnReconnect: true,
      // Optionally refresh every 30 minutes to stay fresh
      refreshInterval: 30 * 60 * 1000,
      // Don't fetch if auth is still loading or settings are invalid
      isPaused: () => authIsLoading || !isValidSettings || !accessToken,
      // Keep previous data while revalidating
      keepPreviousData: true,
      // Retry on error
      shouldRetryOnError: true,
      errorRetryCount: 3,
      // Use exponential backoff for retries
      errorRetryInterval: 5000,
    },
  )

  // Manual fetch function for backward compatibility
  const fetchConversations = useCallback(
    async (
      conversations: AppSettings['conversations'],
    ): Promise<RawSlackConversations | undefined> => {
      if (!accessToken || !isValidSettings) {
        return undefined
      }

      try {
        const result = await getConversations({
          conversations,
          accessToken,
        })

        // Update SWR cache with new data
        mutate(result, false)

        return result
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
        return undefined
      }
    },
    [accessToken, isValidSettings, mutate],
  )

  // Expose mutate function for manual revalidation
  const mutateConversations = useCallback(() => {
    return mutate()
  }, [mutate])

  return {
    slackConversations,
    isConversationsFetching: isLoading,
    shouldOpenSettings,
    fetchConversations,
    mutateConversations,
  }
}
