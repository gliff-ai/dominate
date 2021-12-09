interface ImportMeta {
  env: {
    VITE_STORE_URL: string;
    VITE_STRIPE_KEY: string;
    VITE_IS_MONITORED: string;
    VITE_SENTRY_ENVIRONMENT?:
      | "local"
      | "development"
      | "staging"
      | "production";
    VITE_IS_SENTRY_DEBUG?: string;
    VITE_VERSION?: string;
    LOGROCKET_PROJECT?: string;
  };
}
