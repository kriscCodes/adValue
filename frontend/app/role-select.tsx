import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RoleSelectPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const handleSelect = (role: 'customer' | 'business') => {
    if (role === 'business') {
      router.push('/business-auth');
    } else {
      router.push('/auth');
    }
  };

  if (isDesktop) {
    return (
      <View className="flex-1 flex-row bg-white">
        {/* Left - Branding */}
        <View className="flex-1 bg-blue-600 justify-center items-center p-8">
          <Text className="text-6xl font-bold text-white mb-6">adValue</Text>
          <Text className="text-xl text-white text-center leading-relaxed">
            Connecting local food businesses with their community through context reviews and real
            rewards.
          </Text>
        </View>

        {/* Right - Role Selection */}
        <View className="flex-1 bg-gray-50 justify-center items-center p-12">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Welcome</Text>
          <Text className="text-base text-gray-500 mb-10">How are you using adValue?</Text>

          <TouchableOpacity
            onPress={() => handleSelect('customer')}
            className="w-full max-w-sm bg-white border-2 border-blue-600 rounded-2xl p-6 mb-4 items-center"
          >
            <Ionicons name="person-outline" size={40} color="#2563eb" style={{ marginBottom: 12 }} />
            <Text className="text-xl font-bold text-blue-600 mb-1">I&apos;m a Customer</Text>
            <Text className="text-sm text-gray-500 text-center">
              Discover local businesses, leave reviews, and earn rewards
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelect('business')}
            className="w-full max-w-sm bg-blue-600 rounded-2xl p-6 items-center"
          >
            <Ionicons name="storefront-outline" size={40} color="#fff" style={{ marginBottom: 12 }} />
            <Text className="text-xl font-bold text-white mb-1">I&apos;m a Business</Text>
            <Text className="text-sm text-blue-100 text-center">
              Connect with your community and grow your customer base
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Mobile layout
  return (
    <View className="flex-1 bg-gray-50 justify-center px-6">
      <Text className="text-3xl font-bold text-gray-800 text-center mb-2">Welcome</Text>
      <Text className="text-base text-gray-500 text-center mb-10">How are you using adValue?</Text>

      <TouchableOpacity
        onPress={() => handleSelect('customer')}
        className="bg-white border-2 border-blue-600 rounded-2xl p-6 items-center mb-4"
      >
        <Ionicons name="person-outline" size={40} color="#2563eb" style={{ marginBottom: 12 }} />
        <Text className="text-xl font-bold text-blue-600 mb-1">I'm a Customer</Text>
        <Text className="text-sm text-gray-500 text-center">
          Discover local businesses, leave reviews, and earn rewards
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleSelect('business')}
        className="bg-blue-600 rounded-2xl p-6 items-center"
      >
        <Ionicons name="storefront-outline" size={40} color="#fff" style={{ marginBottom: 12 }} />
        <Text className="text-xl font-bold text-white mb-1">I'm a Business</Text>
        <Text className="text-sm text-blue-100 text-center">
          Connect with your community and grow your customer base
        </Text>
      </TouchableOpacity>
    </View>
  );
}
