import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

type Business = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  type: string;
  img: string;
};

/* Refactor for API usage, cards, and popups later but good for now */

const BUSINESSES: Business[] = [
  {
    id: 1,
    name: 'Italian Bistro',
    lat: 40.852,
    lng: -73.895,
    rating: 4.5,
    type: 'Restaurant',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
  },
  {
    id: 2,
    name: "Bryan's Bakery",
    lat: 40.862,
    lng: -73.898,
    rating: 4.8,
    type: 'Bakery',
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
  },
];

const INITIAL_REGION: Region = {
  latitude: 40.855,
  longitude: -73.89,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function ExploreScreen() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [search, setSearch] = useState('');

  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return BUSINESSES;
    }
    return BUSINESSES.filter(
      (business) =>
        business.name.toLowerCase().includes(term) || business.type.toLowerCase().includes(term),
    );
  }, [search]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>adValue</Text>
        <View style={styles.searchWrap}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholder="Search in The Bronx"
            placeholderTextColor="#8B94A6"
          />
        </View>
      </View>

      <View style={styles.mapWrap}>
        <MapView style={styles.map} initialRegion={INITIAL_REGION}>
          {filteredBusinesses.map((business) => (
            <Marker
              key={business.id}
              coordinate={{ latitude: business.lat, longitude: business.lng }}
              title={business.name}
              description={business.type}
              onPress={() => setSelectedBusiness(business)}
            />
          ))}
        </MapView>

        <View style={styles.cardsOverlay}>
          <View style={styles.cardsHeader}>
            <Text style={styles.cardsTitle}>Nearby in The Bronx</Text>
            <Pressable>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredBusinesses.map((business) => (
              <Pressable
                key={business.id}
                style={styles.card}
                onPress={() => setSelectedBusiness(business)}>
                <Image source={{ uri: business.img }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{business.name}</Text>
                  <Text style={styles.cardType}>{business.type}</Text>
                  <Text style={styles.cardRating}>★ {business.rating}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <Modal visible={!!selectedBusiness} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable onPress={() => setSelectedBusiness(null)} style={styles.closeButton}>
              <Text style={styles.closeText}>X</Text>
            </Pressable>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF1',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  brand: {
    color: '#2563EB',
    fontSize: 26,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  searchWrap: {
    width: '100%',
  },
  searchInput: {
    backgroundColor: '#F5F7FB',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  mapWrap: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  cardsOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6EAF1',
  },
  cardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  viewAll: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    width: 230,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAF1',
    marginRight: 10,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 95,
  },
  cardContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  cardType: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardRating: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '700',
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
