import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_BASE, BUSINESS_ACCESS_KEY } from '@/lib/auth-config';

type Submission = {
  content_id: number;
  customer_id: number;
  business_id: number;
  platform: string;
  content_url: string;
  views: number;
  status: 'pending' | 'rejected' | 'valid';
  submitted_at: string;
};

export default function BusinessManageScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadSubmissions = useCallback(async () => {
    setError('');
    const token = await AsyncStorage.getItem(BUSINESS_ACCESS_KEY);
    if (!token) {
      router.replace('/business-auth');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/business/content-submissions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.status === 401) {
        router.replace('/business-auth');
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Failed to load submissions.');
        return;
      }
      setSubmissions(data.submissions ?? []);
    } catch (e) {
      console.error('Failed to load business submissions', e);
      setError('Network error while loading submissions.');
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

  const handleStatusUpdate = async (contentId: number, status: 'pending' | 'rejected' | 'valid') => {
    const token = await AsyncStorage.getItem(BUSINESS_ACCESS_KEY);
    if (!token) {
      router.replace('/business-auth');
      return;
    }

    setUpdatingId(contentId);
    try {
      const res = await fetch(`${API_BASE}/api/auth/business/content-submissions/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content_id: contentId,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update submission status.');
        return;
      }

      setSubmissions((prev) =>
        prev.map((item) => (item.content_id === contentId ? { ...item, status } : item)),
      );
    } catch (e) {
      console.error('Failed to update submission status', e);
      setError('Network error while updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusStyle = (status: Submission['status']) => {
    if (status === 'valid') return styles.statusValid;
    if (status === 'rejected') return styles.statusRejected;
    return styles.statusPending;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Manage Content</Text>
        <Text style={styles.subtitle}>Loading submissions...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Manage Content</Text>
      <Text style={styles.subtitle}>Review submitted videos and approve or reject each request.</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {submissions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No submissions yet</Text>
          <Text style={styles.emptySubtitle}>New customer submissions will appear here.</Text>
        </View>
      ) : (
        submissions.map((item) => (
          <View key={item.content_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Submission #{item.content_id}</Text>
              <Text style={[styles.statusBadge, statusStyle(item.status)]}>{item.status}</Text>
            </View>
            <Text style={styles.cardMeta}>Submitted by customer: #{item.customer_id}</Text>
            <Text style={styles.cardMeta}>Platform: {item.platform}</Text>
            <Text style={styles.cardMeta}>Claimed views: {item.views}</Text>
            <Text style={styles.cardMeta}>Received: {new Date(item.submitted_at).toLocaleString()}</Text>

            <Pressable onPress={() => openVideo(item.content_url)}>
              <Text style={styles.linkText}>{item.content_url}</Text>
            </Pressable>

            <View style={styles.actions}>
              <Pressable
                style={[styles.actionButton, styles.validButton]}
                disabled={updatingId === item.content_id}
                onPress={() => handleStatusUpdate(item.content_id, 'valid')}
              >
                <Text style={styles.actionText}>Approve</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.rejectedButton]}
                disabled={updatingId === item.content_id}
                onPress={() => handleStatusUpdate(item.content_id, 'rejected')}
              >
                <Text style={styles.actionText}>Reject</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF9FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
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
    gap: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  cardMeta: {
    fontSize: 12,
    color: '#334155',
  },
  linkText: {
    fontSize: 12,
    color: '#1d4ed8',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  validButton: {
    backgroundColor: '#16a34a',
  },
  rejectedButton: {
    backgroundColor: '#dc2626',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
