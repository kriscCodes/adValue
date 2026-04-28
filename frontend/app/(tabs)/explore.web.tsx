import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  HUNTER_COLLEGE_CENTER,
  type Business,
} from './explore-shared';
import { useExplorePlaces } from '@/hooks/useExplorePlaces';
import { useSavedBusinesses } from '@/hooks/useSavedBusinesses';

const LEAFLET_CSS_ID = 'advalue-leaflet-css';
const LEAFLET_CSS_HREF = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

function injectLeafletCss(): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }
  const existing = document.getElementById(LEAFLET_CSS_ID);
  if (existing) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = LEAFLET_CSS_ID;
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS_HREF;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error('Failed to load Leaflet CSS'));
    document.head.appendChild(link);
  });
}

type LeafletModules = {
  /** Dynamic `import('leaflet')` default; `any` avoids Leaflet CJS/ESM typing friction. */
  L: any;
  MapContainer: typeof import('react-leaflet').MapContainer;
  Marker: typeof import('react-leaflet').Marker;
  TileLayer: typeof import('react-leaflet').TileLayer;
  CircleMarker: typeof import('react-leaflet').CircleMarker;
};

export default function ExploreScreenWeb() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [search, setSearch] = useState('');
  const [leafletMods, setLeafletMods] = useState<LeafletModules | null>(null);
  const [userLatLng, setUserLatLng] = useState<[number, number] | null>(null);
  const explorePlaces = useExplorePlaces();
  const { loading: savedLoading, isSaved, toggleSaved } = useSavedBusinesses();

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLatLng([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLeafletClientOnly() {
      try {
        await injectLeafletCss();
        const leaflet = await import('leaflet');
        const reactLeaflet = await import('react-leaflet');
        if (cancelled) {
          return;
        }
        setLeafletMods({
          L: leaflet.default,
          MapContainer: reactLeaflet.MapContainer,
          Marker: reactLeaflet.Marker,
          TileLayer: reactLeaflet.TileLayer,
          CircleMarker: reactLeaflet.CircleMarker,
        });
      } catch {
        if (!cancelled) {
          setLeafletMods(null);
        }
      }
    }

    loadLeafletClientOnly();
    return () => {
      cancelled = true;
    };
  }, []);

  const customIcon = useMemo(() => {
    if (!leafletMods) {
      return null;
    }
    return new leafletMods.L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [30, 30],
    });
  }, [leafletMods]);

  const filteredBusinesses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return explorePlaces;
    }
    return explorePlaces.filter(
      (business) =>
        business.name.toLowerCase().includes(term) || business.type.toLowerCase().includes(term),
    );
  }, [search, explorePlaces]);

  const { MapContainer, Marker, TileLayer, CircleMarker } = leafletMods ?? {};

  return (
    <View style={styles.root}>
      <View style={styles.header}>
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
        {leafletMods && customIcon && MapContainer && Marker && TileLayer && CircleMarker ? (
          <MapContainer
            center={[HUNTER_COLLEGE_CENTER.latitude, HUNTER_COLLEGE_CENTER.longitude]}
            zoom={15}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            {userLatLng ? (
              <CircleMarker
                center={userLatLng}
                radius={10}
                pathOptions={{
                  color: '#2563eb',
                  fillColor: '#2563eb',
                  fillOpacity: 0.95,
                  weight: 2,
                }}
              />
            ) : null}
            {filteredBusinesses.map((business) => (
              <Marker
                key={business.id}
                position={[business.lat, business.lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => setSelectedBusiness(business),
                }}
              />
            ))}
          </MapContainer>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.placeholderText}>Loading map…</Text>
          </View>
        )}

        <View style={styles.cardsOverlay} pointerEvents="box-none">
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
                  <Text style={styles.modalInfo}>
                    {selectedBusiness.address ?? '97 West Fordham Road, Bronx'}
                  </Text>
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
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    minHeight: 0,
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
    minHeight: 0,
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 14,
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
    zIndex: 1000,
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
