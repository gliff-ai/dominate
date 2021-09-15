import { useState } from "react";
import ReactCookieConsentDefault from "react-cookie-consent";
import { theme } from "@gliff-ai/style";
import { MessageAlert } from "./message/MessageAlert";

function CookieConsent(): JSX.Element {
  // TODO: patch this
  // https://github.com/Mastermindzh/react-cookie-consent/issues/110
  /* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-assignment */
  const ReactCookieConsent =
    /* @ts-ignore */
    ReactCookieConsentDefault.default || ReactCookieConsentDefault;
  /* eslint-enable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-assignment */

  const [isCookiesConsented, setIsCookiesConsented] = useState("");
  return (
    <>
      <MessageAlert severity="error" message={isCookiesConsented} />
      <ReactCookieConsent
        location="bottom"
        cookieName="gliff-ai-consent-cookie"
        expires={999}
        overlay
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
        }}
        buttonStyle={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.text.primary,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "15px",
          width: "169px",
          marginBottom: "20px",
          marginTop: "20px",
          borderRadius: "9px",
        }}
        declineButtonStyle={{
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.text.primary,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "15px",
          width: "169px",
          marginBottom: "20px",
          marginTop: "20px",
          borderRadius: "9px",
        }}
        enableDeclineButton
        setDeclineCookie={false}
        onDecline={() => {
          setIsCookiesConsented(
            "Without cookies this app will not work, redirecting you to our homepage."
          );
          setTimeout(() => window.location.replace("https://gliff.ai"), 1500);
        }}
      >
        This website uses cookies to enhance the user experience (we don&apos;t
        use tracking or advertising cookies).
      </ReactCookieConsent>
    </>
  );
}

export { CookieConsent };
