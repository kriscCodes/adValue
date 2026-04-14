import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, Settings, MoreHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import Svg, { Polyline, Line, Text as SvgText } from 'react-native-svg';

const PLATFORMS = ['Instagram', 'Youtube', 'Tiktok'];

const CREATORS = [
  { name: 'Faikar', views: '10k', platform: 'Tiktok' },
  { name: 'Kris', views: '1k', platform: 'Instagram' },
  { name: 'Jasmine', views: '100k', platform: 'Tiktok' },
  { name: 'Jasmine', views: '100k', platform: 'Tiktok' },
];

// Simple placeholder line chart drawn with SVG
function ViewsChart() {
  const W = 280;
  const H = 180;
  const padL = 36;
  const padB = 24;
  const padT = 8;
  const padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;

  // Dummy data points (0–100 range)
  const data = [10, 30, 20, 50, 40, 60, 45];
  const maxVal = 100;
  const points = data
    .map((v, i) => {
      const x = padL + (i / (data.length - 1)) * chartW;
      const y = padT + chartH - (v / maxVal) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  const yLabels = [0, 25, 50, 75, 100];

  return (
    <Svg width={W} height={H}>
      {/* Y-axis gridlines & labels */}
      {yLabels.map((label) => {
        const y = padT + chartH - (label / maxVal) * chartH;
        return (
          <React.Fragment key={label}>
            <Line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <SvgText
              x={padL - 4}
              y={y + 4}
              fontSize="8"
              fill="#94a3b8"
              textAnchor="end">
              {label}
            </SvgText>
          </React.Fragment>
        );
      })}
      {/* X-axis label */}
      <SvgText
        x={W / 2}
        y={H - 4}
        fontSize="9"
        fill="#94a3b8"
        textAnchor="middle">
        Days
      </SvgText>
      {/* Y-axis label */}
      <SvgText
        x={8}
        y={H / 2}
        fontSize="9"
        fill="#94a3b8"
        textAnchor="middle"
        transform={`rotate(-90, 8, ${H / 2})`}>
        Views
      </SvgText>
      {/* Line */}
      <Polyline
        points={points}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
      />
    </Svg>
  );
}

export default function BusinessDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const showInlineNav = Platform.OS !== 'web';

  return (
    <SafeAreaView style={styles.container}>
      {showInlineNav && (
        <View style={styles.navbar}>
          <Text style={styles.logo}>adValue</Text>
          <View style={styles.searchBar}>
            <Search size={14} color="#94a3b8" style={{ marginRight: 6 }} />
            <TextInput
              placeholder="Search The Bronx..."
              placeholderTextColor="#94a3b8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.navIcons}>
            <Bell size={20} color="#64748b" style={{ marginRight: 12 }} />
            <View style={styles.menuLines}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.menuLine} />
              ))}
            </View>
            <TouchableOpacity onPress={() => router.push('/business/profile')}>
              <View style={styles.avatarCircle} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Business name */}
        <Text style={styles.businessName}>Blue Doors Darmawangsa</Text>

        {/* Platform tags */}
        <View style={styles.tagsRow}>
          {PLATFORMS.map((p) => (
            <View key={p} style={styles.tag}>
              <Text style={styles.tagText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Chart + Stats row */}
        <View style={styles.statsRow}>
          {/* Chart card */}
          <View style={[styles.card, styles.chartCard]}>
            <ViewsChart />
          </View>

          {/* Total views card */}
          <View style={[styles.card, styles.viewsCard]}>
            <View style={styles.viewsHeader}>
              <Text style={styles.viewsTitle}>Total views</Text>
              <Settings size={16} color="#64748b" />
            </View>
            <Text style={styles.viewsCount}>0</Text>
            <View style={styles.divider} />
            {PLATFORMS.map((p) => (
              <View key={p} style={styles.platformRow}>
                <Text style={styles.platformName}>{p}</Text>
                <Text style={styles.platformCount}>0</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content Created */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Created</Text>
          <View style={styles.creatorsGrid}>
            {CREATORS.map((creator, idx) => (
              <View key={idx} style={styles.creatorCard}>
                <View style={styles.creatorImage} />
                <Text style={styles.creatorName}>{creator.name}</Text>
                <Text style={styles.creatorViews}>Views: {creator.views}</Text>
                <Text style={styles.creatorPlatform}>{creator.platform}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* More button */}
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color="#64748b" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logo: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#2563eb',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    marginHorizontal: 12,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 8,
  },
  searchInput: {
    fontSize: 13,
    flex: 1,
    color: '#64748b',
  },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLines: {
    marginRight: 12,
    gap: 3,
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: '#64748b',
    borderRadius: 1,
    marginVertical: 1,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fb923c',
  },
  scrollContent: {
    padding: 20,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  chartCard: {
    flex: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  viewsCard: {
    flex: 1,
  },
  viewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewsTitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
  viewsCount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  platformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  platformName: {
    fontSize: 14,
    color: '#64748b',
  },
  platformCount: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  creatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 16,
  },
  creatorCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  creatorImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 6,
  },
  creatorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  creatorViews: {
    fontSize: 11,
    color: '#475569',
  },
  creatorPlatform: {
    fontSize: 11,
    color: '#94a3b8',
  },
  moreButton: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
});
