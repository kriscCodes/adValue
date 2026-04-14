import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY } from '@/lib/auth-config';

type AuthMode = 'login' | 'signup';

interface BusinessAuthState {
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  firstName: string;
  lastName: string;
  error: string;
  loading: boolean;
}

export function useBusinessAuth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [state, setState] = useState<BusinessAuthState>({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    firstName: '',
    lastName: '',
    error: '',
    loading: false,
  });

  const updateField = (field: keyof Omit<BusinessAuthState, 'error' | 'loading'>, value: string) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const setError = (error: string) => {
    setState((prev) => ({ ...prev, error }));
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
  };

  const handleLogin = async (): Promise<void> => {
    setError('');
    if (!state.email || !state.password) {
      setError('Please fill in all fields');
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/business/login/`, {
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
        [BUSINESS_ACCESS_KEY, data.access],
        [BUSINESS_REFRESH_KEY, data.refresh],
      ]);
      router.replace({ pathname: '/home' });
    } catch {
      setError('Network error');
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSignup = async (): Promise<void> => {
    setError('');
    if (!state.email || !state.password || !state.confirmPassword || !state.businessName) {
      setError('Please fill in all required fields');
      return;
    }
    if (state.password !== state.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/business/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: state.email,
          password: state.password,
          business_name: state.businessName,
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
        businessName: '',
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

  return {
    mode,
    toggleMode,
    state,
    updateField,
    handleLogin,
    handleSignup,
  };
}
