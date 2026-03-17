import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// refactor this to exist in .env files
const API_BASE = 'http://127.0.0.1:8000';
const AUTH_ACCESS_KEY = 'auth_access';
const AUTH_REFRESH_KEY = 'auth_refresh';

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

  return {
    mode,
    toggleMode,
    state,
    updateField,
    setError,
    handleLogin,
    handleSignup,
  };
}
