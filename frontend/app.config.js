/**
 * Merges static app.json with explicit owner + originalFullName so Expo Go exposes them
 * on Constants.expoConfig (needed for AuthSession.getRedirectUrl()).
 *
 * Optional: EXPO_PUBLIC_EXPO_OWNER, EXPO_PUBLIC_EXPO_ORIGINAL_FULL_NAME (include leading @ in full name, e.g. @acme/app)
 *
 * Google Sign-In (native): requires EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in .env for iosUrlScheme at prebuild,
 * or set EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME to the reversed client id scheme from Google Cloud (iOS client).
 */
const base = require('./app.json');

const owner = process.env.EXPO_PUBLIC_EXPO_OWNER ?? base.expo.owner ?? 'krisc2004';
const slug = base.expo.slug ?? 'frontend';
const originalFullName =
  process.env.EXPO_PUBLIC_EXPO_ORIGINAL_FULL_NAME ??
  base.expo.originalFullName ??
  `@${owner}/${slug}`;

function googleIosUrlScheme() {
  const explicit = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME;
  if (explicit) {
    return explicit;
  }
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!iosClientId) {
    throw new Error(
      '[Google Sign-In] Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (or EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME) in frontend/.env — required for the Expo config plugin iosUrlScheme.',
    );
  }
  const idPart = iosClientId.replace(/\.apps\.googleusercontent\.com$/i, '');
  return `com.googleusercontent.apps.${idPart}`;
}

const googleSignInPlugin = [
  '@react-native-google-signin/google-signin',
  {
    iosUrlScheme: googleIosUrlScheme(),
  },
];

module.exports = {
  expo: {
    ...base.expo,
    owner,
    originalFullName,
    plugins: [...(base.expo.plugins || []), googleSignInPlugin],
  },
};
