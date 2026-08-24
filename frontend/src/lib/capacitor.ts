import { Capacitor } from '@capacitor/core';

/**
 * Check if the application is running natively inside iOS or Android wrapper
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Returns current platform name ('ios', 'android', or 'web')
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

/**
 * Initializes mobile native features (status bar color, splash screen hiding, hardware back button)
 */
export const initNativeApp = async (): Promise<void> => {
  if (!isNativePlatform()) {
    return;
  }

  try {
    // Configure status bar
    if (Capacitor.isPluginAvailable('StatusBar')) {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setStyle({ style: Style.Dark });
        if (getPlatform() === 'android') {
          await StatusBar.setBackgroundColor({ color: '#111E4D' });
        }
      } catch { /* plugin not installed in runtime */ }
    }

    // Hide splash screen smoothly once React UI is mounted
    if (Capacitor.isPluginAvailable('SplashScreen')) {
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide({ fadeOutDuration: 300 });
      } catch { /* plugin not installed in runtime */ }
    }

    // Handle Android hardware back button
    if (Capacitor.isPluginAvailable('App')) {
      try {
        const { App } = await import('@capacitor/app');
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      } catch { /* plugin not installed in runtime */ }
    }
  } catch (err) {
    console.warn('[NativeApp] Failed to initialize mobile plugin features:', err);
  }
};
