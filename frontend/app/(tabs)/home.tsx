import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CustomerScreenHeader } from '@/components/customer/CustomerScreenHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/customer/ScreenState';
import { API_BASE, AUTH_ACCESS_KEY, AUTH_REFRESH_KEY } from '@/lib/auth-config';

type SubmissionStatus = 'pending' | 'valid' | 'rejected';
type Submission = {
  content_id: number;
  platform: string;
  status: SubmissionStatus;
  submitted_at: string;
};

type Reward = {
  reward_id: number;
  shop: string;
  offer: string;
  status: string;
};

type HomeAction = {
  title: string;
  description: string;
  href: Href;
  cta: string;
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadHomeData() {
      const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
      if (!token) {
        router.replace('/auth');
        return;
      }

      try {
        const [submissionsRes, rewardsRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/content/submissions/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/auth/rewards/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (submissionsRes.status === 401 || rewardsRes.status === 401) {
          await AsyncStorage.multiRemove([AUTH_ACCESS_KEY, AUTH_REFRESH_KEY]);
          if (!cancelled) {
            router.replace('/auth');
          }
          return;
        }

        const submissionsData = await submissionsRes.json();
        const rewardsData = await rewardsRes.json();

        if (!submissionsRes.ok) {
          if (!cancelled) setError(submissionsData.error || 'Failed to load submission summary.');
          return;
        }
        if (!rewardsRes.ok) {
          if (!cancelled) setError(rewardsData.error || 'Failed to load rewards summary.');
          return;
        }

        if (!cancelled) {
          setSubmissions(submissionsData.submissions ?? []);
          setRewards(rewardsData.rewards ?? []);
        }
      } catch {
        if (!cancelled) setError('Network error while loading dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHomeData();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingCount = submissions.filter((item) => item.status === 'pending').length;
  const approvedCount = submissions.filter((item) => item.status === 'valid').length;
  const availableRewardsCount = rewards.filter((item) => item.status === 'READY TO USE').length;

  const highlightHref = useMemo<Href>(() => {
    if (availableRewardsCount > 0) return '/rewards';
    if (pendingCount > 0 || approvedCount > 0) return '/content-status';
    return '/customer-verification-form';
  }, [availableRewardsCount, approvedCount, pendingCount]);

  const actions: HomeAction[] = [
    {
      title: 'Submit Verification',
      description: 'Share your post details so businesses can review your content.',
      href: '/customer-verification-form',
      cta: 'Start Verification',
    },
    {
      title: 'Track Content Status',
      description: 'Check whether your submissions are pending, approved, or rejected.',
      href: '/content-status',
      cta: 'View Status',
    },
    {
      title: 'Use Rewards',
      description: 'Open reward tickets and redeem approved submission benefits.',
      href: '/rewards',
      cta: 'Open Rewards',
    },
  ];

  const submissionActivity = submissions
    .slice()
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 2)
    .map(
      (item) =>
        `Submission #${item.content_id} (${item.platform}) is ${item.status === 'valid' ? 'approved' : item.status}.`,
    );
  const rewardActivity = rewards.slice(0, 1).map((item) => `Reward available: ${item.offer} at ${item.shop}.`);
  const activity = [...rewardActivity, ...submissionActivity].slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <CustomerScreenHeader
          title="Your adValue Dashboard"
          subtitle="Submit content, track approvals, and redeem rewards."
        />

        {loading ? <LoadingState message="Loading dashboard..." /> : null}
        {!loading && error ? <ErrorState message={error} /> : null}

        {!loading && !error ? (
          <View style={styles.snapshotRow}>
            <Pressable style={styles.snapshotCard} onPress={() => router.push('/content-status')}>
              <Text style={styles.snapshotLabel}>Pending Reviews</Text>
              <Text style={styles.snapshotValue}>{pendingCount}</Text>
            </Pressable>
            <Pressable style={styles.snapshotCard} onPress={() => router.push('/content-status')}>
              <Text style={styles.snapshotLabel}>Approved Posts</Text>
              <Text style={styles.snapshotValue}>{approvedCount}</Text>
            </Pressable>
            <Pressable style={styles.snapshotCard} onPress={() => router.push('/rewards')}>
              <Text style={styles.snapshotLabel}>Available Rewards</Text>
              <Text style={styles.snapshotValue}>{availableRewardsCount}</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Actions</Text>
          {actions.map((item) => (
            <View key={item.title} style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <Pressable
                style={[styles.button, item.href === highlightHref ? styles.buttonHighlight : null]}
                onPress={() => router.push(item.href)}
              >
                <Text style={styles.buttonText}>{item.cta}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              subtitle="No activity yet — start by submitting a verification."
            />
          ) : (
            <View style={styles.activityCard}>
              {activity.map((entry) => (
                <Text key={entry} style={styles.activityItem}>
                  - {entry}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.utilityRow}>
          <Pressable onPress={() => router.push('/explore')}>
            <Text style={styles.utilityLink}>Explore Businesses</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/saved')}>
            <Text style={styles.utilityLink}>Saved Places</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/profile')}>
            <Text style={styles.utilityLink}>Profile Settings</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  snapshotCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 10,
  },
  snapshotLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  snapshotValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  section: {
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardDescription: {
    marginTop: 6,
    color: '#64748b',
    lineHeight: 20,
    fontSize: 13,
  },
  button: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  buttonHighlight: {
    backgroundColor: '#1d4ed8',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  activityItem: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  utilityRow: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 4,
  },
  utilityLink: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
  },
});
