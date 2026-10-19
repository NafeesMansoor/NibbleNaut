declare const __APP_VERSION__: string;

/** App version, injected at build time from package.json (the single version source). */
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';
