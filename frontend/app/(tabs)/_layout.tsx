import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { WebCustomerNav } from '@/components/navigation/WebCustomerNav';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';

  return (
    <View style={{ flex: 1 }}>
      {isWeb ? <WebCustomerNav /> : null}
      <Tabs
        initialRouteName="home"
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: isWeb ? { display: 'none' } : undefined,
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="heart.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            title: 'Rewards',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="ticket.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="customer-verification-form"
          options={{
            title: 'Verification',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="checkmark.shield.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="content-status"
          options={{
            title: 'Content Status',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="list.bullet.rectangle.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
