declare global {
  interface IntlMessages {
    metadata: Record<string, string>;
    navigation: Record<string, string>;
    theme: Record<string, string>;
    language: Record<string, string>;
    home: Record<string, string | Record<string, string>>;
    dashboard: Record<string, string | Record<string, string>>;
    common: Record<string, string>;
  }
}

export {};
