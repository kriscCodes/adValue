import { StyleSheet, Text, View } from 'react-native';

export default function BusinessContentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Content Management</Text>
      <Text style={styles.subtitle}>
        This page is a placeholder for managing creator content.
      </Text>
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
    maxWidth: 320,
  },
});
