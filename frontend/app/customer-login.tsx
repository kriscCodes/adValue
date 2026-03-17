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
    <View style={{ flex: 1, backgroundColor: '#EFF9FF' }} className="p-5 justify-center">
      <Text
        style={{
          fontFamily: 'ITF Devanagari Marathi',
          fontSize: 32,
          color: '#2A5CC0',
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        adValue
      </Text>

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#D9ECF7',
          borderRadius: 50,
          padding: 4,
          marginBottom: 28,
        }}
      >
        <Pressable
          onPress={() => router.replace('/customer-login')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 50,
            backgroundColor: '#2A5CC0',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Log In</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace('/customer-signup')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 50,
            backgroundColor: 'transparent',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#555', fontWeight: '600', fontSize: 15 }}>Sign Up</Text>
        </Pressable>
      </View>


      <Text style={{ marginLeft: 4, marginBottom: 4, color: '#2A5CC0', fontWeight: '800' }}>Email</Text>
      <TextInput
        placeholder="e.g. howard.thurman@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ backgroundColor: '#fff', borderWidth: 0, borderRadius: 11, padding: 12, marginBottom: 16 }}
        placeholderTextColor="#A0AEC0"
      />

      <Text style={{ marginLeft: 4, marginBottom: 4, color: '#2A5CC0', fontWeight: '800' }}>Password</Text>
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ backgroundColor: '#fff', borderWidth: 0, borderRadius: 11, padding: 12, marginBottom: 24 }}
        placeholderTextColor="#A0AEC0"
      />

      <Pressable
        onPress={handleLogin}
        style={{
          backgroundColor: '#2A5CC0',
          borderRadius: 50,
          paddingVertical: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Log In</Text>
      </Pressable>

      {error ? <Text className="text-red-600 mt-3">{error}</Text> : null}
    </View>
  );
}