import { View, Text, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { AuthTextInput } from './AuthTextInput';

interface AuthFormProps {
  mode: 'login' | 'signup';
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  error: string;
  loading: boolean;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  onFirstNameChange: (text: string) => void;
  onLastNameChange: (text: string) => void;
  onSubmit: () => void;
}

export function AuthForm({
  mode,
  email,
  password,
  confirmPassword,
  firstName,
  lastName,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
}: AuthFormProps) {
  return (
    <View className="w-full">
      {/* Email Field */}
      <AuthTextInput
        label="Email"
        placeholder="e.g. howard.thurman@email.com"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        editable={!loading}
      />

      {/* First Name Field (Signup only) */}
      {mode === 'signup' && (
        <AuthTextInput
          label="First Name"
          placeholder="John"
          value={firstName}
          onChangeText={onFirstNameChange}
          editable={!loading}
        />
      )}

      {/* Last Name Field (Signup only) */}
      {mode === 'signup' && (
        <AuthTextInput
          label="Last Name"
          placeholder="Doe"
          value={lastName}
          onChangeText={onLastNameChange}
          editable={!loading}
        />
      )}

      {/* Password Field */}
      <AuthTextInput
        label="Password"
        placeholder="Password"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        editable={!loading}
      />

      {/* Confirm Password Field (Signup only) */}
      {mode === 'signup' && (
        <AuthTextInput
          label="Confirm Password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={onConfirmPasswordChange}
          secureTextEntry
          editable={!loading}
        />
      )}

      {/* Error Message */}
      {error && (
        <Text
          className={`mb-4 text-center font-semibold ${
            error.includes('created') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {error}
        </Text>
      )}

      {/* Main Button */}
      <Pressable
        onPress={onSubmit}
        disabled={loading}
        className={`w-full py-4 rounded-full mb-5 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
      >
        <Text className="text-center text-white font-bold text-lg">
          {loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </Text>
      </Pressable>

      {/* Divider */}
      <View className="flex-row items-center mb-5">
        <View className="flex-1 border-b border-gray-300" />
        <Text className="mx-3 text-gray-600 font-semibold">OR</Text>
        <View className="flex-1 border-b border-gray-300" />
      </View>

      {/* Google Button */}
      <Pressable className="w-full border-2 border-gray-300 py-3 rounded-full flex-row items-center justify-center gap-2">
        <AntDesign name="google" size={20} color="#4285F4" />
        <Text className="text-center text-gray-800 font-semibold">
          Continue with Google
        </Text>
      </Pressable>
    </View>
  );
}
