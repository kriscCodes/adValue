import { View, ScrollView, Text, useWindowDimensions } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { AuthToggleButton } from '@/components/AuthToggleButton';
import { BackToRoleSelectBar } from '@/components/BackToRoleSelectBar';

export default function AuthPage() {
  const {
    mode,
    toggleMode,
    state,
    updateField,
    handleLogin,
    handleSignup,
    handleGoogleLogin,
  } = useAuth();

  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const handleSubmit = () => {
    if (mode === 'login') {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <ScrollView className="flex-1 bg-blue-50">
      <View className={`flex-1 justify-center items-center pb-6 ${isDesktop ? 'px-12' : 'px-6'}`}>
        <BackToRoleSelectBar />
        <Text className="text-5xl font-bold text-blue-600 mb-8">adValue</Text>
        <View className={`w-full ${isDesktop ? 'max-w-md' : ''}`}>
          <AuthToggleButton isSignup={mode === 'signup'} onToggle={toggleMode} />
          <AuthForm
            mode={mode}
            email={state.email}
            password={state.password}
            confirmPassword={state.confirmPassword}
            firstName={state.firstName}
            lastName={state.lastName}
            error={state.error}
            loading={state.loading}
            onEmailChange={(text) => updateField('email', text)}
            onPasswordChange={(text) => updateField('password', text)}
            onConfirmPasswordChange={(text) => updateField('confirmPassword', text)}
            onFirstNameChange={(text) => updateField('firstName', text)}
            onLastNameChange={(text) => updateField('lastName', text)}
            onSubmit={handleSubmit}
            onGoogleSubmit={handleGoogleLogin}
          />
        </View>
      </View>
    </ScrollView>
  );
}
