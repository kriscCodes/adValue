import React, { useState } from 'react';
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
import { MoreHorizontal } from 'lucide-react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { DashboardData, DashboardFilters, DEFAULT_FILTERS, useDashboard } from '@/hooks/useDashboard';

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
};

const SCROLL_PAD = 16;
const CARD_PAD = 14;

function ViewsChart({
  points: rawPoints,
  width,
  height,
}: {
  points: { date: string; views: number }[];
  width: number;
  height: number;
}) {
  const W = Math.max(width, 100);
  const H = height;
  const padL = 32;
  const padB = 20;
  const padT = 8;
  const padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;

  const points = rawPoints
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const maxVal = points.length > 0 ? Math.max(...points.map((p) => p.views), 1) : 1;
  const yLabels = [0, Math.round(maxVal * 0.5), maxVal];

  const linePoints = points.length === 1
    ? [points[0], points[0]]
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
        x={10}
        y={H / 2}
        fontSize="9"
        fill="#94a3b8"
        textAnchor="middle"
        transform={`rotate(-90, 10, ${H / 2})`}>
        Views
      </SvgText>
      {pointsStr ? (
        <Polyline points={pointsStr} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      ) : null}
      {points.length === 1 ? (
        <Circle
          cx={padL + chartW / 2}
          cy={padT + chartH - (points[0].views / maxVal) * chartH}
          r={4}
          fill="#3b82f6"
        />
      ) : null}
    </Svg>
  );
}

const PLATFORM_OPTIONS = [
  { label: 'All', value: null },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
];

const STATUS_OPTIONS = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'valid' },
  { label: 'Rejected', value: 'rejected' },
];

const DAYS_OPTIONS = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: 'All time', value: 0 },
];

function FilterRow<T extends string | number | null>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterPills}>
        {options.map((opt) => {
          const active = opt.value === selected;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => onSelect(opt.value)}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function Dashboard({
  data,
  filters,
  onFiltersChange,
}: {
  data: DashboardData;
  filters: DashboardFilters;
  onFiltersChange: (f: DashboardFilters) => void;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  // Chart fills its card minus padding; on desktop side-by-side, each card is ~half width
  const chartWidth = isMobile
    ? width - SCROLL_PAD * 2 - CARD_PAD * 2
    : (width - SCROLL_PAD * 2 - CARD_PAD * 2 - 16) / 2; // 16 = gap between cards
  const chartHeight = isMobile ? 180 : 240;

  const displayPlatforms = ['tiktok', 'instagram', 'youtube'];
  const totalAllViews = Object.values(data.total_views).reduce((a, b) => a + b, 0);

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}>
      <Text style={[styles.businessName, isMobile && styles.businessNameMobile]}>
        {data.business_name}
      </Text>

      {/* Filters */}
      <View style={styles.filtersBlock}>
        <FilterRow
          label="Platform"
          options={PLATFORM_OPTIONS}
          selected={filters.platform}
          onSelect={(v) => onFiltersChange({ ...filters, platform: v })}
        />
        <FilterRow
          label="Status"
          options={STATUS_OPTIONS}
          selected={filters.status}
          onSelect={(v) => onFiltersChange({ ...filters, status: v })}
        />
        <FilterRow
          label="Period"
          options={DAYS_OPTIONS}
          selected={filters.days}
          onSelect={(v) => onFiltersChange({ ...filters, days: v })}
        />
      </View>

      {/* Chart + stats */}
      <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
        <View style={[styles.card, styles.chartCard, isMobile && styles.chartCardMobile]}>
          <ViewsChart
            points={data.views_over_time}
            width={chartWidth}
            height={chartHeight}
          />
        </View>

        <View style={[styles.card, styles.viewsCard, isMobile && styles.viewsCardMobile]}>
          <Text style={styles.viewsTitle}>Total views</Text>
          <Text style={[styles.viewsCount, isMobile && styles.viewsCountMobile]}>
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

      {/* Creators */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Created</Text>
        {data.creators.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No content submissions yet.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.creatorsGrid}>
              {data.creators.slice(0, 8).map((creator) => (
                <View
                  key={creator.content_id}
                  style={[styles.creatorCard, isMobile && styles.creatorCardMobile]}>
                  <View style={styles.creatorImage} />
                  <Text style={styles.creatorName} numberOfLines={1}>
                    {creator.name}
                  </Text>
                  <Text style={styles.creatorViews}>
                    Views:{' '}
                    {creator.views >= 1000
                      ? `${(creator.views / 1000).toFixed(1)}k`
                      : creator.views}
                  </Text>
                  <Text style={styles.creatorPlatform}>
                    {PLATFORM_LABELS[creator.platform] ?? creator.platform}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {data.creators.length > 8 && (
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={20} color="#64748b" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

export default function BusinessDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const { data, loading, error } = useDashboard(filters);

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (error && !data) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading && data ? (
        <View style={styles.refetchBar} />
      ) : null}
      <Dashboard data={data!} filters={filters} onFiltersChange={setFilters} />
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
  refetchBar: {
    height: 3,
    backgroundColor: '#3b82f6',
    opacity: 0.5,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },

  // Scroll
  scrollContent: {
    padding: SCROLL_PAD,
    paddingBottom: 40,
  },
  scrollContentMobile: {
    padding: SCROLL_PAD,
  },

  // Header
  businessName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 14,
  },
  businessNameMobile: {
    fontSize: 18,
    marginBottom: 12,
  },

  // Filters
  filtersBlock: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 14,
    gap: 12,
    marginBottom: 16,
  },
  filterRow: {
    gap: 6,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  pillActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  pillText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  statsRowMobile: {
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: CARD_PAD,
  },
  chartCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCardMobile: {
    flex: 0,
  },
  viewsCard: {
    flex: 1,
  },
  viewsCardMobile: {
    flex: 0,
  },
  viewsTitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  viewsCount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  viewsCountMobile: {
    fontSize: 32,
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
    fontSize: 13,
    color: '#64748b',
  },
  platformCount: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },

  // Creators
  section: {
    gap: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  creatorsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 4,
  },
  creatorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
    padding: 12,
    width: 140,
  },
  creatorCardMobile: {
    width: 120,
    padding: 10,
  },
  creatorImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    marginBottom: 8,
  },
  creatorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  creatorViews: {
    fontSize: 12,
    color: '#475569',
  },
  creatorPlatform: {
    fontSize: 11,
    color: '#94a3b8',
  },

  // Empty / more
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
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
    padding: 12,
  },
});
