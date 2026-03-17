import { View, Text } from 'react-native';

interface BrandingSectionProps {
  isDesktop?: boolean;
}

export function BrandingSection({ isDesktop = false }: BrandingSectionProps) {
  if (isDesktop) {
    return (
      <View className="flex-1 bg-blue-600 justify-center items-center p-8">
        <Text className="text-6xl font-bold text-white mb-6">adValue</Text>
        <Text className="text-xl text-white text-center leading-relaxed">
          Connecting local food businesses with their community through context reviews and real
          rewards.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-blue-600 p-8 justify-center items-center py-12">
      <Text className="text-5xl font-bold text-white mb-4">adValue</Text>
      <Text className="text-lg text-white text-center">
        Connecting local food businesses with their community through context reviews and real
        rewards.
      </Text>
    </View>
  );
}
