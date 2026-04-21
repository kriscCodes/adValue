import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

// refactor this to exist in .env files
const API_BASE = 'http://127.0.0.1:8000';
const AUTH_ACCESS_KEY = 'auth_access';
const AUTH_REFRESH_KEY = 'auth_refresh';
const GOOGLE_WEB_REDIRECT_URI = AuthSession.makeRedirectUri();
const GOOGLE_NATIVE_REDIRECT_URI = 'https://auth.expo.io/@krisc2004/frontend';
const GOOGLE_REDIRECT_URI =
  Platform.OS === 'web' ? GOOGLE_WEB_REDIRECT_URI : GOOGLE_NATIVE_REDIRECT_URI;
const GOOGLE_NONCE = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
// Only complete web browser sessions on web.
// differentiates between web and native for auth sessions
if (Platform.OS === 'web') {
  WebBrowser.maybeCompleteAuthSession();
}
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

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

  // opens auth session for google login (the little window that pops up)
  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
        '',

      responseType: AuthSession.ResponseType.IdToken,
 
      usePKCE: false,

      extraParams: {
        nonce: GOOGLE_NONCE,
      },
      scopes: ['openid', 'profile', 'email'],
      // NOTE
      // Redirect URI is platform-specific:
      // - web: generated localhost callback for Expo web
      // - native: Expo proxy callback for Expo Go
      // Keep Google Console Authorized redirect URIs for both on the console.
      redirectUri: GOOGLE_REDIRECT_URI,
    },
    GOOGLE_DISCOVERY,
  );

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
			router.replace({ pathname: '/customer-profile' });
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
      // Reset form and switch to login
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

  const handleGoogleLogin = async (): Promise<void> => {
    setError('');
    if (!request) {
      setError('Google sign-in is not ready. Please try again.');
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        setError('Google sign-in was canceled.');
        return;
      }

      const idToken = result.params?.id_token;
      if (!idToken) {
        setError('Google sign-in failed to return an ID token.');
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Google login failed');
        return;
      }

      await AsyncStorage.multiSet([
        [AUTH_ACCESS_KEY, data.access],
        [AUTH_REFRESH_KEY, data.refresh],
      ]);
      router.replace({ pathname: '/customer-profile' });
    } catch {
      setError('Network error');
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
