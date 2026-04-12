/* Ai/Prompot used to create this screen in case I forget to add to commit: Can you make an example test page that pulls from our database and displays the users in a table. We should already have a view and URL for this in our backend application @backend/views.py and @backend/urls.py. Populate it into a table and leave comments ont he different expo components you used and why you used them  */

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE } from '@/lib/auth-config';

type ContentCreator = {
  name: string | null;
  email: string | null;
  business: string | null;
  social_views: string | number | null;
};

export default function ContentCreatorsScreen() {
  const colorScheme = useColorScheme();
  const [creators, setCreators] = useState<ContentCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // to fetch without remounting or running more than once use callback 
  const fetchCreators = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/api/content-creators/`);
      if (!res.ok) {
        if (res.status === 401) {
          setError('API requires login. Add AllowAny to get_content_creators view for testing.');
        } else {
          setError(`Request failed: ${res.status}`);
        }
        setCreators([]);
        return;
      }
      const json = await res.json();
      setCreators(json.content_creators ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setCreators([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCreators();
  }, [fetchCreators]);

  const colors = Colors[colorScheme ?? 'light'];
  const borderColor = colorScheme === 'dark' ? '#333' : '#ddd';

  return (
    <ThemedView style={styles.container}>
      {/* ScrollView: Lets the table scroll vertically when there are many rows.
          React Native has no <table>; we build a table with Views and ScrollView. */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        showsVerticalScrollIndicator>
        {/* ThemedText: Uses app theme (light/dark) so the title respects system theme. */}
        <ThemedText type="title" style={styles.title}>
          Content Creators
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.subtitle}>
          Data from GET /api/content-creators/
        </ThemedText>

        {loading ? (
          /* ActivityIndicator: Native loading spinner. Better UX than a static "Loading..." only. */
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.loadingText}>Loading…</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        ) : (
          <>
            {/* Table header row: View + flexDirection row gives us a single row of columns. */}
            <View style={[styles.row, styles.headerRow, { borderColor }]}>
              <Text style={[styles.cell, styles.headerCell, styles.nameCol]} numberOfLines={1}>
                Name
              </Text>
              <Text style={[styles.cell, styles.headerCell, styles.emailCol]} numberOfLines={1}>
                Email
              </Text>
              <Text style={[styles.cell, styles.headerCell, styles.businessCol]} numberOfLines={1}>
                Business
              </Text>
              <Text style={[styles.cell, styles.headerCell, styles.viewsCol]} numberOfLines={1}>
                Views
              </Text>
            </View>
            {/* Data rows: map over creators. Each row is a View with flexDirection row. */}
            {creators.length === 0 ? (
              <ThemedText style={styles.emptyText}>No content creators found.</ThemedText>
            ) : (
              creators.map((creator, index) => (
                <View
                  key={`${creator.email}-${index}`}
                  style={[styles.row, { borderColor }, index % 2 === 1 && styles.rowStriped]}>
                  <Text style={[styles.cell, styles.nameCol]} numberOfLines={1}>
                    {creator.name ?? '—'}
                  </Text>
                  <Text style={[styles.cell, styles.emailCol]} numberOfLines={1}>
                    {creator.email ?? '—'}
                  </Text>
                  <Text style={[styles.cell, styles.businessCol]} numberOfLines={1}>
                    {creator.business ?? '—'}
                  </Text>
                  <Text style={[styles.cell, styles.viewsCol]} numberOfLines={1}>
                    {creator.social_views != null ? String(creator.social_views) : '—'}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Link: Expo Router navigation. Lets user go back without hardcoding the route. */}
      <View style={styles.footer}>
        <Link href="/home" asChild>
          <ThemedText type="link">← Back to home</ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.8,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
  },
  errorText: {
    color: '#c00',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerRow: {
    borderBottomWidth: 2,
    paddingVertical: 12,
  },
  headerCell: {
    fontWeight: '700',
  },
  rowStriped: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  cell: {
    fontSize: 14,
  },
  nameCol: {
    flex: 1.2,
    minWidth: 0,
  },
  emailCol: {
    flex: 1.5,
    minWidth: 0,
  },
  businessCol: {
    flex: 1,
    minWidth: 0,
  },
  viewsCol: {
    flex: 0.6,
    minWidth: 0,
  },
  emptyText: {
    paddingVertical: 24,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
