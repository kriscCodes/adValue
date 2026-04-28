import React, { useMemo, useState } from 'react';
import { Ban, QrCode, X } from 'lucide-react-native';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_BASE, AUTH_ACCESS_KEY, AUTH_REFRESH_KEY } from '@/lib/auth-config';
import { stopSavedBusinessGeofences } from '@/lib/sync-saved-geofences';

type RewardStatus = 'READY TO USE' | 'USED';
type Reward = {
  id: number;
  shop: string;
  offer: string;
  expires: string;
  status: RewardStatus;
  image: string;
  platform: string;
  contentUrl: string;
  claimedViews: number;
};

const PLATFORM_IMAGE_BY_KEY: Record<string, string> = {
  tiktok: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
  instagram: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=400',
  youtube: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
};

export default function RewardsPageScreen() {
  const { width } = useWindowDimensions();
  const isWebGrid = Platform.OS === 'web' && width >= 900;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [filter, setFilter] = useState<'all' | 'ready' | 'used'>('all');

  React.useEffect(() => {
    let cancelled = false;

    const loadRewards = async () => {
      const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
      if (!token) {
        router.replace('/auth');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/rewards/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.status === 401) {
          await AsyncStorage.multiRemove([AUTH_ACCESS_KEY, AUTH_REFRESH_KEY]);
          await stopSavedBusinessGeofences();
          if (!cancelled) router.replace('/auth');
          return;
        }

        if (!res.ok) {
          if (!cancelled) setError(data.error || 'Failed to load rewards.');
          return;
        }

        const mapped: Reward[] = (data.rewards ?? []).map((item: any) => ({
          id: item.reward_id,
          shop: item.shop,
          offer: item.offer,
          expires: item.expires,
          status: item.status === 'USED' ? 'USED' : 'READY TO USE',
          image: PLATFORM_IMAGE_BY_KEY[item.platform] ?? PLATFORM_IMAGE_BY_KEY.tiktok,
          platform: item.platform ?? 'tiktok',
          contentUrl: item.content_url ?? '',
          claimedViews: item.claimed_views ?? 0,
        }));
        if (!cancelled) setRewards(mapped);
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load rewards', e);
          setError('Network error while loading rewards.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRewards();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRewards = useMemo(() => {
    if (filter === 'ready') return rewards.filter((r) => r.status === 'READY TO USE');
    if (filter === 'used') return rewards.filter((r) => r.status === 'USED');
    return rewards;
  }, [filter, rewards]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Active Reward Tickets</Text>
        <Text style={styles.subheading}>Manage and redeem your exclusive local business offers.</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.filters}>
          <Pressable
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All Tickets</Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'ready' && styles.filterButtonActive]}
            onPress={() => setFilter('ready')}
          >
            <Text style={[styles.filterText, filter === 'ready' && styles.filterTextActive]}>Ready to use</Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'used' && styles.filterButtonActive]}
            onPress={() => setFilter('used')}
          >
            <Text style={[styles.filterText, filter === 'used' && styles.filterTextActive]}>Used</Text>
          </Pressable>
        </View>

        {loading ? (
          <Text style={styles.helperText}>Loading rewards...</Text>
        ) : (
          <View style={[styles.cardsContainer, isWebGrid && styles.cardsContainerWeb]}>
          {filteredRewards.map((reward) => (
            <View key={reward.id} style={[styles.card, isWebGrid && styles.cardWeb]}>
              <Image source={{ uri: reward.image }} style={styles.cardImage} />
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shopName}>{reward.shop}</Text>
                    <Text style={[styles.offerText, reward.status === 'USED' && styles.offerUsed]}>{reward.offer}</Text>
                    <Text style={styles.expiresText}>Expires: {reward.expires}</Text>
                    <Text style={styles.metaText}>Platform: {reward.platform}</Text>
                    <Text style={styles.metaText}>Claimed views: {reward.claimedViews}</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{reward.status}</Text>
                  </View>
                </View>

                <Pressable
                  disabled={reward.status === 'USED'}
                  style={[styles.qrButton, reward.status === 'USED' && styles.qrButtonDisabled]}
                  onPress={() => setSelectedReward(reward)}
                >
                  {reward.status === 'USED' ? <Ban size={16} color="#94a3b8" /> : <QrCode size={16} color="#ffffff" />}
                  <Text style={[styles.qrButtonText, reward.status === 'USED' && styles.qrButtonTextDisabled]}>
                    {reward.status === 'USED' ? 'Already Used' : 'View QR Code'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
          {filteredRewards.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No rewards yet</Text>
              <Text style={styles.emptySubtitle}>Rewards are generated after your content submission is approved.</Text>
            </View>
          ) : null}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedReward} transparent animationType="fade" onRequestClose={() => setSelectedReward(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalShop}>{selectedReward?.shop}</Text>
            <Text style={styles.modalOffer}>$10 In-store Credit</Text>

            <View style={styles.qrBox}>
              <QrCode size={150} color="#1e293b" />
            </View>

            <Text style={styles.modalHint}>Scan at checkout to redeem your reward</Text>

            <Pressable style={styles.closeButton} onPress={() => setSelectedReward(null)}>
              <X size={18} color="#ffffff" />
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a2b4b',
  },
  subheading: {
    marginTop: 6,
    marginBottom: 14,
    color: '#64748b',
    fontSize: 14,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#475569',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2b6eff',
    borderColor: '#2b6eff',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  cardsContainer: {
    gap: 12,
  },
  cardsContainerWeb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  cardWeb: {
    width: '31.8%',
    minWidth: 260,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  shopName: {
    color: '#1f2937',
    fontWeight: '700',
    fontSize: 16,
  },
  offerText: {
    color: '#2563eb',
    fontWeight: '700',
    marginTop: 3,
  },
  offerUsed: {
    color: '#94a3b8',
  },
  metaText: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748b',
  },
  expiresText: {
    marginTop: 4,
    fontSize: 12,
    color: '#94a3b8',
  },
  statusPill: {
    backgroundColor: '#ecfdf5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '700',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: '#2b6eff',
  },
  qrButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
  qrButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  qrButtonTextDisabled: {
    color: '#94a3b8',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
  },
  modalShop: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a2b4b',
    textAlign: 'center',
  },
  modalOffer: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  qrBox: {
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#dbeafe',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#ffffff',
  },
  modalHint: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 14,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2b6eff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748b',
  },
});