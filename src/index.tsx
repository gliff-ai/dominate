import ReactDOM from "react-dom";

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";
import LogRocket from "logrocket";
import setupLogRocketReact from "logrocket-react";
import { BrowserRouter } from "react-router-dom";
import { IntercomProvider } from "react-use-intercom";
import StylesProvider from "@mui/styles/StylesProvider";
import { generateClassName } from "@gliff-ai/style";
import { SentryErrorPage, BasicPage } from "@/views";

import { DominateStore, API_URL } from "@/store";
import UserInterface from "@/ui";
import { ProvideAuth } from "@/hooks";

const IS_MONITORED = import.meta.env.VITE_IS_MONITORED === "true";

const INTERCOM_APP_ID = "fhkh0l1p";

// User info is added in the `use-auth` hook
if (IS_MONITORED) {
  const VERSION = import.meta.env.VITE_VERSION;
  const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT;
  const IS_SENTRY_DEBUG = import.meta.env.VITE_IS_SENTRY_DEBUG;
  const LOGROCKET_PROJECT = import.meta.env.VITE_LOGROCKET_PROJECT;

  // setup Sentry
  Sentry.init({
    dsn: "https://097ef1f6a3364e6895c2fcb95c88446a@o651808.ingest.sentry.io/5812330",
    tunnel: `${API_URL}/tunnel/`,

    integrations: [
      new Integrations.BrowserTracing(),
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      new CaptureConsole({
        // options: ['log', 'info', 'warn', 'error', 'debug', 'assert']
        levels: ["error", "assert"],
      }),
      /* eslint-enable @typescript-eslint/no-unsafe-call */
    ],

    release: `dominate@${VERSION || "0.0.0"}`,

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,

    // flag for filtering
    environment: SENTRY_ENVIRONMENT,

    debug: IS_SENTRY_DEBUG === "true",
  });

  // setup LogRocket
  setupLogRocketReact(LogRocket);
  LogRocket.init(`ia4fn6/${LOGROCKET_PROJECT || ""}`, {
    dom: {
      textSanitizer: true,
      inputSanitizer: true,
    },
  });

  // add LogRocket sessions to Sentry issues
  LogRocket.getSessionURL((sessionURL) => {
    Sentry.configureScope((scope) => {
      scope.setExtra("sessionURL", sessionURL);
    });
  });
}

const storeInstance = new DominateStore();

ReactDOM.render(
  <BrowserRouter>
    <Sentry.ErrorBoundary
      fallback={<BasicPage view={<SentryErrorPage />} title={<>Oops!</>} />}
      showDialog
    >
      <IntercomProvider appId={INTERCOM_APP_ID} autoBoot>
        <ProvideAuth storeInstance={storeInstance} logrocket={LogRocket}>
          <StylesProvider generateClassName={generateClassName("dominate")}>
            <UserInterface storeInstance={storeInstance} />
          </StylesProvider>
        </ProvideAuth>
      </IntercomProvider>
    </Sentry.ErrorBoundary>
  </BrowserRouter>,

  document.getElementById("react-container")
);
