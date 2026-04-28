import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeofencingEventType, type LocationRegion } from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { TaskManagerTaskBody } from 'expo-task-manager';
import * as TaskManager from 'expo-task-manager';

import {
  GEOFENCING_TASK_NAME,
  GEOFENCE_LABELS_KEY,
  GEOFENCE_NOTIFY_THROTTLE_MS,
  GEOFENCE_THROTTLE_KEY_PREFIX,
  NOTIFICATION_CHANNEL_ID,
} from '@/lib/geofencing-constants';

type GeofencingTaskData = {
  eventType: GeofencingEventType;
  region: LocationRegion;
};

TaskManager.defineTask(GEOFENCING_TASK_NAME, async (taskBody: TaskManagerTaskBody<GeofencingTaskData>) => {
  if (taskBody.error) {
    return;
  }
  const data = taskBody.data;
  if (!data) {
    return;
  }

  const { eventType, region } = data;
  if (eventType !== GeofencingEventType.Enter) {
    return;
  }

  const identifier = region.identifier ?? '';
  const match = /^biz-(\d+)$/.exec(identifier);
  const externalId = match?.[1];
  if (!externalId) {
    return;
  }

  const labelsRaw = await AsyncStorage.getItem(GEOFENCE_LABELS_KEY);
  const labels = labelsRaw ? (JSON.parse(labelsRaw) as Record<string, string>) : {};
  const name = labels[externalId] ?? 'a saved place';

  const throttleKey = `${GEOFENCE_THROTTLE_KEY_PREFIX}${externalId}`;
  const prevRaw = await AsyncStorage.getItem(throttleKey);
  const prev = prevRaw ? Number(prevRaw) : 0;
  const now = Date.now();
  if (prev > 0 && now - prev < GEOFENCE_NOTIFY_THROTTLE_MS) {
    return;
  }
  await AsyncStorage.setItem(throttleKey, String(now));

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Near a saved place',
      body: `You're within about 150m of ${name}.`,
      data: { businessExternalId: externalId },
    },
    trigger: Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNEL_ID } : null,
  });
});
