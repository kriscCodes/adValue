import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { BUSINESS_ACCESS_KEY } from '../hooks/useBusinessAuth';

const getApiHost = () => {
  const hostUri = (Constants.expoConfig?.hostUri || '').split(':')[0];
  if (hostUri) {
    return hostUri;
  }
  return '127.0.0.1';
};

const getApiBases = () => {
  const explicitBase = process.env.EXPO_PUBLIC_API_BASE;
  if (explicitBase) {
    return [explicitBase];
  }

  if (Platform.OS === 'web') {
    return ['http://localhost:8000', 'http://127.0.0.1:8000'];
  }

  const host = getApiHost();
  return [`http://${host}:8000`, 'http://127.0.0.1:8000'];
};

const API_BASES = getApiBases();

export default function BusinessInfo() {
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [predictions, setPredictions] = useState<Array<{ description: string; place_id: string }>>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(async () => {
      const query = address.trim();
      if (query.length < 3) {
        if (active) setPredictions([]);
        return;
      }

      const headers: Record<string, string> = {};

      if (active) setSearchingPlaces(true);
      try {
        let lastErrorBody = '';
        let requestCompleted = false;

        for (const apiBase of API_BASES) {
          const requestUrl = `${apiBase}/api/auth/business/places/autocomplete/?input=${encodeURIComponent(query)}`;
          try {
            console.log('Autocomplete request', {
              requestUrl,
              method: 'GET',
              query,
              hasAuthToken: false,
            });
            const res = await fetch(
              requestUrl,
              { headers }
            );

            const rawBody = await res.text();
            let parsed: any = {};
            try {
              parsed = rawBody ? JSON.parse(rawBody) : {};
            } catch {
              parsed = {};
            }

            if (res.ok) {
              console.log('Autocomplete response', {
                requestUrl,
                status: res.status,
                predictionsCount: (parsed.predictions || []).length,
                response: parsed,
              });
              if (active) setPredictions(parsed.predictions || []);
              requestCompleted = true;
              break;
            }

            lastErrorBody = rawBody.slice(0, 300);
            console.error('Autocomplete backend error', {
              apiBase,
              status: res.status,
              query,
              rawBody: lastErrorBody,
            });
          } catch (innerError) {
            console.error('Autocomplete fetch failed for base', {
              apiBase,
              query,
              error: String(innerError),
            });
          }
        }

        if (active && !requestCompleted) {
          setPredictions([]);
          console.error('Autocomplete failed on all API bases', {
            query,
            apiBases: API_BASES,
            lastErrorBody,
          });
        }
      } catch (error) {
        console.error('Autocomplete fetch failed', {
          query,
          error: String(error),
          apiBases: API_BASES,
        });
        if (active) setPredictions([]);
      } finally {
        if (active) setSearchingPlaces(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [address]);

  const handleSaveBusinessInfo = async () => {
    if (!businessName.trim() || !address.trim() || !description.trim()) {
      Alert.alert('Missing information', 'Please fill in all fields before submitting.');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      let saveSucceeded = false;
      let saveError = 'Unable to save business info right now.';
      const savePayload = {
        business_name: businessName.trim(),
        business_address: address.trim(),
        business_description: description.trim(),
        google_place_id: googlePlaceId,
      };
      for (const apiBase of API_BASES) {
        const requestUrl = `${apiBase}/api/auth/business/profile/`;
        try {
          console.log('Save onboarding request', {
            requestUrl,
            method: 'PATCH',
            payload: savePayload,
            hasAuthToken: false,
          });
          const res = await fetch(requestUrl, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(savePayload),
          });
          const rawBody = await res.text();
          let data: any = {};
          try {
            data = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            data = {};
          }

          if (res.ok) {
            console.log('Save onboarding response', {
              requestUrl,
              status: res.status,
              response: data,
            });
            saveSucceeded = true;
            break;
          }
          saveError = data.error || saveError;
          console.error('Save onboarding backend error', {
            apiBase,
            status: res.status,
            rawBody: rawBody.slice(0, 300),
          });
        } catch (innerError) {
          console.error('Save onboarding request failed', {
            apiBase,
            error: String(innerError),
          });
        }
      }

      if (!saveSucceeded) {
        Alert.alert('Save failed', saveError);
        return;
      }

      Alert.alert('Saved', 'Your business onboarding information has been saved.');
    } catch {
      Alert.alert('Network error', 'Could not connect to the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#EFF9FF' }} className="p-5 justify-center">
      <Text
        style={{
          fontFamily: 'GalaferaMedium',
          fontSize: 38,
          color: '#2A5CC0',
          textAlign: 'center',
          marginBottom: 24,
          fontWeight: '900', // Extra bold for thickness
          letterSpacing: 2, // Slightly more spacing for chunkiness
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        }}
      >
        Onboarding form
      </Text>
      <Text style={{ marginLeft: 4, marginBottom: 4, color: '#2A5CC0', fontWeight: '800' }}>Business Name</Text>
      <TextInput
        placeholder="e.g. AdValue Cafe"
        value={businessName}
        onChangeText={setBusinessName}
        style={{ backgroundColor: '#fff', borderColor: '#d1d5db', borderWidth: 0, borderRadius: 11, padding: 12, marginBottom: 16 }}
        placeholderTextColor="#A0AEC0"
      />
      <Text style={{ marginLeft: 4, marginBottom: 4, color: '#2A5CC0', fontWeight: '800' }}>Address</Text>
      <TextInput
        placeholder="e.g. 123 Main St, City, State"
        value={address}
        onChangeText={(value) => {
          setAddress(value);
          setGooglePlaceId('');
        }}
        style={{ backgroundColor: '#fff', borderColor: '#d1d5db', borderWidth: 0, borderRadius: 11, padding: 12, marginBottom: 8 }}
        placeholderTextColor="#A0AEC0"
      />
      <View style={{ position: 'relative', zIndex: 1000 }}>
        {searchingPlaces ? (
          <Text style={{ marginBottom: 8, color: '#2A5CC0' }}>Searching places...</Text>
        ) : null}
        {predictions.length > 0 ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              borderRadius: 11,
              paddingVertical: 4,
              zIndex: 2000,
              elevation: 12,
              borderWidth: 1,
              borderColor: '#d1d5db',
            }}
          >
            {predictions.map((prediction) => (
              <Pressable
                key={prediction.place_id}
                onPress={() => {
                  setAddress(prediction.description);
                  setGooglePlaceId(prediction.place_id);
                  setPredictions([]);
                }}
                style={{ paddingVertical: 10, paddingHorizontal: 12 }}
              >
                <Text style={{ color: '#1f2937' }}>{prediction.description}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      <Text style={{ marginLeft: 4, marginBottom: 4, color: '#2A5CC0', fontWeight: '800' }}>Description</Text>
      <TextInput
        placeholder="Describe your business"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ backgroundColor: '#fff', borderColor: '#d1d5db', borderWidth: 0, borderRadius: 11, padding: 12, marginBottom: 16, minHeight: 60, textAlignVertical: 'top' }}
        placeholderTextColor="#A0AEC0"
      />
      <Pressable
        onPress={handleSaveBusinessInfo}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#9BB8F0' : '#2A5CC0',
          borderRadius: 11,
          paddingVertical: 12,
          alignItems: 'center',
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '800' }}>Save Business Info</Text>
        )}
      </Pressable>

    </View>
  );
}

