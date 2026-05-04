import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AUTH_ACCESS_KEY,
  AUTH_REFRESH_KEY,
  BUSINESS_ACCESS_KEY,
  BUSINESS_REFRESH_KEY,
  LAST_ACTIVE_ROLE_KEY,
} from '@/lib/auth-config';

export type SessionState = {
  hasCustomerSession: boolean;
  hasBusinessSession: boolean;
};

export type Role = 'customer' | 'business';

export async function getSessionState(): Promise<SessionState> {
  const [customerToken, businessToken] = await Promise.all([
    AsyncStorage.getItem(AUTH_ACCESS_KEY),
    AsyncStorage.getItem(BUSINESS_ACCESS_KEY),
  ]);

  return {
    hasCustomerSession: Boolean(customerToken),
    hasBusinessSession: Boolean(businessToken),
  };
}

export async function clearCustomerSession(): Promise<void> {
  await AsyncStorage.multiRemove([AUTH_ACCESS_KEY, AUTH_REFRESH_KEY]);
}

export async function clearBusinessSession(): Promise<void> {
  await AsyncStorage.multiRemove([BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY]);
}

export async function clearAllSessions(): Promise<void> {
  await AsyncStorage.multiRemove([
    AUTH_ACCESS_KEY,
    AUTH_REFRESH_KEY,
    BUSINESS_ACCESS_KEY,
    BUSINESS_REFRESH_KEY,
    LAST_ACTIVE_ROLE_KEY,
  ]);
}

export async function setLastActiveRole(role: Role): Promise<void> {
  await AsyncStorage.setItem(LAST_ACTIVE_ROLE_KEY, role);
}

export async function getLastActiveRole(): Promise<Role | null> {
  const storedRole = await AsyncStorage.getItem(LAST_ACTIVE_ROLE_KEY);
  if (storedRole === 'customer' || storedRole === 'business') {
    return storedRole;
  }
  return null;
}

export async function resolveSessionConflict(): Promise<Role> {
  const [session, lastActiveRole] = await Promise.all([getSessionState(), getLastActiveRole()]);
  const hasConflict = session.hasCustomerSession && session.hasBusinessSession;

  if (!hasConflict) {
    if (session.hasBusinessSession) return 'business';
    return 'customer';
  }

  // Fallback is customer when role is missing/invalid.
  const winner: Role = lastActiveRole === 'business' ? 'business' : 'customer';
  if (winner === 'customer') {
    await clearBusinessSession();
  } else {
    await clearCustomerSession();
  }
  await setLastActiveRole(winner);
  return winner;
}
