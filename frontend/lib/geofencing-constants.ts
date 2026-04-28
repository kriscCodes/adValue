/** Task name — must match `Location.startGeofencingAsync` / `stopGeofencingAsync`. */
export const GEOFENCING_TASK_NAME = 'SAVED_BUSINESS_GEOFENCING';

/** OS region radius for “nearby” (~150 m). */
export const RADIUS_METERS = 150;

/** iOS limits monitored regions; keep within a safe cap. */
export const MAX_GEOFENCES = 20;

/** AsyncStorage JSON map: business_external_id → display name for notification body. */
export const GEOFENCE_LABELS_KEY = '@saved_geofence_labels';

/** Avoid duplicate alerts if iOS replays enter state on cold start. */
export const GEOFENCE_NOTIFY_THROTTLE_MS = 30 * 60 * 1000;

export const GEOFENCE_THROTTLE_KEY_PREFIX = '@geofence_last_notify_';

export const NOTIFICATION_CHANNEL_ID = 'saved-business-proximity';
