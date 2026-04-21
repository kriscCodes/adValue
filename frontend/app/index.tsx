import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, type Href } from 'expo-router';

import {
  AUTH_ACCESS_KEY,
  BUSINESS_ACCESS_KEY,
} from '@/lib/auth-config';

export default function Index() {
  const [target, setTarget] = useState<Href | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const customer = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
      const business = await AsyncStorage.getItem(BUSINESS_ACCESS_KEY);
      if (cancelled) return;
      if (customer) {
        setTarget('/home');
      } else if (business) {
        setTarget('/business');
      } else {
        setTarget('/role-select');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!target) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={target} />;
}
