import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoreHorizontal, Settings } from 'lucide-react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { DashboardData, useDashboard } from '@/hooks/useDashboard';

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

function ViewsChart({
  points: rawPoints,
  width,
}: {
  points: { date: string; views: number }[];
  width: number;
}) {
  const W = width;
  const H = 260;
  const padL = 36;
  const padB = 24;
  const padT = 8;
  const padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;

  const points = rawPoints
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const maxVal = points.length > 0 ? Math.max(...points.map((p) => p.views), 1) : 1;
  const yLabels = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  const linePoints =
    points.length === 1
      ? [
          { date: points[0].date, views: points[0].views },
          { date: points[0].date, views: points[0].views },
        ]
      : points;

  const pointsStr =
    linePoints.length > 1
      ? linePoints
          .map((p, i) => {
            const x = padL + (i / (linePoints.length - 1)) * chartW;
            const y = padT + chartH - (p.views / maxVal) * chartH;
            return `${x},${y}`;
          })
          .join(' ')
      : '';

  return (
    <Svg width={W} height={H}>
      {yLabels.map((label) => {
        const y = padT + chartH - (label / maxVal) * chartH;
        return (
          <React.Fragment key={label}>
            <Line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <SvgText x={padL - 4} y={y + 4} fontSize="8" fill="#94a3b8" textAnchor="end">
              {label >= 1000 ? `${Math.round(label / 1000)}k` : label}
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
        transform={`rotate(-90, 8, ${H / 2})`}
      >
        Views
      </SvgText>
      {pointsStr ? <Polyline points={pointsStr} fill="none" stroke="#3b82f6" strokeWidth="3" /> : null}
      {points.length === 1 ? (
        <Circle
          cx={padL + chartW / 2}
          cy={padT + chartH - (points[0].views / maxVal) * chartH}
          r={5}
          fill="#3b82f6"
        />
      ) : null}
    </Svg>
  );
}

function Dashboard({ data }: { data: DashboardData }) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 1024;
  const chartWidth = isNarrow ? Math.max(300, width - 96) : 460;
  const displayPlatforms = ['tiktok', 'instagram', 'youtube'];
  const totalAllViews = Object.values(data.total_views).reduce((a, b) => a + b, 0);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.businessName}>{data.business_name}</Text>

      {data.platforms.length > 0 && (
        <View style={styles.tagsRow}>
          {data.platforms.map((p) => (
            <View key={p} style={styles.tag}>
              <Text style={styles.tagText}>{PLATFORM_LABELS[p] ?? p}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.statsRow, isNarrow && styles.statsColumn]}>
        <View style={[styles.card, styles.chartCard]}>
          <ViewsChart points={data.views_over_time} width={chartWidth} />
        </View>
        <View style={[styles.card, styles.viewsCard]}>
          <View style={styles.viewsHeader}>
            <Text style={styles.viewsTitle}>Total views</Text>
            <Settings size={16} color="#64748b" />
          </View>
          <Text style={styles.viewsCount}>
            {totalAllViews >= 1000 ? `${(totalAllViews / 1000).toFixed(1)}k` : totalAllViews}
          </Text>
          <View style={styles.divider} />
          {displayPlatforms.map((p) => (
            <View key={p} style={styles.platformRow}>
              <Text style={styles.platformName}>{PLATFORM_LABELS[p] ?? p}</Text>
              <Text style={styles.platformCount}>{data.total_views[p] ?? 0}</Text>
            </View>
          ))}
        </View>
      </View>

      {data.creators.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Created</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.creatorsGrid}>
              {data.creators.slice(0, 8).map((creator) => (
                <View key={creator.content_id} style={styles.creatorCard}>
                  <View style={styles.creatorImage} />
                  <Text style={styles.creatorName} numberOfLines={1}>
                    {creator.name}
                  </Text>
                  <Text style={styles.creatorViews}>
                    Views: {creator.views >= 1000 ? `${(creator.views / 1000).toFixed(1)}k` : creator.views}
                  </Text>
                  <Text style={styles.creatorPlatform}>
                    {PLATFORM_LABELS[creator.platform] ?? creator.platform}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {data.creators.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No content submissions yet.</Text>
        </View>
      )}

      {data.creators.length > 8 && (
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color="#64748b" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

export default function BusinessDashboard() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error ?? 'Something went wrong.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Dashboard data={data} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fbff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
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
    gap: 16,
    marginBottom: 24,
  },
  statsColumn: {
    flexDirection: 'column',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 18,
  },
  chartCard: {
    flex: 1,
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
    fontSize: 48,
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
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  creatorsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  creatorCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 18,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  creatorImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  creatorViews: {
    fontSize: 13,
    color: '#475569',
  },
  creatorPlatform: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  moreButton: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
});
