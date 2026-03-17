import { View, TextInput, Pressable, Text } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

const API_BASE = 'http://127.0.0.1:8000';

export default function CustomerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      router.replace({
        pathname: '/customer-profile',
        params: { email: data.user.email },
      });
    } catch {
      setError('Network error');
    }
  };

  return (
    <View className="flex-1 p-5 justify-center">
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded-lg p-3 mb-3"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border border-gray-300 rounded-lg p-3 mb-3"
      />
      <Pressable className="bg-blue-600 py-3 rounded-lg items-center" onPress={handleLogin}>
        <Text className="text-white font-semibold">Login</Text>
      </Pressable>
      {error ? <Text className="text-red-600 mt-3">{error}</Text> : null}
    </View>
  );
}
