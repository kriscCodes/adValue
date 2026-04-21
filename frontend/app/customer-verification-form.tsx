import React, { useEffect, useState } from 'react';
import { Camera, Link as LinkIcon, Play } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_BASE, AUTH_ACCESS_KEY, AUTH_REFRESH_KEY } from '@/lib/auth-config';

const platforms = [
  { id: 'tiktok', label: 'TikTok', icon: Play },
  { id: 'instagram', label: 'Instagram Reels', icon: Camera },
  { id: 'youtube', label: 'YouTube Shorts', icon: Play },
] as const;

export default function CustomerVerificationFormScreen() {
  type BusinessResult = {
    business_id: number;
    business_name: string;
    business_address: string;
  };

  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [videoLink, setVideoLink] = useState('');
  const [claimedViews, setClaimedViews] = useState('');
  const [businessQuery, setBusinessQuery] = useState('');
  const [businessResults, setBusinessResults] = useState<BusinessResult[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessResult | null>(null);
  const [searchingBusinesses, setSearchingBusinesses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
        if (!token) {
          router.replace('/auth');
          return;
        }

        const res = await fetch(`${API_BASE}/api/auth/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          await AsyncStorage.multiRemove([AUTH_ACCESS_KEY, AUTH_REFRESH_KEY]);
          if (!cancelled) {
            router.replace('/auth');
          }
          return;
        }
      } catch (err) {
        console.error('Auth check failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedBusiness && businessQuery === selectedBusiness.business_name) {
      return;
    }

    const query = businessQuery.trim();
    if (query.length < 2) {
      setBusinessResults([]);
      setSearchingBusinesses(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingBusinesses(true);
      try {
        const res = await fetch(`${API_BASE}/api/auth/business/search/?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) {
          setBusinessResults([]);
          return;
        }
        setBusinessResults(data.businesses ?? []);
      } catch (searchErr) {
        console.error('Business search failed', searchErr);
        setBusinessResults([]);
      } finally {
        setSearchingBusinesses(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [businessQuery, selectedBusiness]);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!selectedBusiness || !selectedPlatform || !videoLink || claimedViews === '') {
      setError('Please select a business, platform, video link, and claimed views.');
      return;
    }

    const parsedViews = Number.parseInt(claimedViews, 10);
    if (Number.isNaN(parsedViews) || parsedViews < 0) {
      setError('Claimed views must be a non-negative integer.');
      return;
    }

    const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
    if (!token) {
      router.replace('/auth');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/content/submissions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: selectedBusiness.business_id,
          platform: selectedPlatform,
          content_url: videoLink,
          views: parsedViews,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        await AsyncStorage.multiRemove([AUTH_ACCESS_KEY, AUTH_REFRESH_KEY]);
        router.replace('/auth');
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Failed to submit content.');
        return;
      }

      setSuccess('Submission sent for review.');
      setVideoLink('');
      setClaimedViews('');
      setBusinessQuery('');
      setSelectedBusiness(null);
      setBusinessResults([]);
      setSelectedPlatform(null);
    } catch (submitErr) {
      console.error('Content submission failed', submitErr);
      setError('Network error while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3b63cc" />
        <Text style={styles.loadingText}>Verifying session...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.heading}>Customer Verification Form</Text>

      <View style={styles.card}>
        <View style={styles.businessRow}>
          <View style={styles.businessInfo}>
            <View style={styles.businessIcon}>
              <Text style={styles.businessEmoji}>🍜</Text>
            </View>
            <View>
              <Text style={styles.businessName}>Mama Rosa&apos;s Kitchen</Text>
              <Text style={styles.businessMeta}>Italian · 142 Orchard St, New York, NY</Text>
            </View>
          </View>
          <View style={styles.registeredBadge}>
            <Text style={styles.registeredBadgeText}>Registered</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Business Title</Text>
        <TextInput
          style={styles.input}
          value={businessQuery}
          onChangeText={(text) => {
            setBusinessQuery(text);
            if (selectedBusiness && text !== selectedBusiness.business_name) {
              setSelectedBusiness(null);
            }
          }}
          placeholder="Search business by title"
          placeholderTextColor="#94a3b8"
        />
        {searchingBusinesses ? <Text style={styles.helperText}>Searching businesses...</Text> : null}
        {selectedBusiness ? (
          <Text style={styles.selectedBusinessText}>
            Selected: {selectedBusiness.business_name} (ID {selectedBusiness.business_id})
          </Text>
        ) : null}
        {!selectedBusiness && businessQuery.trim().length >= 2 && businessResults.length > 0 ? (
          <View style={styles.searchResults}>
            {businessResults.map((business) => (
              <Pressable
                key={business.business_id}
                style={styles.searchResultItem}
                onPress={() => {
                  setSelectedBusiness(business);
                  setBusinessQuery(business.business_name);
                  setBusinessResults([]);
                }}
              >
                <Text style={styles.searchResultName}>{business.business_name}</Text>
                <Text style={styles.searchResultMeta}>
                  ID {business.business_id}
                  {business.business_address ? ` • ${business.business_address}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.inlineHeader}>
          <Camera size={18} color="#334155" />
          <Text style={styles.sectionHeading}>Video Review Details</Text>
        </View>

        <Text style={styles.sectionTitle}>Platform Posted On</Text>
        <View style={styles.platformsRow}>
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const selected = selectedPlatform === platform.id;
            return (
              <Pressable
                key={platform.id}
                onPress={() => setSelectedPlatform(selected ? null : platform.id)}
                style={[styles.platformPill, selected && styles.platformPillSelected]}
              >
                <Icon size={14} color={selected ? '#1e40af' : '#475569'} />
                <Text style={[styles.platformPillText, selected && styles.platformPillTextSelected]}>
                  {platform.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Video Link</Text>
        <View style={styles.iconInput}>
          <LinkIcon size={18} color="#64748b" />
          <TextInput
            style={styles.iconInputText}
            value={videoLink}
            onChangeText={setVideoLink}
            placeholder="https://www.tiktok.com/@yourhandle/video/..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        <Text style={styles.sectionTitle}>Claimed View Count</Text>
        <TextInput
          style={styles.input}
          value={claimedViews}
          onChangeText={setClaimedViews}
          placeholder="e.g. 15000"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f0f7ff',
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7ff',
    gap: 10,
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
  },
  heading: {
    fontSize: 28,
    color: '#2a59c3',
    fontWeight: '800',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    gap: 12,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8faff',
    borderColor: '#dbeafe',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  businessIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b63cc',
  },
  businessEmoji: {
    fontSize: 20,
  },
  businessName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  businessMeta: {
    fontSize: 11,
    color: '#64748b',
  },
  registeredBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e7f9f0',
  },
  registeredBadgeText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e56a0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  iconInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconInputText: {
    flex: 1,
    color: '#0f172a',
    fontSize: 14,
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformPill: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
  },
  platformPillSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#1d4ed8',
  },
  platformPillText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  platformPillTextSelected: {
    color: '#1e40af',
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: '#3b63cc',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  errorText: {
    marginTop: 4,
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  successText: {
    marginTop: 4,
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
  },
  helperText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: -2,
  },
  selectedBusinessText: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -2,
  },
  searchResults: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  searchResultItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchResultName: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  searchResultMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
});