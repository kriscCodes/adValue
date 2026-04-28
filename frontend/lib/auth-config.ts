export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000';

export const AUTH_ACCESS_KEY =
  process.env.EXPO_PUBLIC_AUTH_ACCESS_KEY ?? 'auth_access';

export const AUTH_REFRESH_KEY =
  process.env.EXPO_PUBLIC_AUTH_REFRESH_KEY ?? 'auth_refresh';

export const BUSINESS_ACCESS_KEY =
  process.env.EXPO_PUBLIC_BUSINESS_ACCESS_KEY ?? 'business_access';

export const BUSINESS_REFRESH_KEY =
  process.env.EXPO_PUBLIC_BUSINESS_REFRESH_KEY ?? 'business_refresh';

export const ENABLE_AUTO_RESUME_SESSION =
  process.env.EXPO_PUBLIC_ENABLE_AUTO_RESUME_SESSION === 'true';

export const LAST_ACTIVE_ROLE_KEY =
  process.env.EXPO_PUBLIC_LAST_ACTIVE_ROLE_KEY ?? 'last_active_role';
