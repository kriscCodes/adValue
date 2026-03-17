import { View, TextInput, Pressable, Text } from 'react-native';
import { useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000'; // Whne deployed make sure to alter this string and import form env

export default function CustomerSignup() {
  // State hooks for email and password texts
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      
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
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        className="border border-gray-300 rounded-lg p-3 mb-3"
      />
      <Pressable className="bg-blue-600 py-3 rounded-lg items-center" onPress={handleSignup}>
        <Text className="text-white font-semibold">Signup</Text>
      </Pressable>
      {error ? <Text className="text-red-600 mt-3">{error}</Text> : null}
    </View>
  );
}
