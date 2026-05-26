import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
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

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Reports'> };

const { width } = Dimensions.get('window');
const TABS = ['Overview', 'Nutrition', 'Recovery', 'Funds'];

const RECOVERY_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{ data: [58, 62, 65, 68, 70, 71.6] }],
};

const TOP_DISTRICTS = [
  { name: 'Raipur', pct: 84, children: 2341, color: Colors.primary },
  { name: 'Durg', pct: 79, children: 1823, color: Colors.success },
  { name: 'Bilaspur', pct: 73, children: 1567, color: '#7C3AED' },
  { name: 'Rajnandgaon', pct: 68, children: 1204, color: Colors.accent },
  { name: 'Bastar', pct: 61, children: 987, color: '#E05C1A' },
];

const NUTRITION_STATS = [
  { label: 'SAM (Severe)', value: '12,483', pct: 28, color: Colors.error },
  { label: 'MAM (Moderate)', value: '18,721', pct: 42, color: Colors.warning },
  { label: 'Normal', value: '13,296', pct: 30, color: Colors.success },
];

const FUND_ITEMS = [
  { label: 'Therapeutic Feeds', allocated: '₹ 85L', spent: '₹ 71L', pct: 84 },
  { label: 'Medical Supplies', allocated: '₹ 45L', spent: '₹ 38L', pct: 76 },
  { label: 'Staff Training', allocated: '₹ 22L', spent: '₹ 14L', pct: 64 },
  { label: 'Infrastructure', allocated: '₹ 38L', spent: '₹ 18L', pct: 47 },
];

export const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  const renderOverview = () => (
    <>
      <View style={styles.kpiRow}>
        {[
          { label: 'Total Registered', value: '44,500', trend: '+8%', up: true },
          { label: 'Recovered This Month', value: '1,243', trend: '+12%', up: true },
          { label: 'Dropout Rate', value: '4.2%', trend: '-1.1%', up: false },
          { label: 'Avg Stay (Days)', value: '18.3', trend: '-2d', up: false },
        ].map((k) => (
          <View key={k.label} style={styles.kpiCard}>
            <Text style={styles.kpiValue}>{k.value}</Text>
            <Text style={styles.kpiLabel}>{k.label}</Text>
            <View style={[styles.trendTag, { backgroundColor: k.up ? Colors.success + '18' : Colors.error + '18' }]}>
              <Text style={[styles.trendText, { color: k.up ? Colors.success : Colors.error }]}>
                {k.trend}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recovery Rate Trend</Text>
        <Text style={styles.cardSubtitle}>Jan – Jun 2025</Text>
        <LineChart
          data={RECOVERY_DATA}
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

  const renderNutrition = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Nutritional Status Distribution</Text>
      <Text style={styles.cardSubtitle}>Total Beneficiaries: 44,500</Text>
      {NUTRITION_STATS.map((n) => (
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

  const renderRecovery = () => (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Performing Districts</Text>
        <Text style={styles.cardSubtitle}>By recovery rate · FY 2025-26</Text>
        {TOP_DISTRICTS.map((d, i) => (
          <View key={d.name} style={styles.distRow}>
            <View style={[styles.rank, { backgroundColor: i === 0 ? Colors.accent : Colors.offWhite }]}>
              <Text style={[styles.rankText, { color: i === 0 ? Colors.white : Colors.textSecondary }]}>
                {i + 1}
              </Text>
            </View>
            <View style={styles.distInfo}>
              <Text style={styles.distName}>{d.name}</Text>
              <Text style={styles.distChildren}>{d.children.toLocaleString()} children</Text>
            </View>
            <View style={styles.distRight}>
              <Text style={[styles.distPct, { color: d.color }]}>{d.pct}%</Text>
              <View style={[styles.miniBar, { backgroundColor: Colors.background }]}>
                <View style={[styles.miniFill, { width: `${d.pct}%`, backgroundColor: d.color }]} />
              </View>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recovery Rate Trend</Text>
        <LineChart
          data={RECOVERY_DATA}
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

  const renderFunds = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Fund Utilization Breakdown</Text>
      <Text style={styles.cardSubtitle}>Total Budget: ₹ 2.4 Crore · FY 2025-26</Text>
      {FUND_ITEMS.map((f) => (
        <View key={f.label} style={styles.fundRow}>
          <View style={styles.fundTop}>
            <Text style={styles.fundLabel}>{f.label}</Text>
            <View style={styles.fundAmts}>
              <Text style={styles.fundSpent}>{f.spent}</Text>
              <Text style={styles.fundAlloc}> / {f.allocated}</Text>
            </View>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${f.pct}%`, backgroundColor: f.pct > 70 ? Colors.success : f.pct > 50 ? Colors.warning : Colors.error }]} />
          </View>
          <Text style={styles.fundPct}>{f.pct}% utilized</Text>
        </View>
      ))}
    </View>
  );

  const RENDERERS = [renderOverview, renderNutrition, renderRecovery, renderFunds];

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar title="Reports & Analytics" subtitle="Chhattisgarh NRC Program"
        showBack onBack={() => navigation.goBack()}
        rightIcon="share-outline" onRightPress={() => {}} />

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {RENDERERS[activeTab]()}

        <Text style={styles.footerNote}>
          Last updated: 20 May 2025 · Data Source: NIC Platform · Ministry of WCD
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
<<<<<<< HEAD
  tabBar: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: 2, fontWeight: '800' },
  cardSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md, fontWeight: '500' },
  chart: { borderRadius: Radius.md, marginLeft: -Spacing.sm },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  kpiCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, flex: 1, minWidth: '45%', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  kpiValue: { ...Typography.h3, color: Colors.primary, marginBottom: 2, fontWeight: '800' },
  kpiLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '600' },
=======
  tabBar: { flexDirection: 'row', backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { ...Typography.caption, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, elevation: 2 },
  cardTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: 2 },
  cardSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md },
  chart: { borderRadius: Radius.md, marginLeft: -Spacing.sm },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  kpiCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, flex: 1, minWidth: '45%', elevation: 2 },
  kpiValue: { ...Typography.h3, color: Colors.primary, marginBottom: 2 },
  kpiLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.xs },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  trendTag: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, alignSelf: 'flex-start' },
  trendText: { ...Typography.caption, fontWeight: '700' },
  nutRow: { marginBottom: Spacing.md },
  nutHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  nutDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.xs },
<<<<<<< HEAD
  nutLabel: { ...Typography.label, color: Colors.textPrimary, flex: 1, fontWeight: '700' },
  nutPct: { ...Typography.label, fontWeight: '800' },
  nutCount: { ...Typography.caption, color: Colors.textMuted, marginTop: 4, fontWeight: '600' },
  track: { height: 6, backgroundColor: '#E5E7EB', borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.full },
  distRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  rank: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  rankText: { ...Typography.label, fontWeight: '700' },
  distInfo: { flex: 1 },
  distName: { ...Typography.label, color: Colors.textPrimary, fontWeight: '700' },
  distChildren: { ...Typography.caption, color: Colors.textMuted, fontWeight: '500' },
  distRight: { alignItems: 'flex-end', width: 70 },
  distPct: { ...Typography.label, fontWeight: '800', marginBottom: 4 },
=======
  nutLabel: { ...Typography.label, color: Colors.textPrimary, flex: 1 },
  nutPct: { ...Typography.label, fontWeight: '700' },
  nutCount: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  track: { height: 8, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: Radius.full },
  distRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rank: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  rankText: { ...Typography.label, fontWeight: '700' },
  distInfo: { flex: 1 },
  distName: { ...Typography.label, color: Colors.textPrimary },
  distChildren: { ...Typography.caption, color: Colors.textMuted },
  distRight: { alignItems: 'flex-end', width: 70 },
  distPct: { ...Typography.label, fontWeight: '700', marginBottom: 4 },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  miniBar: { height: 4, width: 60, borderRadius: 2, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 2 },
  fundRow: { marginBottom: Spacing.md },
  fundTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
<<<<<<< HEAD
  fundLabel: { ...Typography.label, color: Colors.textPrimary, fontWeight: '700' },
  fundAmts: { flexDirection: 'row' },
  fundSpent: { ...Typography.label, color: Colors.primary, fontWeight: '800' },
  fundAlloc: { ...Typography.label, color: Colors.textMuted },
  fundPct: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4, fontWeight: '500' },
  footerNote: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm, fontWeight: '500' },
=======
  fundLabel: { ...Typography.label, color: Colors.textPrimary },
  fundAmts: { flexDirection: 'row' },
  fundSpent: { ...Typography.label, color: Colors.primary, fontWeight: '700' },
  fundAlloc: { ...Typography.label, color: Colors.textMuted },
  fundPct: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
  footerNote: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
});
