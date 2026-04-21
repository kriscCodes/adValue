import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BackToRoleSelectBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => router.replace('/role-select')}
      className="flex-row items-center self-start py-2 active:opacity-70"
      style={{ marginTop: Math.max(insets.top, 8), marginBottom: 4 }}
      accessibilityRole="button"
      accessibilityLabel="Back to role selection"
    >
      <Ionicons name="chevron-back" size={22} color="#2563eb" />
      <Text className="text-base font-semibold text-blue-600">Change role</Text>
    </Pressable>
  );
}
