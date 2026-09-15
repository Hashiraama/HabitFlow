import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.habitflow.app',
  appName: 'HabitFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
