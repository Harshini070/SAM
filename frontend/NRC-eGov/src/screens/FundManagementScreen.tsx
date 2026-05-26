import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
<<<<<<< HEAD
import { LinearGradient } from 'expo-linear-gradient';
=======
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { ProgressBar } from '../components/ProgressBar';
import { analyticsService } from '../services/analyticsService';

interface FundCategory {
  label: string;
  allocated: number;
  utilized: number;
  icon: string;
  color: string;
  pct?: number;
}

interface FundData {
  total_funds?: number;
  spent_funds?: number;
  recovery_rate?: number;
  district_stats?: any[];
}

const CATEGORIES_CONFIG: Omit<FundCategory, 'allocated' | 'utilized' | 'pct'>[] = [
  { label: 'Therapeutic Foods', icon: 'restaurant-outline', color: Colors.primary },
  { label: 'Medical Supplies', icon: 'medical-outline', color: '#7C3AED' },
  { label: 'Staff Allowances', icon: 'people-outline', color: Colors.success },
  { label: 'Operational Costs', icon: 'construct-outline', color: '#D97706' },
  { label: 'Emergency Fund', icon: 'alert-circle-outline', color: Colors.error },
];

const TRANSACTIONS = [
  { id: '1', center: 'NRC Raipur #03', desc: 'Therapeutic Feed Procurement', amount: '₹ 4,50,000', date: '19 May 2025', status: 'Approved' },
  { id: '2', center: 'NRC Bastar #11', desc: 'Staff Salary Disbursements', amount: '₹ 2,80,000', date: '18 May 2025', status: 'Approved' },
  { id: '3', center: 'NRC Durg #07', desc: 'Medical Kit Procurement', amount: '₹ 1,50,000', date: '15 May 2025', status: 'Pending' },
  { id: '4', center: 'NRC Bilaspur #02', desc: 'Bed Repair & Maintenance', amount: '₹ 85,000', date: '12 May 2025', status: 'Approved' },
];

export const FundManagementScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [fundData, setFundData] = useState<FundData | null>(null);
  const [categories, setCategories] = useState<FundCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFundData = async () => {
    try {
      const data = await analyticsService.getDashboard();
      setFundData(data);
      
      // Create dummy category data from total funds
      const total = data.total_funds || 240;
      const spent = data.spent_funds || 162;
      const catData = CATEGORIES_CONFIG.map((cat, idx) => ({
        ...cat,
        allocated: Math.round((total / 5) * (1 + (idx * 0.1))),
        utilized: Math.round(((total / 5) * (1 + (idx * 0.1))) * (0.3 + (idx * 0.1))),
        pct: Math.round(((total / 5) * (1 + (idx * 0.1))) * (0.3 + (idx * 0.1)) / ((total / 5) * (1 + (idx * 0.1))) * 100),
      }));
      setCategories(catData);
    } catch (err) {
      console.error('Failed to fetch fund data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFundData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFundData();
  };

  const totalAllocated = fundData?.total_funds || 240;
  const totalUtilized = fundData?.spent_funds || 162;
  const utilizationPct = Math.round((totalUtilized / totalAllocated) * 100);

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar title="Fund Management" subtitle="State Allocation & Expenditures" />

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading fund data...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Core Summary Card */}
<<<<<<< HEAD
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overviewCard}
          >
=======
          <View style={styles.overviewCard}>
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
            <Text style={styles.overviewTitle}>Total Budget Status</Text>
            <View style={styles.amtRow}>
              <View>
                <Text style={styles.amtLabel}>Allocated</Text>
                <Text style={styles.amtValue}>₹{totalAllocated}L</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View>
                <Text style={styles.amtLabel}>Utilized</Text>
                <Text style={[styles.amtValue, { color: Colors.success }]}>₹{totalUtilized}L</Text>
              </View>
            </View>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Utilization</Text>
              <Text style={styles.progressValue}>{utilizationPct}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${utilizationPct}%`, backgroundColor: Colors.success }]} />
            </View>
<<<<<<< HEAD
          </LinearGradient>
=======
          </View>
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8

          {/* Categories breakdown */}
          <Text style={styles.sectionTitle}>Expenditure by Category</Text>
          <View style={styles.card}>
            {categories.length > 0 ? categories.map((cat, idx) => (
              <View key={cat.label} style={[styles.catRow, idx < categories.length - 1 && styles.rowBorder]}>
                <View style={styles.catHeader}>
                  <View style={[styles.catIconWrap, { backgroundColor: cat.color + '12' }]}>
                    <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                  </View>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                </View>
                <ProgressBar
                  label={`Spent: ₹${cat.utilized}L of ₹${cat.allocated}L`}
                  value={cat.pct || 0}
                  amount=""
                  color={cat.color}
                />
              </View>
            )) : (
              <Text style={styles.noData}>No category data available</Text>
            )}
          </View>

          {/* Transactions */}
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Recent Disbursements</Text>
            <TouchableOpacity><Text style={styles.seeAll}>History</Text></TouchableOpacity>
          </View>
          <View style={styles.card}>
            {TRANSACTIONS.map((t, idx) => (
              <View key={t.id} style={[styles.transRow, idx < TRANSACTIONS.length - 1 && styles.rowBorder]}>
                <View style={styles.transLeft}>
                  <Text style={styles.transCenter}>{t.center}</Text>
                  <Text style={styles.transDesc}>{t.desc}</Text>
                  <Text style={styles.transDate}>{t.date}</Text>
                </View>
                <View style={styles.transRight}>
                  <Text style={styles.transAmt}>{t.amount}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: t.status === 'Approved' ? Colors.success + '12' : '#D9770612' }]}>
                    <Text style={[styles.statusText, { color: t.status === 'Approved' ? Colors.success : '#D97706' }]}>{t.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  flex: { flex: 1, backgroundColor: Colors.background },
  centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 12, color: Colors.textMuted, marginTop: 12, fontWeight: '600' },
  noData: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 24 },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  overviewCard: { borderRadius: 16, padding: 18, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6, marginBottom: 12 },
  overviewTitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  amtRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 18 },
  amtLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  amtValue: { fontSize: 22, fontWeight: '800', color: Colors.white, marginTop: 2 },
  verticalDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  progressValue: { fontSize: 12, color: Colors.white, fontWeight: '700' },
  track: { height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, marginTop: 6 },
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  catRow: { marginBottom: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12 },
=======
  flex: { flex: 1, backgroundColor: '#EEF2F7' },
  centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 12, color: Colors.textMuted, marginTop: 12 },
  noData: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 24 },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  overviewCard: { backgroundColor: Colors.primary, borderRadius: 16, padding: 18, shadowColor: 'rgba(0,43,91,0.25)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 4, marginBottom: 12 },
  overviewTitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  amtRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 18 },
  amtLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  amtValue: { fontSize: 22, fontWeight: '800', color: Colors.white, marginTop: 2 },
  verticalDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  progressValue: { fontSize: 12, color: Colors.white, fontWeight: '700' },
  track: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, marginTop: 6 },
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, shadowColor: 'rgba(0,43,91,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  catRow: { marginBottom: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF2F7', paddingBottom: 12 },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  catIconWrap: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
<<<<<<< HEAD
  seeAll: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  transRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  transLeft: { flex: 1, gap: 3 },
  transCenter: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  transDesc: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  transDate: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  transRight: { alignItems: 'flex-end', gap: 6 },
  transAmt: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 9, fontWeight: '800' },
=======
  seeAll: { fontSize: 12, color: Colors.primaryLight, fontWeight: '600' },
  transRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  transLeft: { flex: 1, gap: 3 },
  transCenter: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  transDesc: { fontSize: 12, color: Colors.textSecondary },
  transDate: { fontSize: 10, color: Colors.textMuted },
  transRight: { alignItems: 'flex-end', gap: 6 },
  transAmt: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 9, fontWeight: '700' },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
});
