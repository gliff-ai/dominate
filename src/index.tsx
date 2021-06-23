import ReactDOM from "react-dom";

import { ProvideAuth } from "@/hooks/use-auth";
import { UserInterface } from "@/ui";
import { DominateEtebase } from "@/etebase";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";
import LogRocket from "logrocket";
import setupLogRocketReact from "logrocket-react";

declare const STORE_URL: string;
declare const IS_MONITORED: boolean;
declare const SENTRY_ENVIRONMENT: string;
declare const IS_SENTRY_DEBUG: boolean;
declare const VERSION: string;
const version = VERSION;

if (IS_MONITORED) {
  // setup Sentry
  Sentry.init({
    dsn: "https://097ef1f6a3364e6895c2fcb95c88446a@o651808.ingest.sentry.io/5812330",
    tunnel: `${STORE_URL}api/tunnel/`,

    integrations: [
      //   new Integrations.BrowserTracing(),
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      new CaptureConsole({
        // options: ['log', 'info', 'warn', 'error', 'debug', 'assert']
        levels: ["assert"],
      }),
      /* eslint-enable @typescript-eslint/no-unsafe-call */
    ],

    release: `dominate@${version}`,

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,

    // flag for filtering
    environment: SENTRY_ENVIRONMENT,

    debug: IS_SENTRY_DEBUG,
  });

  // setup LogRocket
  setupLogRocketReact(LogRocket);
  LogRocket.init("ia4fn6/dominate", {
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

const etebaseInstance = new DominateEtebase();

ReactDOM.render(
  <Sentry.ErrorBoundary fallback="An error has occurred" showDialog>
    <ProvideAuth etebaseInstance={etebaseInstance}>
      <UserInterface etebaseInstance={etebaseInstance} />
    </ProvideAuth>
  </Sentry.ErrorBoundary>,
  document.getElementById("react-container")
);
