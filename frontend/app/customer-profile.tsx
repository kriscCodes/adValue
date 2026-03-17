import { View, Text, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { router, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://127.0.0.1:8000';
const AUTH_ACCESS_KEY = 'auth_access';

type Profile = {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	location_enabled: boolean;
} | null;

export default function CustomerProfile() {
	const [profile, setProfile] = useState<Profile>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadProfile() {
			const token = await AsyncStorage.getItem(AUTH_ACCESS_KEY);
			if (!token) {
				if (!cancelled) router.replace('/auth' as Href);
				return;
			}
			try {
				const res = await fetch(`${API_BASE}/api/auth/profile/`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (res.status === 401) {
					await AsyncStorage.removeItem(AUTH_ACCESS_KEY);
					if (!cancelled) router.replace('/auth' as Href);
					return;
				}
				const data = await res.json();
				if (!res.ok) {
					if (!cancelled) setError(data.error || 'Failed to load profile');
					return;
				}
				if (!cancelled) setProfile(data);
			} catch {
				if (!cancelled) setError('Network error');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		loadProfile();
		return () => {
			cancelled = true;
		};
	}, []);

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 p-5 justify-center">
				<Text className="text-red-600">{error}</Text>
			</View>
		);
	}

	if (!profile) return null;

	return (
		<View className="flex-1 p-5 justify-center">
			<Text className="text-lg font-semibold mb-2">Customer Profile</Text>
			<Text className="text-gray-700">Email: {profile.email}</Text>
			<Text className="text-gray-700 mt-1">
				Name: {profile.first_name} {profile.last_name}
			</Text>
			<Text className="text-gray-700 mt-1">
				Location enabled: {profile.location_enabled ? 'Yes' : 'No'}
			</Text>
		</View>
	);
}
