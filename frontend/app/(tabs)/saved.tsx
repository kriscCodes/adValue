import { Image } from 'expo-image';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { useSavedBusinesses } from '@/hooks/useSavedBusinesses';

export default function SavedScreen() {
  const { savedBusinesses, loading: savedLoading, isSaved, toggleSaved } = useSavedBusinesses();
  const [selectedBusiness, setSelectedBusiness] = useState<(typeof savedBusinesses)[number] | null>(
    null
  );

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
            <Pressable
              key={business.id}
              style={styles.card}
              onPress={() => setSelectedBusiness(business)}>
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
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Modal visible={!!selectedBusiness} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable onPress={() => setSelectedBusiness(null)} style={styles.closeButton}>
              <Text style={styles.closeText}>X</Text>
            </Pressable>
            {selectedBusiness ? (
              <Pressable
                onPress={() => toggleSaved(selectedBusiness.id)}
                style={styles.favoriteButton}
                disabled={savedLoading}>
                {savedLoading ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Ionicons
                    name={isSaved(selectedBusiness.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color={isSaved(selectedBusiness.id) ? '#EF4444' : '#64748B'}
                  />
                )}
              </Pressable>
            ) : null}
            {selectedBusiness ? (
              <>
                <Image source={{ uri: selectedBusiness.img }} style={styles.modalImage} />
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{selectedBusiness.name}</Text>
                  <Text style={styles.modalRating}>
                    ★ {selectedBusiness.rating} ({selectedBusiness.type})
                  </Text>
                  <Text style={styles.modalInfo}>97 West Fordham Road, Bronx</Text>
                  <Text style={styles.modalInfo}>(212) 555-0111</Text>
                  <Pressable style={styles.ctaButton}>
                    <Text style={styles.ctaText}>Get Directions</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    columnGap: 12,
    rowGap: 12,
  },
  card: {
    width: '100%',
    maxWidth: 380,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    right: 46,
    top: 10,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#111827',
    fontWeight: '700',
  },
  modalImage: {
    width: '100%',
    height: 170,
  },
  modalContent: {
    padding: 16,
    gap: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  modalRating: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '600',
  },
  modalInfo: {
    fontSize: 13,
    color: '#4B5563',
  },
  ctaButton: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
