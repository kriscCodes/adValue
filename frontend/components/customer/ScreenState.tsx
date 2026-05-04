import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View style={styles.centerWrap}>
      <ActivityIndicator size="small" color="#2563eb" />
      <Text style={styles.helperText}>{message}</Text>
    </View>
  );
}

type EmptyStateProps = {
  title: string;
  subtitle: string;
};

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

type ErrorStateProps = {
  message: string;
};

export function ErrorState({ message }: ErrorStateProps) {
  return <Text style={styles.errorText}>{message}</Text>;
}

const styles = StyleSheet.create({
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#475569',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 8,
  },
});
