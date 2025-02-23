import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Layout } from "./Layout";
import { AppRoot } from "./AppRoot";
import { AuthProvider } from "./context/AuthContext";

const theme = createTheme({
  fontFamily:
    "Helvetica Neue, Arial, Hiragino Kaku Gothic ProN, Hiragino Sans, Meiryo, sans-serif",
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AuthProvider>
        <Layout>
          <AppRoot />
        </Layout>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
