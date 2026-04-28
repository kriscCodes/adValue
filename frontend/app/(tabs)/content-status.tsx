import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_BASE, AUTH_ACCESS_KEY, AUTH_REFRESH_KEY } from '@/lib/auth-config';
import { stopSavedBusinessGeofences } from '@/lib/sync-saved-geofences';

type Submission = {
  content_id: number;
  business_id: number;
  platform: string;
  content_url: string;
  views: number;
  status: 'pending' | 'rejected' | 'valid';
  submitted_at: string;
};

export default function ContentStatusScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const loadSubmissions = useCallback(async () => {
    setError('');
    const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
    if (!token) {
      router.replace('/auth');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/content/submissions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.status === 401) {
        await AsyncStorage.multiRemove([AUTH_ACCESS_KEY, AUTH_REFRESH_KEY]);
        await stopSavedBusinessGeofences();
        router.replace('/auth');
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Failed to load submissions.');
        return;
      }
      setSubmissions(data.submissions ?? []);
    } catch (e) {
      console.error('Failed to load submissions', e);
      setError('Network error while loading content status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const openVideo = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        setError('Cannot open this video URL.');
        return;
      }
      await Linking.openURL(url);
    } catch (e) {
      console.error('Failed to open video URL', e);
      setError('Unable to open video URL.');
    }
  };

  const statusStyle = (status: Submission['status']) => {
    if (status === 'valid') return styles.statusValid;
    if (status === 'rejected') return styles.statusRejected;
    return styles.statusPending;
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>My Content Status</Text>
      <Text style={styles.subtitle}>Track approval status for your submitted content.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <Text style={styles.helperText}>Loading submissions...</Text>
      ) : submissions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No submissions yet</Text>
          <Text style={styles.emptySubtitle}>Submit a verification request to see it here.</Text>
        </View>
      ) : (
        submissions.map((item) => (
          <View key={item.content_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Submission #{item.content_id}</Text>
              <Text style={[styles.statusBadge, statusStyle(item.status)]}>{item.status}</Text>
            </View>
            <Text style={styles.meta}>Business ID: {item.business_id}</Text>
            <Text style={styles.meta}>Platform: {item.platform}</Text>
            <Text style={styles.meta}>Claimed Views: {item.views}</Text>
            <Text style={styles.meta}>
              Submitted: {new Date(item.submitted_at).toLocaleString()}
            </Text>
            <Pressable onPress={() => openVideo(item.content_url)}>
              <Text style={styles.linkText}>{item.content_url}</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#EFF9FF',
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E56A0',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    color: '#475569',
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 14,
    marginBottom: 10,
    gap: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPending: {
    backgroundColor: '#fff7ed',
    color: '#c2410c',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  statusValid: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  meta: {
    fontSize: 12,
    color: '#334155',
  },
  linkText: {
    fontSize: 12,
    color: '#1d4ed8',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});
