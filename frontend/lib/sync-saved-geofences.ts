import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { API_BASE, AUTH_ACCESS_KEY } from '@/lib/auth-config';
import {
  GEOFENCING_TASK_NAME,
  GEOFENCE_LABELS_KEY,
  MAX_GEOFENCES,
  NOTIFICATION_CHANNEL_ID,
  RADIUS_METERS,
} from '@/lib/geofencing-constants';

type SavedBusinessApi = {
  business_external_id: number;
  name: string;
  lat: number;
  lng: number;
};

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Nearby saved places',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563eb',
    sound: 'default',
    enableVibrate: true,
  });
}

async function ensureNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

async function ensureForegroundLocation(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

async function ensureBackgroundLocation(): Promise<boolean> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Loads saved restaurants from the API and registers circular geofences (~{@link RADIUS_METERS} m).
 * Call on app startup (logged-in customer) and after saves change.
 */
export async function syncSavedBusinessGeofences(): Promise<void> {
  if (Platform.OS === 'web') return;

  const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
  if (!token) {
    await stopSavedBusinessGeofences();
    return;
  }

  await ensureAndroidChannel();

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/auth/saved-businesses/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return;
  }

  if (!res.ok) {
    if (res.status === 401) {
      await stopSavedBusinessGeofences();
    }
    return;
  }

  const json = await res.json();
  const list = (json.saved_businesses ?? []) as SavedBusinessApi[];

  const valid = list
    .filter(
      (b) => Number.isFinite(b.lat) && Number.isFinite(b.lng) && !(b.lat === 0 && b.lng === 0)
    )
    .slice(0, MAX_GEOFENCES);

  const labels: Record<string, string> = {};
  const regions: Location.LocationRegion[] = valid.map((b) => {
    labels[String(b.business_external_id)] = b.name;
    return {
      identifier: `biz-${b.business_external_id}`,
      latitude: b.lat,
      longitude: b.lng,
      radius: RADIUS_METERS,
      notifyOnEnter: true,
      notifyOnExit: false,
    };
  });

  await AsyncStorage.setItem(GEOFENCE_LABELS_KEY, JSON.stringify(labels));

  if (regions.length === 0) {
    await stopSavedBusinessGeofences();
    return;
  }

  await ensureNotificationPermission();
  const okFg = await ensureForegroundLocation();
  await ensureBackgroundLocation();

  if (!okFg) {
    await stopSavedBusinessGeofences();
    return;
  }

  try {
    await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
  } catch {
    // Permissions or platform limits (e.g. region count / radius)
  }
}

export async function stopSavedBusinessGeofences(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const started = await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
    if (started) {
      await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
    }
  } catch {
    // noop
  }
}
