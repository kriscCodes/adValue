import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { syncSavedBusinessGeofences } from '@/lib/sync-saved-geofences';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers geofences for saved businesses after login and when the app returns to the foreground.
 */
export function SavedGeofenceBootstrap() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    syncSavedBusinessGeofences();

    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        syncSavedBusinessGeofences();
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, []);

  return null;
}
