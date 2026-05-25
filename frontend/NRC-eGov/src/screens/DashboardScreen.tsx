import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { StatCard } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useAuth } from '../hooks/useAuth';
import { analyticsService } from '../services/analyticsService';

const QUICK_ACTIONS = [
  { label: 'Add Child', icon: 'person-add-outline', color: Colors.primary, screen: 'ChildRegistration' },
  { label: 'Register NRC', icon: 'business-outline', color: '#7C3AED', screen: 'NRCCenters' },
  { label: 'Fund Report', icon: 'bar-chart-outline', color: '#D97706', screen: 'Funds' },
  { label: 'Analytics', icon: 'analytics-outline', color: Colors.success, screen: 'Reports' },
  { label: 'Beneficiaries', icon: 'people-circle-outline', color: '#0891B2', screen: 'Children' },
  { label: 'Discharge', icon: 'exit-outline', color: '#E05C1A', screen: 'Children' },
  { label: 'MUAC Scan', icon: 'scan-outline', color: '#DB2777', screen: 'ChildRegistration' },
  { label: 'Alerts', icon: 'warning-outline', color: Colors.error, screen: 'Notifications' },
];

const ALERTS = [
  { msg: '3 children in Bastar require urgent admission review', time: '2h ago', type: 'error' },
  { msg: 'Monthly report due for Raipur NRC Center #07', time: '5h ago', type: 'warning' },
  { msg: '₹12L fund disbursement to Bastar completed', time: '1d ago', type: 'success' },
  { msg: 'New SAM case registered: Kondagaon District', time: '2d ago', type: 'info' },
];

interface DashboardData {
  total_children?: number;
  sam_children?: number;
  mam_children?: number;
  healthy_children?: number;
  pending_followups?: number;
  nrc_occupancy_pct?: number;
  recovered_children?: number;
  active_nrc_centers?: number;
  recovery_rate?: number;
  total_funds?: number;
  spent_funds?: number;
  district_stats?: { name: string; amount: number; percentage: number }[];
}

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userPhone } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await analyticsService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const stats = [
    { label: 'Total Children', value: dashboardData?.total_children || '0', icon: 'people-outline', color: Colors.primary },
    { label: 'SAM Count', value: dashboardData?.sam_children || '0', icon: 'alert-circle-outline', color: Colors.error },
    { label: 'MAM Count', value: dashboardData?.mam_children || '0', icon: 'warning-outline', color: '#D97706' },
    { label: 'Healthy Count', value: dashboardData?.healthy_children || '0', icon: 'checkmark-circle-outline', color: Colors.success },
    { label: 'Pending Followups', value: dashboardData?.pending_followups || '0', icon: 'calendar-outline', color: '#7C3AED' },
    { label: 'NRC Occupancy', value: `${dashboardData?.nrc_occupancy_pct || 0}%`, icon: 'bed-outline', color: '#0891B2' },
  ];

  const districts = (dashboardData?.district_stats || []).map((d, i) => ({
    name: d.name,
    amount: `₹${d.amount}`,
    pct: d.percentage,
    color: [Colors.primary, Colors.success, '#7C3AED', '#D97706'][i % 4],
  }));

  const alertColor = (t: string) =>
    t === 'error' ? Colors.error : t === 'warning' ? '#D97706' : t === 'success' ? Colors.success : Colors.primaryLight;

  return (
    <View style={styles.flex}>
      {/* Header */}
      <LinearGradient colors={[Colors.primary, '#1E4D8C']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>Welcome</Text>
            <View style={styles.roleTag}><Text style={styles.roleTagText}>🔐 Chhattisgarh Portal</Text></View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications' as any)}>
              <Ionicons name="notifications-outline" size={20} color={Colors.white} />
              <View style={styles.badge}><Text style={styles.badgeText}>4</Text></View>
            </TouchableOpacity>
            <View style={styles.avatar}><Text style={styles.avatarText}>📊</Text></View>
          </View>
        </View>
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search-outline" size={15} color={Colors.textMuted} />
          <Text style={styles.searchText}>Search children, NRC centers, districts…</Text>
          <Ionicons name="options-outline" size={15} color={Colors.textMuted} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}>

        {/* Stats */}
        <Text style={styles.section}>Overview · FY 2025-26</Text>
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} color={s.color}
              icon={<Ionicons name={s.icon as any} size={20} color={s.color} />}
              style={styles.statCard} />
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.section}>Quick Actions</Text>
        <View style={styles.card}>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity key={a.label} style={styles.actionItem}
                onPress={() => {
                  if (a.screen) {
                    if (['NRCCenters', 'Funds', 'Children'].includes(a.screen)) {
                      navigation.navigate('MainTabs', { screen: a.screen } as any);
                    } else {
                      navigation.navigate(a.screen as any);
                    }
                  }
                }}>
                <View style={[styles.actionIcon, { backgroundColor: a.color + '15' }]}>
                  <Ionicons name={a.icon as any} size={22} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Alerts */}
        <View style={styles.rowBetween}>
          <Text style={styles.section}>Recent Alerts</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          {ALERTS.map((a, i) => (
            <TouchableOpacity key={i} style={[styles.alertRow, i < ALERTS.length - 1 && styles.alertBorder]}>
              <View style={[styles.alertDot, { backgroundColor: alertColor(a.type) }]} />
              <View style={styles.alertBody}>
                <Text style={styles.alertText}>{a.msg}</Text>
                <Text style={styles.alertTime}>{a.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Fund Utilization */}
        <View style={styles.rowBetween}>
          <Text style={styles.section}>Fund Utilization</Text>
          <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.fundMeta}>
            <Text style={styles.fundTotal}>Total: ₹{dashboardData?.total_funds || 0}L</Text>
            <View style={styles.fyBadge}><Text style={styles.fyText}>FY 2025-26</Text></View>
          </View>
          {districts.length > 0 ? districts.map((d) => (
            <ProgressBar key={d.name} label={d.name} amount={d.amount} value={d.pct} color={d.color} />
          )) : (
            <Text style={styles.loadingText}>Loading fund data...</Text>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footerNote}>Data synced · {new Date().toLocaleDateString()} · NIC Platform</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#EEF2F7' },
  header: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.3 },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 1 },
  roleTag: { marginTop: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  roleTagText: { fontSize: 10, color: 'rgba(255,255,255,0.9)' },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  headerIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -3, right: -3, backgroundColor: Colors.error, borderRadius: 6, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 8, color: '#fff', fontWeight: '700' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#D97706', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, gap: 8, elevation: 3 },
  searchText: { flex: 1, fontSize: 13, color: Colors.textMuted },
  scroll: { flex: 1 },
  content: { padding: Spacing.md },
  section: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10, marginTop: 4, letterSpacing: 0.1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: 16 },
  statCard: { width: '47%', margin: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 16, shadowColor: 'rgba(0,43,91,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  actionItem: { width: '25%', alignItems: 'center', paddingVertical: 10 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', fontWeight: '500' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { fontSize: 12, color: Colors.primaryLight, fontWeight: '600', marginBottom: 10 },
  alertRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  alertBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  alertDot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
  alertBody: { flex: 1 },
  alertText: { fontSize: 12, color: Colors.textPrimary, lineHeight: 18 },
  alertTime: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  fundMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  fundTotal: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  fyBadge: { backgroundColor: Colors.primary + '12', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  fyText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  footerNote: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 4 },
  loadingText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', paddingVertical: 10 },
});
