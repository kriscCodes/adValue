import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, AUTH_ACCESS_KEY, AUTH_REFRESH_KEY } from '@/lib/auth-config';
import { Feather } from '@expo/vector-icons';
import { CustomerScreenHeader } from '@/components/customer/CustomerScreenHeader';
import { clearAllSessions, clearCustomerSession } from '@/lib/session';

type Profile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  location_enabled: boolean;
  notifications_enabled: boolean;
} | null;

type AnimatedToggleProps = {
  value: boolean;
  onToggle: () => void;
};

function AnimatedToggle({ value, onToggle }: AnimatedToggleProps) {
  const [progress] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [value, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      style={styles.toggleTrack}
    >
      <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]} />
    </Pressable>
  );
}

export default function ProfileTab() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile/`, {
          headers: { Authorization: `Bearer ${token ?? ''}` },
        });
        if (res.status === 401) {
          await AsyncStorage.multiRemove([AUTH_ACCESS_KEY, AUTH_REFRESH_KEY]);
          if (!cancelled) router.replace('/auth' as Href);
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || 'Failed to load profile');
          return;
        }
        if (!cancelled) {
          setProfile(data);
          setEmail(data.email ?? '');
          setLocationEnabled(Boolean(data.location_enabled));
          setNotificationsEnabled(Boolean(data.notifications_enabled));
        }
      } catch {
        if (!cancelled) setError('Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 p-5 justify-center">
        <Text className="text-red-600">{error}</Text>
      </View>
    );
  }

  const handleSignOut = async () => {
    await clearCustomerSession();
    router.replace('/auth' as Href);
  };
  const handleSignOutAll = async () => {
    await clearAllSessions();
    router.replace('/role-select' as Href);
  };
  const handleSaveChanges = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
    try {
      const payload: Record<string, unknown> = {
        email,
        location_enabled: locationEnabled,
        notifications_enabled: notificationsEnabled,
      };
      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(`${API_BASE}/api/auth/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 401) {
        await AsyncStorage.multiRemove([AUTH_ACCESS_KEY, AUTH_REFRESH_KEY]);
        router.replace('/auth' as Href);
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Failed to save changes.');
        return;
      }

      if (data.profile) {
        setProfile(data.profile);
      }
      setPassword('');
      setSuccess('Profile updated successfully.');
    } catch {
      setError('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomerScreenHeader
          title={profile ? `${profile.first_name} ${profile.last_name}` : 'Customer Profile'}
          subtitle="Manage your account settings and continue your submission workflow."
        />

        <View style={styles.quickActionsCard}>
          <Text style={styles.cardTitle}>Submission Workflow</Text>
          <View style={styles.quickActionRow}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/customer-verification-form' as Href)}
            >
              <Text style={styles.quickActionText}>Verification</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/content-status' as Href)}
            >
              <Text style={styles.quickActionText}>Content Status</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/rewards' as Href)}
            >
              <Text style={styles.quickActionText}>Rewards</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="user" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Account Settings</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="settings" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>App Preferences</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="map-pin" size={20} color="#3b82f6" />
              <View style={styles.settingTextContent}>
                <Text style={styles.settingLabel}>Location Services</Text>
                <Text style={styles.settingSubtext}>Improve content relevance based on your area</Text>
              </View>
            </View>
            <AnimatedToggle
              value={locationEnabled}
              onToggle={() => setLocationEnabled((prev) => !prev)}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Feather name="bell" size={20} color="#3b82f6" />
              <View style={styles.settingTextContent}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingSubtext}>Get updates about status changes and account activity</Text>
              </View>
            </View>
            <AnimatedToggle
              value={notificationsEnabled}
              onToggle={() => setNotificationsEnabled((prev) => !prev)}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.reportButton}>
          <Feather name="alert-circle" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.reportButtonText}>Report a Problem</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Feather name="log-out" size={18} color="#475569" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out of adValue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signOutAllButton} onPress={handleSignOutAll}>
          <Text style={styles.signOutAllText}>Sign Out of All Roles</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  quickActionsCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#dbeafe',
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
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
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#64748b',
    fontSize: 15,
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
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3b82f6',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 500,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fff',
    marginBottom: 30,
  },
  reportButtonText: {
    color: '#ef4444',
    fontWeight: '600',
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
  signOutAllButton: {
    marginBottom: 44,
  },
  signOutAllText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
