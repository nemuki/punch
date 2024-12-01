import { Button, Collapse, Grid, Stack } from "@mantine/core";
import {
  readLocalStorageValue,
  useDisclosure,
  useLocalStorage,
} from "@mantine/hooks";
import {
  ConversationsHistoryResponse,
  ConversationsInfoResponse,
} from "@slack/web-api";
import { useEffect, useMemo, useState } from "react";
import {
  AuthError,
  LocalStorageError,
  PunchInForm,
  SlackChannelAndConversation,
  SlackConversationSetting,
  SlackEmojiSetting,
} from "./components";
import {
  ConversationSettingFormProvider,
  StatusEmojiSettingFormProvider,
  useConversationSettingForm,
  usePunchInSettingForm,
  useStatusEmojiSettingForm,
} from "./context/form-context.ts";
import { useAuth } from "./hooks/useAuth.tsx";
import {
  getConversations,
  postMessage,
  updateEmoji,
} from "./infra/repository/slack.ts";
import { AppSettings, PunchInSettings } from "./types";
import { applicationConstants, isLocalStorageValid } from "./utils";

function App() {
  const { authErrorMessage, slackOauthToken } = useAuth();

  // State
  const [
    isSettingsOpen,
    { toggle: toggleSettingsOpen, open: setIsSettingsOpen },
  ] = useDisclosure(false);
  const [hasLocalStorageError, setHasLocalStorageError] = useState(false);
  const [isConversationsFetching, setIsConversationsFetching] = useState(true);
  const [conversationsHistory, setConversationsHistory] = useState<
    ConversationsHistoryResponse | undefined
  >(undefined);
  const [conversationsInfo, setConversationsInfo] = useState<
    ConversationsInfoResponse | undefined
  >(undefined);
  const [
    localStorageAppSettings,
    setLocalStorageAppSettings,
    removeLocalStorageAppSettings,
  ] = useLocalStorage<AppSettings>({
    key: applicationConstants.appSettingsLocalStorageKey,
    defaultValue: readLocalStorageValue<AppSettings>({
      key: applicationConstants.appSettingsLocalStorageKey,
      defaultValue: applicationConstants.defaultAppSettings,
    }),
  });

  // form
  const conversationSettingForm = useConversationSettingForm({
    mode: "uncontrolled",
    initialValues: localStorageAppSettings.conversations,
  });
  const statusEmojiSettingForm = useStatusEmojiSettingForm({
    mode: "uncontrolled",
    initialValues: localStorageAppSettings.status,
  });
  const punchInForm = usePunchInSettingForm({
    mode: "controlled",
    initialValues: {
      changeStatusEmoji: false,
      inOffice: false,
      additionalMessage: "",
      punchIn: undefined,
    },
  });

  const filteredConversations = useMemo(() => {
    return conversationsHistory?.messages
      ?.filter((message) => message.type === "message")
      .filter((message) =>
        message?.text?.includes(
          conversationSettingForm.getValues().searchMessage
        )
      )[0];
  }, [conversationsHistory]);

  const getWorkStatus = (attendance: boolean): string =>
    attendance ? "業務" : "テレワーク";

  const createPunchInStartMessage = (values: PunchInSettings) => {
    const baseMessage = getWorkStatus(values.inOffice);
    return `${baseMessage}開始します\n${values.additionalMessage}`;
  };

  const createPunchInEndMessage = (values: PunchInSettings) => {
    const baseMessage = getWorkStatus(values.inOffice);
    return `${baseMessage}終了します\n${values.additionalMessage}`;
  };

  const handleSubmitConversationSettingForm = async (
    values: typeof conversationSettingForm.values
  ) => {
    const result = await getConversations({
      channelId: values.channelId,
      searchMessage: values.searchMessage,
      accessToken: slackOauthToken.accessToken,
    });

    setConversationsInfo(result.conversationsInfo);
    setConversationsHistory(result.conversationsHistory);

    setLocalStorageAppSettings((prev) => ({
      ...prev,
      conversations: values,
    }));
  };

  const handleSubmitStatusEmojiSettingsForm = (
    values: typeof statusEmojiSettingForm.values
  ) => {
    setLocalStorageAppSettings((prev) => ({
      ...prev,
      status: values,
    }));
  };

  /**
   * 出勤時の関数
   */
  const handleSubmitPunchInForm = (values: typeof punchInForm.values) => {
    if (values.punchIn === undefined) {
      return;
    }

    const channelId = localStorageAppSettings.conversations.channelId;

    const nineHoursLater = new Date();
    nineHoursLater.setHours(nineHoursLater.getHours() + 9);
    const nineHoursLaterUnixTime = Math.floor(nineHoursLater.getTime() / 1000);

    const midnight = new Date();
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const midnightUnixTime = Math.floor(midnight.getTime() / 1000);

    if (values.punchIn === "start") {
      // 出社時の処理
      if (values.changeStatusEmoji) {
        // ステータス絵文字を変更する
        if (values.inOffice) {
          updateEmoji({
            statusEmoji: localStorageAppSettings.status.emoji.office,
            statusText: localStorageAppSettings.status.text.office,
            statusExpiration: nineHoursLaterUnixTime,
            accessToken: slackOauthToken.accessToken,
          });
        } else {
          updateEmoji({
            statusEmoji: localStorageAppSettings.status.emoji.telework,
            statusText: localStorageAppSettings.status.text.telework,
            statusExpiration: nineHoursLaterUnixTime,
            accessToken: slackOauthToken.accessToken,
          });
        }
      }

      postMessage({
        channelId,
        message: createPunchInStartMessage(values),
        threadTs: filteredConversations?.ts,
        accessToken: slackOauthToken.accessToken,
      });
    } else if (values.punchIn === "end") {
      // 退勤時の処理
      if (values.changeStatusEmoji) {
        // ステータス絵文字を変更する
        updateEmoji({
          statusEmoji: localStorageAppSettings.status.emoji.leave,
          statusText: localStorageAppSettings.status.text.leave,
          statusExpiration: midnightUnixTime,
          accessToken: slackOauthToken.accessToken,
        });
      }

      postMessage({
        channelId,
        message: createPunchInEndMessage(values),
        threadTs: filteredConversations?.ts,
        accessToken: slackOauthToken.accessToken,
      });
    }
  };

  /**
   * 初回アクセス時の処理
   */
  useEffect(() => {
    (async () => {
      if (conversationSettingForm.values.channelId) {
        const result = await getConversations({
          channelId: conversationSettingForm.values.channelId,
          searchMessage: conversationSettingForm.values.searchMessage,
          accessToken: slackOauthToken.accessToken,
        });

        setConversationsInfo(result.conversationsInfo);
        setConversationsHistory(result.conversationsHistory);
      } else {
        setIsSettingsOpen();
      }

      setIsConversationsFetching(false);

      if (!isLocalStorageValid(localStorageAppSettings)) {
        setHasLocalStorageError(true);
      }
    })();
  }, []);

  // Render
  if (Object.keys(slackOauthToken).length === 0) {
    return (
      <Button
        component={"a"}
        href={applicationConstants.slackOauthAuthorizeUrl}
      >
        Login with Slack
      </Button>
    );
  }

  if (hasLocalStorageError) {
    return (
      <LocalStorageError
        localStorageAppSettings={localStorageAppSettings}
        removeLocalStorageAppSettings={removeLocalStorageAppSettings}
      />
    );
  }

  if (authErrorMessage) {
    return <AuthError message={authErrorMessage} />;
  }

  return (
    <Grid>
      <Grid.Col span={6}>
        <Stack>
          <SlackChannelAndConversation
            conversationsInfo={conversationsInfo}
            conversations={filteredConversations}
            isFetching={isConversationsFetching}
          />
          <Button onClick={toggleSettingsOpen}>Slack設定を開く</Button>
          <Collapse in={isSettingsOpen}>
            <Stack>
              <ConversationSettingFormProvider form={conversationSettingForm}>
                <form
                  onSubmit={conversationSettingForm.onSubmit(
                    handleSubmitConversationSettingForm
                  )}
                >
                  <SlackConversationSetting />
                </form>
              </ConversationSettingFormProvider>
              <StatusEmojiSettingFormProvider form={statusEmojiSettingForm}>
                <form
                  onSubmit={statusEmojiSettingForm.onSubmit(
                    handleSubmitStatusEmojiSettingsForm
                  )}
                >
                  <SlackEmojiSetting />
                </form>
              </StatusEmojiSettingFormProvider>
            </Stack>
          </Collapse>
        </Stack>
      </Grid.Col>
      <Grid.Col span={6}>
        <PunchInForm
          punchInForm={punchInForm}
          handleSubmitPunchInForm={handleSubmitPunchInForm}
          getWorkStatus={getWorkStatus}
        />
      </Grid.Col>
    </Grid>
  );
}

export default App;
