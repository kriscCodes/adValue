import { View, Text, Pressable } from 'react-native';

interface AuthToggleButtonProps {
  isSignup: boolean;
  onToggle: () => void;
}

export function AuthToggleButton({ isSignup, onToggle }: AuthToggleButtonProps) {
  return (
    <View className="flex-row bg-gray-200 rounded-full p-1 mb-8">
      <Pressable
        onPress={() => isSignup && onToggle()}
        className={`flex-1 py-2 rounded-full items-center ${!isSignup ? 'bg-blue-600' : ''}`}
      >
        <Text className={`font-semibold ${!isSignup ? 'text-white' : 'text-gray-500'}`}>
          Log In
        </Text>
      </Pressable>
      <Pressable
        onPress={() => !isSignup && onToggle()}
        className={`flex-1 py-2 rounded-full items-center ${isSignup ? 'bg-blue-600' : ''}`}
      >
        <Text className={`font-semibold ${isSignup ? 'text-white' : 'text-gray-500'}`}>
          Sign Up
        </Text>
      </Pressable>
    </View>
  );
}
