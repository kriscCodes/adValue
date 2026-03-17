import { Pressable, Text } from 'react-native';

interface AuthToggleButtonProps {
  isSignup: boolean;
  onToggle: () => void;
}

export function AuthToggleButton({ isSignup, onToggle }: AuthToggleButtonProps) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-center gap-2 mb-8"
    >
      <Text className="text-gray-700">
        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
      </Text>
      <Text className="text-blue-600 font-bold">
        {isSignup ? 'Log In' : 'Sign Up'}
      </Text>
    </Pressable>
  );
}
