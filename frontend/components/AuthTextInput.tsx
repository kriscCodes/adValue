import { TextInput, View, Text } from 'react-native';

interface AuthTextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  editable?: boolean;
  label?: string;
}

export function AuthTextInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  label,
}: AuthTextInputProps) {
  return (
    <View className="mb-4">
      {label && <Text className="text-gray-700 font-semibold mb-2">{label}</Text>}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        editable={editable}
        className="border border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-500 bg-white"
        placeholderTextColor="#999"
      />
    </View>
  );
}
