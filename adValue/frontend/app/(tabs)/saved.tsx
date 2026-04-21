import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useSavedBusinesses } from '@/hooks/useSavedBusinesses';

export default function SavedScreen() {
  const { savedBusinesses, isSaved, toggleSaved } = useSavedBusinesses();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Businesses</Text>
        <Text style={styles.subtitle}>{savedBusinesses.length} saved</Text>
      </View>

      {savedBusinesses.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={30} color="#64748B" />
          <Text style={styles.emptyTitle}>No saved businesses yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart icon on a business in Explore to add it here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {savedBusinesses.map((business) => (
            <View key={business.id} style={styles.card}>
              <Image source={{ uri: business.img }} style={styles.image} />
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{business.name}</Text>
                    <Text style={styles.type}>{business.type}</Text>
                  </View>
                  <Pressable
                    onPress={() => toggleSaved(business.id)}
                    style={styles.heartButton}
                    hitSlop={8}>
                    <Ionicons
                      name={isSaved(business.id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isSaved(business.id) ? '#EF4444' : '#64748B'}
                    />
                  </Pressable>
                </View>
                <Text style={styles.rating}>★ {business.rating}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF1',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  list: {
    padding: 14,
    gap: 12,
  },
  card: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAF1',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  type: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },
  rating: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '700',
  },
  heartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
  },
});
