import { type Locale } from './i18n/request';

declare global {
  interface IntlMessages {
    metadata: any;
    navigation: any;
    theme: any;
    language: any;
    home: any;
    dashboard: any;
    common: any;
  }
}

export {};
