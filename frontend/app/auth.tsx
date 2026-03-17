import { View, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { AuthToggleButton } from '@/components/AuthToggleButton';
import { BrandingSection } from '@/components/BrandingSection';

export default function AuthPage() {
  const {
    mode,
    toggleMode,
    state,
    updateField,
    handleLogin,
    handleSignup,
  } = useAuth();

  const { width } = Dimensions.get('window');
  const isDesktop = width > 768;

  const handleSubmit = () => {
    if (mode === 'login') {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  // Desktop Layout (split view)
  if (isDesktop) {
    return (
      <View className="flex-1 flex-row bg-white">
        {/* Left Side - Branding */}
        <BrandingSection isDesktop />

        {/* Right Side - Form */}
        <View className="flex-1 bg-gray-50 justify-center items-center p-12">
          <ScrollView className="w-full max-w-md" showsVerticalScrollIndicator={false}>
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
            />
          </ScrollView>
        </View>
      </View>
    );
  }

  // Mobile Layout (full width)
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <BrandingSection />

      <View className="flex-1 justify-center items-center p-6">
        <View className="w-full">
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
          />
        </View>
      </View>
    </ScrollView>
  );
}
