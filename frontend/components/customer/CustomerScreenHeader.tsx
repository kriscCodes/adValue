import { StyleSheet, Text, View } from 'react-native';

type CustomerScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function CustomerScreenHeader({ title, subtitle }: CustomerScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  subtitle: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
});
