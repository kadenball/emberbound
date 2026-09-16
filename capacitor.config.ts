import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.emberbound.game',
  appName: 'Emberbound',
  webDir: 'dist',
  backgroundColor: '#102422',
  android: { backgroundColor: '#102422' },
  ios: { backgroundColor: '#102422', contentInset: 'never' }
};
export default config;
