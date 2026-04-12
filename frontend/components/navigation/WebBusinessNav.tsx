import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { usePathname, router } from 'expo-router';

const links: { href: '/business' | '/business/info'; label: string }[] = [
  { href: '/business', label: 'Dashboard' },
  { href: '/business/info', label: 'Store info' },
];

export function WebBusinessNav() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < 520;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#fff',
      }}>
      <Pressable onPress={() => router.push('/business')}>
        <Text
          style={{
            fontSize: compact ? 20 : 24,
            fontWeight: '900',
            fontStyle: 'italic',
            color: '#2563eb',
          }}>
          adValue
        </Text>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 8 : 16 }}>
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Pressable key={href} onPress={() => router.push(href)} hitSlop={8}>
              <Text
                style={{
                  fontSize: compact ? 14 : 15,
                  fontWeight: active ? '700' : '500',
                  color: active ? '#1d4ed8' : '#64748b',
                }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
