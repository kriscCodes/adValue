import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_BASE, AUTH_ACCESS_KEY, AUTH_REFRESH_KEY } from '@/lib/auth-config';
import { setLastActiveRole } from '@/lib/session';

function getGoogleOAuthRedirectUri(): string {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth`;
    }
    return 'http://localhost:8081/auth';
  }

  const proxyOverride = process.env.EXPO_PUBLIC_EXPO_AUTH_PROXY_REDIRECT_URI;
  if (proxyOverride) {
    return proxyOverride;
  }

  try {
    return AuthSession.getRedirectUrl();
  } catch {
    const fullName =
      Constants.expoConfig?.originalFullName ??
      `@${Constants.expoConfig?.owner ?? 'krisc2004'}/${Constants.expoConfig?.slug ?? 'frontend'}`;
    return `https://auth.expo.io/${fullName}`;
  }
}

const GOOGLE_REDIRECT_URI = getGoogleOAuthRedirectUri();

if (__DEV__ && Platform.OS === 'web') {
  console.log(
    '[Google OAuth] GOOGLE_REDIRECT_URI — paste this into Google Cloud → Web client → Authorized redirect URIs (exact match):\n',
    GOOGLE_REDIRECT_URI,
  );
}

type AuthMode = 'login' | 'signup';

interface AuthState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  error: string;
  loading: boolean;
}

export function useAuth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [state, setState] = useState<AuthState>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    error: '',
    loading: false,
  });

  const updateField = (field: keyof Omit<AuthState, 'error' | 'loading'>, value: string) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const setError = (error: string) => {
    setState((prev) => ({ ...prev, error }));
  };

  const sendIdTokenToBackend = async (idToken: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/api/auth/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Google login failed');
      return false;
    }

    await AsyncStorage.multiSet([
      [AUTH_ACCESS_KEY, data.access],
      [AUTH_REFRESH_KEY, data.refresh],
    ]);
    await setLastActiveRole('customer');
    router.replace({ pathname: '/home' });
    return true;
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.slice(1));
    const idToken = params.get('id_token');
    if (!idToken) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    setState((prev) => ({ ...prev, loading: true }));
    sendIdTokenToBackend(idToken).finally(() =>
      setState((prev) => ({ ...prev, loading: false })),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (): Promise<void> => {
    setError('');
    if (!state.email || !state.password) {
      setError('Please fill in all fields');
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email, password: state.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      await AsyncStorage.multiSet([
        [AUTH_ACCESS_KEY, data.access],
        [AUTH_REFRESH_KEY, data.refresh],
      ]);
      await setLastActiveRole('customer');
      router.replace({ pathname: '/home' });
    } catch {
      setError('Network error');
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSignup = async (): Promise<void> => {
    setError('');
    if (!state.email || !state.password || !state.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (state.password !== state.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          password: state.password,
          first_name: state.firstName,
          last_name: state.lastName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      setState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        error: 'Account created! Please log in.',
        loading: false,
      });
      setMode('login');
    } catch {
      setError('Network error');
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  const handleGoogleLoginWeb = (): void => {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!clientId) {
      setError('Google sign-in is not configured.');
      return;
    }
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'id_token',
      scope: 'openid profile email',
      nonce,
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const handleGoogleLoginNative = async (): Promise<void> => {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) {
      setError('Google sign-in is not configured (missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).');
      return;
    }

    const { GoogleSignin, isSuccessResponse } = await import('@react-native-google-signin/google-signin');

    GoogleSignin.configure({
      webClientId,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
    });

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      setError('Google sign-in was canceled.');
      return;
    }

    let idToken = response.data.idToken;
    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    }
    if (!idToken) {
      setError('Google sign-in failed to return an ID token.');
      return;
    }

    await sendIdTokenToBackend(idToken);
  };

  const handleGoogleLogin = async (): Promise<void> => {
    setError('');
    setState((prev) => ({ ...prev, loading: true }));
    try {
      if (Platform.OS === 'web') {
        await handleGoogleLoginWeb();
      } else {
        await handleGoogleLoginNative();
      }
    } catch (e: unknown) {
      if (Platform.OS !== 'web') {
        const { statusCodes, isErrorWithCode } = await import('@react-native-google-signin/google-signin');
        if (typeof isErrorWithCode === 'function' && isErrorWithCode(e) && (e as any).code === statusCodes.SIGN_IN_CANCELLED) {
          setError('Google sign-in was canceled.');
          return;
        }
      }
      setError(Platform.OS === 'web' ? 'Network error' : 'Google sign-in failed. Try again.');
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  return {
    mode,
    toggleMode,
    state,
    updateField,
    setError,
    handleLogin,
    handleSignup,
    handleGoogleLogin,
  };
}
