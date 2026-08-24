import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

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
      await StatusBar.setStyle({ style: Style.Dark });
      if (getPlatform() === 'android') {
        await StatusBar.setBackgroundColor({ color: '#111E4D' });
      }
    }

    // Hide splash screen smoothly once React UI is mounted
    if (Capacitor.isPluginAvailable('SplashScreen')) {
      await SplashScreen.hide({ fadeOutDuration: 300 });
    }

    // Handle Android hardware back button
    if (Capacitor.isPluginAvailable('App')) {
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    }
  } catch (err) {
    console.warn('[NativeApp] Failed to initialize mobile plugin features:', err);
  }
};
