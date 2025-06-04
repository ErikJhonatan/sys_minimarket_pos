const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  appName: import.meta.env.VITE_APP_NAME || 'MyApp',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  nameItemJwt: import.meta.env.VITE_NAME_ITEM_JWT
}
export default config;
