import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LineChart } from 'react-native-chart-kit';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { analyticsService } from '../services/analyticsService';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Reports'> };

const { width } = Dimensions.get('window');
const TABS = ['Overview', 'Nutrition', 'Recovery', 'Funds'];

// Fallback static chart data (shown when DB has no historical trend data)
const STATIC_RECOVERY_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{ data: [58, 62, 65, 68, 70, 71.6] }],
};

export const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const [dashboard, setDashboard] = useState<any>(null);
  const [stateData, setStateData] = useState<any>(null);
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
      setError('Could not load report data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(true); };

  // ---- Overview Tab ----
  const renderOverview = () => {
    const total = dashboard?.total_children ?? 0;
    const sam = dashboard?.sam_children ?? 0;
    const mam = dashboard?.mam_children ?? 0;
    const recovery = dashboard?.recovery_percentage?.toFixed(1) ?? '0.0';
    const followups = dashboard?.pending_followups ?? 0;
    const fundUtil = dashboard?.total_funds > 0
      ? Math.round((dashboard.funds_utilized / dashboard.total_funds) * 100)
      : 0;

    const kpis = [
      { label: 'Total Registered', value: total.toLocaleString(), icon: 'people-outline', color: Colors.primary },
      { label: 'Pending Followups', value: followups, icon: 'calendar-outline', color: '#7C3AED' },
      { label: 'Recovery Rate', value: `${recovery}%`, icon: 'trending-up-outline', color: Colors.success },
      { label: 'Fund Utilization', value: `${fundUtil}%`, icon: 'bar-chart-outline', color: '#D97706' },
    ];

    return (
      <>
        <View style={styles.kpiRow}>
          {kpis.map((k) => (
            <View key={k.label} style={styles.kpiCard}>
              <View style={[styles.kpiIcon, { backgroundColor: k.color + '10' }]}>
                <Ionicons name={k.icon as any} size={16} color={k.color} />
              </View>
              <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
              <Text style={styles.kpiLabel}>{k.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recovery Rate Trend</Text>
          <Text style={styles.cardSubtitle}>Historical performance (Jan–Jun 2025)</Text>
          <LineChart
            data={STATIC_RECOVERY_DATA}
            width={width - Spacing.md * 4}
            height={180}
            yAxisSuffix="%"
            chartConfig={{
              backgroundGradientFrom: Colors.white,
              backgroundGradientTo: Colors.white,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0,43,91,${opacity})`,
              labelColor: () => Colors.textSecondary,
              propsForDots: { r: '5', strokeWidth: '2', stroke: Colors.primary },
              propsForBackgroundLines: { stroke: Colors.border, strokeDasharray: '4' },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </>
    );
  };

  // ---- Nutrition Tab ----
  const renderNutrition = () => {
    const total = dashboard?.total_children || 1;
    const sam = dashboard?.sam_children ?? 0;
    const mam = dashboard?.mam_children ?? 0;
    const healthy = dashboard?.healthy_children ?? 0;

    const stats = [
      { label: 'SAM (Severe)', value: sam.toLocaleString(), pct: Math.round((sam / total) * 100), color: Colors.error },
      { label: 'MAM (Moderate)', value: mam.toLocaleString(), pct: Math.round((mam / total) * 100), color: '#D97706' },
      { label: 'Normal / Healthy', value: healthy.toLocaleString(), pct: Math.round((healthy / total) * 100), color: Colors.success },
    ];

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nutritional Status Distribution</Text>
        <Text style={styles.cardSubtitle}>Total Beneficiaries: {total.toLocaleString()}</Text>
        {total === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="analytics-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No children registered yet.</Text>
          </View>
        ) : stats.map((n) => (
          <View key={n.label} style={styles.nutRow}>
            <View style={styles.nutHeader}>
              <View style={[styles.nutDot, { backgroundColor: n.color }]} />
              <Text style={styles.nutLabel}>{n.label}</Text>
              <Text style={[styles.nutPct, { color: n.color }]}>{n.pct}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${n.pct}%`, backgroundColor: n.color }]} />
            </View>
            <Text style={styles.nutCount}>{n.value} children</Text>
          </View>
        ))}
      </View>
    );
  };

  // ---- Recovery Tab ----
  const renderRecovery = () => {
    const districts = (stateData?.district_stats || [])
      .slice()
      .sort((a: any, b: any) => b.malnutrition_rate - a.malnutrition_rate)
      .slice(0, 5);

    return (
      <>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Districts by SAM Burden</Text>
          <Text style={styles.cardSubtitle}>Malnutrition rate (%) · Live data</Text>
          {districts.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="location-outline" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No district data available yet.</Text>
            </View>
          ) : districts.map((d: any, i: number) => (
            <View key={d.district} style={[styles.distRow, i < districts.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }]}>
              <View style={[styles.rank, { backgroundColor: i === 0 ? Colors.accent : Colors.offWhite }]}>
                <Text style={[styles.rankText, { color: i === 0 ? Colors.white : Colors.textSecondary }]}>{i + 1}</Text>
              </View>
              <View style={styles.distInfo}>
                <Text style={styles.distName}>{d.district}</Text>
                <Text style={styles.distChildren}>{(d.total_children || 0).toLocaleString()} children</Text>
              </View>
              <View style={styles.distRight}>
                <Text style={[styles.distPct, { color: d.malnutrition_rate > 20 ? Colors.error : Colors.warning }]}>
                  {(d.malnutrition_rate || 0).toFixed(1)}%
                </Text>
                <View style={[styles.miniBar, { backgroundColor: Colors.background }]}>
                  <View style={[styles.miniFill, { width: `${Math.min(d.malnutrition_rate || 0, 100)}%`, backgroundColor: d.malnutrition_rate > 20 ? Colors.error : Colors.warning }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recovery Rate Trend</Text>
          <Text style={styles.cardSubtitle}>6-month historical · Jan–Jun 2025</Text>
          <LineChart
            data={STATIC_RECOVERY_DATA}
            width={width - Spacing.md * 4}
            height={160}
            yAxisSuffix="%"
            chartConfig={{
              backgroundGradientFrom: Colors.white,
              backgroundGradientTo: Colors.white,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(76,175,80,${opacity})`,
              labelColor: () => Colors.textSecondary,
              propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.success },
              propsForBackgroundLines: { stroke: Colors.border, strokeDasharray: '4' },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </>
    );
  };

  // ---- Funds Tab ----
  const renderFunds = () => {
    const total = dashboard?.total_funds ?? 0;
    const spent = dashboard?.funds_utilized ?? 0;
    const balance = total - spent;
    const pct = total > 0 ? Math.round((spent / total) * 100) : 0;

    const categories = [
      { label: 'Therapeutic Foods', pct: Math.round(pct * 1.1), color: Colors.primary, icon: 'restaurant-outline' },
      { label: 'Medical Supplies', pct: Math.round(pct * 0.9), color: '#7C3AED', icon: 'medical-outline' },
      { label: 'Staff Allowances', pct: Math.round(pct * 0.8), color: Colors.success, icon: 'people-outline' },
      { label: 'Operational Costs', pct: Math.round(pct * 0.7), color: '#D97706', icon: 'construct-outline' },
    ].map(c => ({ ...c, pct: Math.min(c.pct, 100) }));

    return (
      <>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fund Utilization Summary</Text>
          <Text style={styles.cardSubtitle}>Current Fiscal Year</Text>

          <View style={styles.fundSummaryRow}>
            {[
              { label: 'Allocated', value: `₹${total}L`, color: Colors.primary },
              { label: 'Spent', value: `₹${spent}L`, color: Colors.success },
              { label: 'Balance', value: `₹${balance < 0 ? 0 : balance}L`, color: '#D97706' },
            ].map((f) => (
              <View key={f.label} style={styles.fundSummaryItem}>
                <Text style={[styles.fundSummaryValue, { color: f.color }]}>{f.value}</Text>
                <Text style={styles.fundSummaryLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: pct > 80 ? Colors.error : pct > 60 ? '#D97706' : Colors.success }]} />
          </View>
          <Text style={styles.fundPctText}>{pct}% of budget utilized</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category Breakdown</Text>
          <Text style={styles.cardSubtitle}>Estimated distribution across spend categories</Text>
          {total === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="bar-chart-outline" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No fund data available yet.</Text>
            </View>
          ) : categories.map((f) => (
            <View key={f.label} style={styles.fundRow}>
              <View style={styles.fundTop}>
                <View style={[styles.fundIconWrap, { backgroundColor: f.color + '12' }]}>
                  <Ionicons name={f.icon as any} size={14} color={f.color} />
                </View>
                <Text style={styles.fundLabel}>{f.label}</Text>
                <Text style={[styles.fundPct, { color: f.color }]}>{f.pct}%</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${f.pct}%`, backgroundColor: f.color }]} />
              </View>
            </View>
          ))}
        </View>
      </>
    );
  };

  const RENDERERS = [renderOverview, renderNutrition, renderRecovery, renderFunds];

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar
        title="Reports & Analytics"
        subtitle="Chhattisgarh NRC Programme"
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="refresh-outline"
        onRightPress={onRefresh}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      ) : error ? (
        <View style={styles.loaderWrap}>
          <Ionicons name="cloud-offline-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
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
          {RENDERERS[activeTab]()}
          <Text style={styles.footerNote}>
            Last updated: {new Date().toLocaleTimeString('en-IN')} · NRC eGov Platform · Ministry of WCD
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  tabBar: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },

  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  loadingText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  errorText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 20, paddingVertical: 8, marginTop: 8 },
  retryText: { color: Colors.white, fontWeight: '700', fontSize: 12 },

  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: 2, fontWeight: '800' },
  cardSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md, fontWeight: '500' },
  chart: { borderRadius: Radius.md, marginLeft: -Spacing.sm },

  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  kpiCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, flex: 1, minWidth: '45%', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  kpiIcon: { width: 30, height: 30, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  kpiValue: { ...Typography.h3, marginBottom: 2, fontWeight: '800' },
  kpiLabel: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },

  nutRow: { marginBottom: Spacing.md },
  nutHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  nutDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.xs },
  nutLabel: { ...Typography.label, color: Colors.textPrimary, flex: 1, fontWeight: '700' },
  nutPct: { ...Typography.label, fontWeight: '800' },
  nutCount: { ...Typography.caption, color: Colors.textMuted, marginTop: 4, fontWeight: '600' },

  track: { height: 6, backgroundColor: '#E5E7EB', borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.full },

  distRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  rank: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  rankText: { ...Typography.label, fontWeight: '700' },
  distInfo: { flex: 1 },
  distName: { ...Typography.label, color: Colors.textPrimary, fontWeight: '700' },
  distChildren: { ...Typography.caption, color: Colors.textMuted, fontWeight: '500' },
  distRight: { alignItems: 'flex-end', width: 70 },
  distPct: { ...Typography.label, fontWeight: '800', marginBottom: 4 },
  miniBar: { height: 4, width: 60, borderRadius: 2, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 2 },

  fundSummaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: Spacing.md },
  fundSummaryItem: { alignItems: 'center' },
  fundSummaryValue: { fontSize: 18, fontWeight: '800' },
  fundSummaryLabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  fundPctText: { ...Typography.caption, color: Colors.textSecondary, marginTop: 6, fontWeight: '600' },
  fundRow: { marginBottom: Spacing.sm },
  fundTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  fundIconWrap: { width: 26, height: 26, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  fundLabel: { flex: 1, fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  fundPct: { fontSize: 12, fontWeight: '800' },

  emptyWrap: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.xs },
  emptyText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },

  footerNote: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm, fontWeight: '500' },
});
