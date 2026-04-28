import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ENABLE_AUTO_RESUME_SESSION } from '@/lib/auth-config';
import { getSessionState, resolveSessionConflict } from '@/lib/session';
import { BrandingSection } from '@/components/BrandingSection';

type ResumeTarget = Href | null;

export default function Index() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [resumeTarget, setResumeTarget] = useState<ResumeTarget>(null);

  useEffect(() => {
    let active = true;

    async function resolveResumeState() {
      const { hasCustomerSession, hasBusinessSession } = await getSessionState();
      if (!active) return;

      if (!ENABLE_AUTO_RESUME_SESSION) {
        setResumeTarget(null);
        setIsCheckingSession(false);
        return;
      }

      if (hasCustomerSession && hasBusinessSession) {
        const winner = await resolveSessionConflict();
        if (!active) return;
        setResumeTarget(winner === 'business' ? '/business' : '/home');
      } else if (hasCustomerSession) {
        setResumeTarget('/home');
      } else if (hasBusinessSession) {
        setResumeTarget('/business');
      } else {
        setResumeTarget(null);
      }
      setIsCheckingSession(false);
    }

    resolveResumeState();
    return () => {
      active = false;
    };
  }, []);

  if (isCheckingSession) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isDesktop ? (
        <View style={styles.desktopLayout}>
          <BrandingSection isDesktop />
          <View style={styles.desktopRight}>
            <Text style={styles.heading}>Welcome</Text>
            <Text style={styles.subheading}>How are you using adValue?</Text>

            <TouchableOpacity
              onPress={() => router.push('/auth')}
              style={[styles.roleCard, styles.customerCard]}
            >
              <Ionicons name="person-outline" size={40} color="#2563eb" style={{ marginBottom: 12 }} />
              <Text style={styles.customerTitle}>I&apos;m a Customer</Text>
              <Text style={styles.customerDesc}>
                Discover local businesses, leave reviews, and earn rewards
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/business-auth')}
              style={[styles.roleCard, styles.businessCard]}
            >
              <Ionicons name="storefront-outline" size={40} color="#fff" style={{ marginBottom: 12 }} />
              <Text style={styles.businessTitle}>I&apos;m a Business</Text>
              <Text style={styles.businessDesc}>
                Connect with your community and grow your customer base
              </Text>
            </TouchableOpacity>

            {resumeTarget ? (
              <Pressable style={styles.resumeButton} onPress={() => router.replace(resumeTarget)}>
                <Text style={styles.resumeText}>Continue previous session</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.mobileLayout}>
          <Text style={styles.heading}>Welcome</Text>
          <Text style={styles.subheading}>How are you using adValue?</Text>

          <TouchableOpacity
            onPress={() => router.push('/auth')}
            style={[styles.roleCard, styles.customerCard]}
          >
            <Ionicons name="person-outline" size={40} color="#2563eb" style={{ marginBottom: 12 }} />
            <Text style={styles.customerTitle}>I&apos;m a Customer</Text>
            <Text style={styles.customerDesc}>
              Discover local businesses, leave reviews, and earn rewards
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/business-auth')}
            style={[styles.roleCard, styles.businessCard]}
          >
            <Ionicons name="storefront-outline" size={40} color="#fff" style={{ marginBottom: 12 }} />
            <Text style={styles.businessTitle}>I&apos;m a Business</Text>
            <Text style={styles.businessDesc}>
              Connect with your community and grow your customer base
            </Text>
          </TouchableOpacity>

          {resumeTarget ? (
            <Pressable style={styles.resumeButton} onPress={() => router.replace(resumeTarget)}>
              <Text style={styles.resumeText}>Continue previous session</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  desktopRight: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  mobileLayout: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 28,
    textAlign: 'center',
  },
  roleCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
  },
  customerCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  businessCard: {
    backgroundColor: '#2563eb',
  },
  customerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
  },
  customerDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  businessTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  businessDesc: {
    fontSize: 14,
    color: '#dbeafe',
    textAlign: 'center',
    lineHeight: 20,
  },
  resumeButton: {
    marginTop: 8,
    alignItems: 'center',
  },
  resumeText: {
    color: '#1d4ed8',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
