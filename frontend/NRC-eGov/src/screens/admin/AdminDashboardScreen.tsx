import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import { AuthContext } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { Colors } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - Spacing.md * 4;

interface DashboardData {
  total_children: number;
  sam_children: number;
  mam_children: number;
  healthy_children: number;
  pending_followups: number;
  nrc_occupancy: number;
  nrc_total_beds: number;
  recovery_percentage: number;
  total_funds: number;
  funds_utilized: number;
  high_risk_children: number;
}

interface StateData {
  total_districts: number;
  district_stats: { district: string; total_children: number; sam_cases: number; malnutrition_rate: number }[];
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
  bgColor: string;
  trend?: string;
  trendUp?: boolean;
}> = ({ label, value, icon, iconColor, bgColor, trend, trendUp }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend != null && (
      <View style={[styles.trendBadge, { backgroundColor: trendUp ? Colors.success + '18' : Colors.error + '18' }]}>
        <Ionicons name={trendUp ? 'trending-up' : 'trending-down'} size={10} color={trendUp ? Colors.success : Colors.error} />
        <Text style={[styles.trendText, { color: trendUp ? Colors.success : Colors.error }]}>{trend}</Text>
      </View>
    )}
  </View>
);

export const AdminDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const auth = useContext(AuthContext);
  const { t } = useLanguage();
  const user = auth?.user;

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [stateData, setStateData] = useState<StateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const [dash, state] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getStateAnalytics(),
      ]);
      setDashboard(dash);
      setStateData(state);
    } catch (err: any) {
      setError('Failed to load dashboard data. Please retry.');
      Alert.alert('Error', 'Could not load admin dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  // Build chart data from district stats
  const topDistricts = (stateData?.district_stats || []).slice(0, 5);
  const chartData = topDistricts.length > 0
    ? {
        labels: topDistricts.map((d) => d.district.substring(0, 5)),
        datasets: [{ data: topDistricts.map((d) => Math.round(d.malnutrition_rate || 0)) }],
      }
    : {
        labels: ['–'],
        datasets: [{ data: [0] }],
      };

  const nrcOccupancyPct =
    dashboard && dashboard.nrc_total_beds > 0
      ? Math.round((dashboard.nrc_occupancy / dashboard.nrc_total_beds) * 100)
      : 0;

  const fundUtilPct =
    dashboard && dashboard.total_funds > 0
      ? Math.round((dashboard.funds_utilized / dashboard.total_funds) * 100)
      : 0;

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <LinearGradient colors={['#0A1931', '#152F5B']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreet}>State Administration</Text>
            <Text style={styles.headerName}>{user?.name || 'Admin'}</Text>
          </View>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#D1FAE5" />
            <Text style={styles.adminBadgeText}>STATE ADMIN</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>Chhattisgarh NRC Programme — Statewide Overview</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading statewide data...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerLoader}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.errorTitle}>Could not load data</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {/* KPI Row 1 — Children */}
          <Text style={styles.sectionLabel}>NUTRITION STATUS</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Total Registered"
              value={dashboard?.total_children?.toLocaleString() ?? '0'}
              icon="people-outline"
              iconColor={Colors.primary}
              bgColor={Colors.primary + '10'}
            />
            <StatCard
              label="SAM Cases"
              value={dashboard?.sam_children ?? 0}
              icon="alert-circle-outline"
              iconColor={Colors.error}
              bgColor={Colors.error + '10'}
            />
            <StatCard
              label="MAM Cases"
              value={dashboard?.mam_children ?? 0}
              icon="warning-outline"
              iconColor="#D97706"
              bgColor={"#D97706" + '10'}
            />
            <StatCard
              label="Healthy"
              value={dashboard?.healthy_children ?? 0}
              icon="checkmark-circle-outline"
              iconColor={Colors.success}
              bgColor={Colors.success + '10'}
            />
          </View>

          {/* KPI Row 2 — Operations */}
          <Text style={styles.sectionLabel}>OPERATIONAL KPIs</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Pending Followups"
              value={dashboard?.pending_followups ?? 0}
              icon="calendar-outline"
              iconColor="#7C3AED"
              bgColor="#7C3AED10"
            />
            <StatCard
              label="Recovery Rate"
              value={`${dashboard?.recovery_percentage?.toFixed(1) ?? 0}%`}
              icon="trending-up-outline"
              iconColor={Colors.success}
              bgColor={Colors.success + '10'}
            />
            <StatCard
              label="NRC Occupancy"
              value={`${nrcOccupancyPct}%`}
              icon="bed-outline"
              iconColor={Colors.primaryLight}
              bgColor={Colors.primary + '10'}
            />
            <StatCard
              label="Fund Utilized"
              value={`${fundUtilPct}%`}
              icon="bar-chart-outline"
              iconColor="#D97706"
              bgColor="#D9770610"
            />
          </View>

          {/* Fund Summary Card */}
          {dashboard && dashboard.total_funds > 0 && (
            <>
              <Text style={styles.sectionLabel}>FUND OVERVIEW</Text>
              <LinearGradient
                colors={['#0A1931', '#1D3461']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fundCard}
              >
                <Text style={styles.fundTitle}>State Budget Utilization</Text>
                <View style={styles.fundRow}>
                  <View>
                    <Text style={styles.fundLabel}>Allocated</Text>
                    <Text style={styles.fundValue}>₹{dashboard.total_funds}L</Text>
                  </View>
                  <View style={styles.fundDivider} />
                  <View>
                    <Text style={styles.fundLabel}>Utilized</Text>
                    <Text style={[styles.fundValue, { color: '#6EE7B7' }]}>₹{dashboard.funds_utilized}L</Text>
                  </View>
                  <View style={styles.fundDivider} />
                  <View>
                    <Text style={styles.fundLabel}>Balance</Text>
                    <Text style={[styles.fundValue, { color: '#FCD34D' }]}>
                      ₹{(dashboard.total_funds - dashboard.funds_utilized).toFixed(0)}L
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${Math.min(fundUtilPct, 100)}%` }]} />
                </View>
                <Text style={styles.progressLabel}>{fundUtilPct}% utilized this fiscal year</Text>
              </LinearGradient>
            </>
          )}

          {/* District SAM Rate Chart */}
          {topDistricts.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>SAM RATE BY DISTRICT</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>District Malnutrition Comparison</Text>
                <Text style={styles.cardSub}>SAM rate (%) — top 5 districts</Text>
                <BarChart
                  data={chartData}
                  width={CHART_WIDTH}
                  height={180}
                  yAxisSuffix="%"
                  yAxisLabel=""
                  chartConfig={{
                    backgroundGradientFrom: Colors.white,
                    backgroundGradientTo: Colors.white,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 43, 91, ${opacity})`,
                    labelColor: () => Colors.textSecondary,
                    propsForBackgroundLines: { stroke: '#F3F4F6', strokeDasharray: '4' },
                    barPercentage: 0.65,
                  }}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                />
              </View>
            </>
          )}

          {/* District Rankings Table */}
          {topDistricts.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>DISTRICT RANKINGS</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Districts by SAM Burden</Text>
                {topDistricts.map((d, i) => (
                  <View key={d.district} style={[styles.distRow, i < topDistricts.length - 1 && styles.distBorder]}>
                    <View style={[styles.rankBadge, i === 0 && styles.rankBadgeTop]}>
                      <Text style={[styles.rankText, i === 0 && styles.rankTextTop]}>{i + 1}</Text>
                    </View>
                    <View style={styles.distInfo}>
                      <Text style={styles.distName}>{d.district}</Text>
                      <Text style={styles.distSub}>{d.total_children} children · {d.sam_cases} SAM</Text>
                    </View>
                    <View style={styles.distRight}>
                      <Text style={[styles.distRate, { color: d.malnutrition_rate > 20 ? Colors.error : Colors.warning }]}>
                        {d.malnutrition_rate.toFixed(1)}%
                      </Text>
                      <Text style={styles.distRateLabel}>SAM rate</Text>
                    </View>
                  </View>
                ))}
                {topDistricts.length === 0 && (
                  <Text style={styles.emptyText}>No district data available yet.</Text>
                )}
              </View>
            </>
          )}

          {/* Empty state if no data at all */}
          {!dashboard?.total_children && !topDistricts.length && (
            <View style={styles.emptyWrap}>
              <Ionicons name="analytics-outline" size={52} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Data Yet</Text>
              <Text style={styles.emptySub}>Register children and NRC centers to see analytics here.</Text>
            </View>
          )}

          <Text style={styles.footerNote}>
            Last refreshed: {new Date().toLocaleTimeString('en-IN')} · NRC eGov Platform
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  headerGreet: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600', letterSpacing: 0.5 },
  headerName: { fontSize: 20, fontWeight: '800', color: Colors.white, marginTop: 2 },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500', marginTop: 4 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  adminBadgeText: { fontSize: 9, color: '#D1FAE5', fontWeight: '800', letterSpacing: 0.5 },

  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadingText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  errorTitle: { fontSize: 15, color: Colors.textPrimary, fontWeight: '700', marginTop: 8 },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 24, paddingVertical: 10, marginTop: 12 },
  retryText: { color: Colors.white, fontWeight: '700', fontSize: 13 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingLeft: 2,
  },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: 4 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  statIcon: { width: 34, height: 34, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full, marginTop: 4 },
  trendText: { fontSize: 9, fontWeight: '700' },

  fundCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  fundTitle: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  fundRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  fundLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600', marginBottom: 2 },
  fundValue: { fontSize: 20, fontWeight: '800', color: Colors.white },
  fundDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#6EE7B7', borderRadius: 3 },
  progressLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
    marginBottom: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, marginBottom: 2 },
  cardSub: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginBottom: Spacing.sm },
  chart: { borderRadius: Radius.md, marginLeft: -10 },

  distRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  distBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rankBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  rankBadgeTop: { backgroundColor: Colors.accent },
  rankText: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary },
  rankTextTop: { color: Colors.white },
  distInfo: { flex: 1 },
  distName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  distSub: { fontSize: 11, color: Colors.textMuted, fontWeight: '500', marginTop: 1 },
  distRight: { alignItems: 'flex-end' },
  distRate: { fontSize: 15, fontWeight: '800' },
  distRateLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', marginTop: 1 },

  emptyWrap: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { ...Typography.h4, color: Colors.textPrimary, fontWeight: '700' },
  emptySub: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center' },
  emptyText: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.md },

  footerNote: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.lg, fontWeight: '500' },
});
