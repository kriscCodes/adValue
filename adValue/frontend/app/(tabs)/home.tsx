import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, MoreHorizontal } from 'lucide-react-native';
import Svg, { Polyline, Line, Text as SvgText } from 'react-native-svg';

const PLATFORMS = ['Instagram', 'Youtube', 'Tiktok'];

const CREATORS = [
  { name: 'Faikar', views: '10k', platform: 'Tiktok' },
  { name: 'Kris', views: '1k', platform: 'Instagram' },
  { name: 'Jasmine', views: '100k', platform: 'Tiktok' },
  { name: 'Jasmine', views: '100k', platform: 'Tiktok' },
];

function ViewsChart() {
  const W = 280;
  const H = 180;
  const padL = 36;
  const padB = 24;
  const padT = 8;
  const padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;

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
      {yLabels.map((label) => {
        const y = padT + chartH - (label / maxVal) * chartH;
        return (
          <React.Fragment key={label}>
            <Line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <SvgText x={padL - 4} y={y + 4} fontSize="8" fill="#94a3b8" textAnchor="end">
              {label}
            </SvgText>
          </React.Fragment>
        );
      })}
      <SvgText x={W / 2} y={H - 4} fontSize="9" fill="#94a3b8" textAnchor="middle">
        Days
      </SvgText>
      <SvgText
        x={8}
        y={H / 2}
        fontSize="9"
        fill="#94a3b8"
        textAnchor="middle"
        transform={`rotate(-90, 8, ${H / 2})`}>
        Views
      </SvgText>
      <Polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />
    </Svg>
  );
}

export default function BusinessDashboard() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.businessName}>Blue Doors Darmawangsa</Text>

        <View style={styles.tagsRow}>
          {PLATFORMS.map((p) => (
            <View key={p} style={styles.tag}>
              <Text style={styles.tagText}>{p}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.card, styles.chartCard]}>
            <ViewsChart />
          </View>
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
