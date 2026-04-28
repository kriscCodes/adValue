import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import './global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSessionState, setLastActiveRole } from '@/lib/session';

WebBrowser.maybeCompleteAuthSession();

const PUBLIC_PATHS = new Set([
  '/',
  '/role-select',
  '/auth',
  '/business-auth',
  '/customer-login',
  '/customer-signup',
]);

function getRequiredSession(pathname: string | null): 'public' | 'customer' | 'business' {
  if (!pathname || PUBLIC_PATHS.has(pathname)) {
    return 'public';
  }
  if (pathname === '/business' || pathname.startsWith('/business/')) {
    return 'business';
  }
  return 'customer';
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  useFonts({
    GalaferaMedium: require('../assets/images/fonts/GalaferaMedium-V4xze.ttf'),
  });

  useEffect(() => {
    let active = true;

    async function guardRoute() {
      const required = getRequiredSession(pathname);

      if (required === 'public') {
        if (active) setIsCheckingAuth(false);
        return;
      }

      if (required === 'business') {
        const session = await getSessionState();
        if (!session.hasBusinessSession) {
          router.replace('/business-auth');
        } else {
          await setLastActiveRole('business');
        }
        if (active) setIsCheckingAuth(false);
        return;
      }

      const session = await getSessionState();
      if (!session.hasCustomerSession) {
        router.replace('/auth');
      } else {
        await setLastActiveRole('customer');
      }
      if (active) setIsCheckingAuth(false);
    }

    guardRoute();
    return () => {
      active = false;
    };
  }, [pathname]);

  if (isCheckingAuth) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="role-select" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="business-auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="business" options={{ headerShown: false }} />
        <Stack.Screen name="customer-profile" options={{ headerShown: false }} />
        <Stack.Screen name="business-profile" options={{ headerShown: false }} />
        <Stack.Screen name="business-info" options={{ headerShown: false }} />
        <Stack.Screen name="customer-login" options={{ headerShown: false }} />
        <Stack.Screen name="customer-signup" options={{ headerShown: false }} />
        <Stack.Screen
          name="content-creators"
          options={{ title: 'Content Creators', headerShown: true }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
