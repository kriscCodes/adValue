import { StyleSheet, Text, View } from 'react-native';

export default function BusinessProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Business Profile</Text>
      <Text style={styles.subtitle}>Manage your business account details here.</Text>
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
});
