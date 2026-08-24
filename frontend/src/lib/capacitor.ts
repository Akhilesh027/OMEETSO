import { Capacitor } from '@capacitor/core';

/**
 * Check if the application is running natively inside iOS or Android wrapper
 */
export const isNativePlatform = (): boolean => {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
};

/**
 * Returns current platform name ('ios', 'android', or 'web')
 */
export const getPlatform = (): 'ios' | 'android' | 'web' => {
  return typeof window !== 'undefined' ? (Capacitor.getPlatform() as 'ios' | 'android' | 'web') : 'web';
};

/**
 * Initializes mobile native features (status bar color, splash screen hiding, hardware back button)
 */
export const initNativeApp = async (): Promise<void> => {
  if (!isNativePlatform()) {
    return;
  }

  try {
    const plugins = (Capacitor as any).Plugins || (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins);
    if (!plugins) return;

    // Configure status bar
    if (Capacitor.isPluginAvailable('StatusBar') && plugins.StatusBar) {
      try {
        await plugins.StatusBar.setStyle({ style: 'DARK' });
        if (getPlatform() === 'android') {
          await plugins.StatusBar.setBackgroundColor({ color: '#111E4D' });
        }
      } catch { /* ignore */ }
    }

    // Hide splash screen smoothly once React UI is mounted
    if (Capacitor.isPluginAvailable('SplashScreen') && plugins.SplashScreen) {
      try {
        await plugins.SplashScreen.hide({ fadeOutDuration: 300 });
      } catch { /* ignore */ }
    }

    // Handle Android hardware back button
    if (Capacitor.isPluginAvailable('App') && plugins.App) {
      try {
        plugins.App.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            plugins.App.exitApp();
          }
        });
      } catch { /* ignore */ }
    }
  } catch (err) {
    console.warn('[NativeApp] Failed to initialize mobile plugin features:', err);
  }
};

