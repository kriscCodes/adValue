import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Switch, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { 
  User, 
  Mail, 
  Lock, 
  Settings, 
  MapPin, 
  Bell, 
  AlertCircle, 
  LogOut, 
  Search, 
  Compass, 
  Bookmark 
} from 'lucide-react-native';

export default function BusinessProfile() {
  // State for text inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("business.name@example.com");
  const [password, setPassword] = useState("password123"); // Hidden by secureTextEntry

  // State for toggles
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>adValue</Text>
        <View style={styles.searchBar}>
          <Search size={16} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput 
            placeholder="Search The Bronx..." 
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.navIcons}>
          <View style={styles.navItem}>
            <Compass size={20} color="#64748b" />
            <Text style={styles.navText}>Explore</Text>
          </View>
          <View style={styles.navItem}>
            <Bookmark size={20} color="#64748b" />
            <Text style={styles.navText}>Saved</Text>
          </View>
          <View style={styles.avatarCircle} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerName}>Business Name</Text>

        {/* Account Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Account Settings</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color="#94a3b8" />
              <TextInput 
                style={styles.input} 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#94a3b8" />
              <TextInput 
                style={styles.input} 
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true} 
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={() => alert(`Saved! Email is now: ${email}`)}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        {/* App Preferences Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Settings size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>App Preferences</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color="#3b82f6" />
              <View style={styles.settingTextContent}>
                <Text style={styles.settingLabel}>Location Services</Text>
                <Text style={styles.settingSubtext}>Improve ad relevance based on your area</Text>
              </View>
            </View>
            <Switch 
              value={locationEnabled} 
              onValueChange={setLocationEnabled}
              trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#3b82f6" />
              <View style={styles.settingTextContent}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingSubtext}>Daily summaries and alerts</Text>
              </View>
            </View>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
            />
          </View>
        </View>

        {/* Footer Actions */}
        <TouchableOpacity style={styles.reportButton}>
          <AlertCircle size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.reportButtonText}>Report a Problem</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton}>
          <LogOut size={18} color="#475569" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out of adValue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    marginHorizontal: 15,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 14,
    flex: 1,
    color: '#64748b',
    outlineStyle: 'none', // Removes the blue border in web browsers
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  navText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#64748b',
    display: 'none', // Hide text on smaller screens if needed
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fb923c',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  headerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#64748b',
    fontSize: 15,
    outlineStyle: 'none',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 500,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fff',
    marginBottom: 30,
  },
  reportButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  signOutText: {
    color: '#475569',
    fontWeight: '500',
  },
});
