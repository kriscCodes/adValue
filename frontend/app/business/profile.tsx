import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { API_BASE, BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY } from '@/lib/auth-config';

type BusinessProfile = {
  id: number;
  email: string;
  name: string;
  owner_first_name: string;
  owner_last_name: string;
  description: string;
  address: string;
  google_place_id: string;
} | null;

export default function BusinessProfileScreen() {
  const [profile, setProfile] = useState<BusinessProfile>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const token = await AsyncStorage.getItem(BUSINESS_ACCESS_KEY);
      if (!token) {
        if (!cancelled) router.replace('/business-auth');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/business/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.status === 401) {
          await AsyncStorage.multiRemove([BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY]);
          if (!cancelled) router.replace('/business-auth');
          return;
        }
        if (!res.ok) {
          if (!cancelled) setError(data.error || 'Failed to load business profile.');
          return;
        }

        if (!cancelled) {
          setProfile(data);
          setEmail(data.email ?? '');
          setBusinessName(data.name ?? '');
          setOwnerFirstName(data.owner_first_name ?? '');
          setOwnerLastName(data.owner_last_name ?? '');
          setDescription(data.description ?? '');
          setAddress(data.address ?? '');
          setGooglePlaceId(data.google_place_id ?? '');
        }
      } catch {
        if (!cancelled) setError('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveChanges = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    const token = await AsyncStorage.getItem(BUSINESS_ACCESS_KEY);
    try {
      const payload: Record<string, unknown> = {
        email,
        business_name: businessName,
        owner_first_name: ownerFirstName,
        owner_last_name: ownerLastName,
        description,
        address,
        google_place_id: googlePlaceId,
      };
      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(`${API_BASE}/api/auth/business/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 401) {
        await AsyncStorage.multiRemove([BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY]);
        router.replace('/business-auth');
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Failed to save changes.');
        return;
      }

      if (data.profile) setProfile(data.profile);
      setPassword('');
      setSuccess('Business profile updated successfully.');
    } catch {
      setError('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY]);
    router.replace('/business-auth');
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerName}>{businessName || 'Business Profile'}</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="user" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Business Settings</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Email</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color="#94a3b8" />
              <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color="#94a3b8" />
              <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name</Text>
            <View style={styles.inputWrapper}>
              <Feather name="briefcase" size={18} color="#94a3b8" />
              <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner First Name</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={18} color="#94a3b8" />
              <TextInput style={styles.input} value={ownerFirstName} onChangeText={setOwnerFirstName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Owner Last Name</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={18} color="#94a3b8" />
              <TextInput style={styles.input} value={ownerLastName} onChangeText={setOwnerLastName} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputWrapper}>
              <Feather name="map-pin" size={18} color="#94a3b8" />
              <TextInput style={styles.input} value={address} onChangeText={setAddress} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrap]}>
              <Feather name="file-text" size={18} color="#94a3b8" style={styles.iconTop} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Google Place ID</Text>
            <View style={styles.inputWrapper}>
              <Feather name="hash" size={18} color="#94a3b8" />
              <TextInput style={styles.input} value={googlePlaceId} onChangeText={setGooglePlaceId} />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#475569" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out of adValue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    padding: 24,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  headerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginVertical: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 560,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#64748b',
    fontSize: 15,
  },
  textAreaWrap: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 70,
  },
  iconTop: {
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
  successText: {
    marginTop: 10,
    color: '#16a34a',
    fontWeight: '600',
    fontSize: 13,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  signOutText: {
    color: '#475569',
    fontWeight: '500',
  },
});
