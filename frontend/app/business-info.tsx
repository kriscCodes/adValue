import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';

export default function BusinessInfo() {
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: '#EFF9FF' }} className="p-5 justify-center">
      <Text
        style={{
          fontFamily: 'GalaferaMedium',
          fontSize: 38,
          color: '#2A5CC0',
          textAlign: 'center',
          marginBottom: 24,
          fontWeight: '900', // Extra bold for thickness
          letterSpacing: 2, // Slightly more spacing for chunkiness
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        }}
      >
        Onboarding form
      </Text>
      <Text style={{ marginLeft: 4, marginBottom: 4, color: '#2A5CC0', fontWeight: '800' }}>Business Name</Text>
      <TextInput
        placeholder="e.g. AdValue Cafe"
        value={businessName}
        onChangeText={setBusinessName}
        style={{ backgroundColor: '#fff', borderColor: '#d1d5db', borderWidth: 0, borderRadius: 11, padding: 12, marginBottom: 16 }}
        placeholderTextColor="#A0AEC0"
      />
      <Text style={{ marginLeft: 4, marginBottom: 4, color: '#2A5CC0', fontWeight: '800' }}>Address</Text>
      <TextInput
        placeholder="e.g. 123 Main St, City, State"
        value={address}
        onChangeText={setAddress}
        style={{ backgroundColor: '#fff', borderColor: '#d1d5db', borderWidth: 0, borderRadius: 11, padding: 12, marginBottom: 16 }}
        placeholderTextColor="#A0AEC0"
      />
      <Text style={{ marginLeft: 4, marginBottom: 4, color: '#2A5CC0', fontWeight: '800' }}>Description</Text>
      <TextInput
        placeholder="Describe your business"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={{ backgroundColor: '#fff', borderColor: '#d1d5db', borderWidth: 0, borderRadius: 11, padding: 12, marginBottom: 16, minHeight: 60, textAlignVertical: 'top' }}
        placeholderTextColor="#A0AEC0"
      />
      {/* You can add a submit button here later */}
    </View>
  );
}

