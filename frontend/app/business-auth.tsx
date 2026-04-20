import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useBusinessAuth } from '@/hooks/useBusinessAuth';
import { AuthTextInput } from '@/components/AuthTextInput';
import { AuthToggleButton } from '@/components/AuthToggleButton';
import { BackToRoleSelectBar } from '@/components/BackToRoleSelectBar';
import { BrandingSection } from '@/components/BrandingSection';

export default function BusinessAuthPage() {
  const { mode, toggleMode, state, updateField, handleLogin, handleSignup } = useBusinessAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const handleSubmit = () => {
    if (mode === 'login') handleLogin();
    else handleSignup();
  };

  const form = (
    <View className="w-full">
      <AuthToggleButton isSignup={mode === 'signup'} onToggle={toggleMode} />

      <AuthTextInput
        label="Business Email"
        placeholder="hello@yourbusiness.com"
        value={state.email}
        onChangeText={(t) => updateField('email', t)}
        keyboardType="email-address"
        editable={!state.loading}
      />

      {mode === 'signup' && (
        <AuthTextInput
          label="Business Name"
          placeholder="e.g. Sunny Cafe"
          value={state.businessName}
          onChangeText={(t) => updateField('businessName', t)}
          editable={!state.loading}
        />
      )}

      {mode === 'signup' && (
        <AuthTextInput
          label="Owner First Name"
          placeholder="John"
          value={state.firstName}
          onChangeText={(t) => updateField('firstName', t)}
          editable={!state.loading}
        />
      )}

      {mode === 'signup' && (
        <AuthTextInput
          label="Owner Last Name"
          placeholder="Doe"
          value={state.lastName}
          onChangeText={(t) => updateField('lastName', t)}
          editable={!state.loading}
        />
      )}

      <AuthTextInput
        label="Password"
        placeholder="Password"
        value={state.password}
        onChangeText={(t) => updateField('password', t)}
        secureTextEntry
        editable={!state.loading}
      />

      {mode === 'signup' && (
        <AuthTextInput
          label="Confirm Password"
          placeholder="Confirm Password"
          value={state.confirmPassword}
          onChangeText={(t) => updateField('confirmPassword', t)}
          secureTextEntry
          editable={!state.loading}
        />
      )}

      {state.error ? (
        <Text
          className={`mb-4 text-center font-semibold ${
            state.error.includes('created') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {state.error}
        </Text>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={state.loading}
        className={`w-full py-4 rounded-full mb-5 ${state.loading ? 'bg-blue-400' : 'bg-blue-600'}`}
      >
        <Text className="text-center text-white font-bold text-lg">
          {state.loading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Sign Up'}
        </Text>
      </Pressable>
    </View>
  );

  if (isDesktop) {
    return (
      <View className="flex-1 flex-row bg-white">
        <BrandingSection isDesktop />
        <View className="flex-1 bg-gray-50 justify-center items-center p-12">
          <ScrollView className="w-full max-w-md" showsVerticalScrollIndicator={false}>
            {form}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 justify-center items-center px-6 pb-6">
        <BackToRoleSelectBar />
        <Text className="text-5xl font-bold text-blue-600 mb-8">adValue</Text>
        <View className="w-full">{form}</View>
      </View>
    </ScrollView>
  );
}
