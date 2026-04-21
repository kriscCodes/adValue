import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY } from '@/lib/auth-config';

export default function BusinessProfileScreen() {
  const handleLogout = async () => {
    await AsyncStorage.multiRemove([BUSINESS_ACCESS_KEY, BUSINESS_REFRESH_KEY]);
    router.replace('/business-auth');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Business Profile</Text>
      <Text style={styles.subtitle}>Manage your business account details here.</Text>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF9FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E56A0',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#1e56a0',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
