import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

/* Update app to make sure we're not using search params  */
export default function CustomerProfile() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <View className="flex-1 p-5 justify-center">
      <Text className="text-lg font-semibold mb-2">Customer Profile</Text>
      {email ? (
        <Text className="text-gray-700">Logged in as: {email}</Text>
      ) : (
        <Text className="text-gray-500">No user email (open this after logging in).</Text>
      )}
    </View>
  );
}
