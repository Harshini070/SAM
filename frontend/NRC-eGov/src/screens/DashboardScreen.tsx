import React, { useState, useEffect } from 'react';
import {
<<<<<<< HEAD
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
=======
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/types';
import { StatCard } from '../components/Card';
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
import { ProgressBar } from '../components/ProgressBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useAuth } from '../hooks/useAuth';
import { analyticsService } from '../services/analyticsService';

const QUICK_ACTIONS = [
  { label: 'Add Child', icon: 'person-add-outline', color: Colors.primary, screen: 'ChildRegistration' },
<<<<<<< HEAD
  { label: 'NRC Centers', icon: 'business-outline', color: '#7C3AED', screen: 'NRCCenters' },
  { label: 'Funds', icon: 'bar-chart-outline', color: '#D97706', screen: 'Funds' },
  { label: 'Reports', icon: 'analytics-outline', color: Colors.success, screen: 'Reports' },
=======
  { label: 'Register NRC', icon: 'business-outline', color: '#7C3AED', screen: null },
  { label: 'Fund Report', icon: 'bar-chart-outline', color: '#D97706', screen: null },
  { label: 'Analytics', icon: 'analytics-outline', color: Colors.success, screen: 'Reports' },
  { label: 'Beneficiaries', icon: 'people-circle-outline', color: '#0891B2', screen: null },
  { label: 'Discharge', icon: 'exit-outline', color: '#E05C1A', screen: null },
  { label: 'MUAC Scan', icon: 'scan-outline', color: '#DB2777', screen: null },
  { label: 'Alerts', icon: 'warning-outline', color: Colors.error, screen: null },
];

const ALERTS = [
  { msg: '3 children in Bastar require urgent admission review', time: '2h ago', type: 'error' },
  { msg: 'Monthly report due for Raipur NRC Center #07', time: '5h ago', type: 'warning' },
  { msg: '₹12L fund disbursement to Bastar completed', time: '1d ago', type: 'success' },
  { msg: 'New SAM case registered: Kondagaon District', time: '2d ago', type: 'info' },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
];

interface DashboardData {
  total_children?: number;
  sam_children?: number;
<<<<<<< HEAD
  mam_children?: number;
  healthy_children?: number;
  nrc_occupancy_pct?: number;
  total_funds?: number;
=======
  recovered_children?: number;
  active_nrc_centers?: number;
  recovery_rate?: number;
  total_funds?: number;
  spent_funds?: number;
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  district_stats?: { name: string; amount: number; percentage: number }[];
}

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userPhone } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
<<<<<<< HEAD
=======
  const [loading, setLoading] = useState(true);
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await analyticsService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
<<<<<<< HEAD
=======
      setLoading(false);
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
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
<<<<<<< HEAD
    { label: 'Total Children', value: dashboardData?.total_children || '0', color: Colors.primary },
    { label: 'SAM Cases', value: dashboardData?.sam_children || '0', color: Colors.error },
    { label: 'MAM Cases', value: dashboardData?.mam_children || '0', color: '#D97706' },
    { label: 'Recovery Rate', value: `${dashboardData?.nrc_occupancy_pct || 0}%`, color: Colors.success },
=======
    { label: 'Total SAM Children', value: dashboardData?.sam_children || '0', icon: 'people', color: Colors.primary },
    { label: 'Recovered', value: dashboardData?.recovered_children || '0', icon: 'heart', color: Colors.success },
    { label: 'Active NRCs', value: dashboardData?.active_nrc_centers || '0', icon: 'business', color: '#7C3AED' },
    { label: 'Recovery Rate', value: `${dashboardData?.recovery_rate || 0}%`, icon: 'trending-up', color: '#D97706' },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  ];

  const districts = (dashboardData?.district_stats || []).map((d, i) => ({
    name: d.name,
    amount: `₹${d.amount}`,
    pct: d.percentage,
    color: [Colors.primary, Colors.success, '#7C3AED', '#D97706'][i % 4],
  }));

<<<<<<< HEAD
  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>NRC Administrator</Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>Nutrition Monitoring · Raipur</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Notifications' as any)}>
            <Ionicons name="notifications-outline" size={20} color={Colors.white} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>4</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.promoCard}>
          <Text style={styles.promoHeadline}>Centralized NRC monitoring made simple</Text>
          <Text style={styles.promoCopy}>Track admissions, child progress, and funding in one secure dashboard.</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statPanel}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Quick Actions</Text>
        <View style={styles.card}>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionItem}
                onPress={() => {
                  if (['NRCCenters', 'Funds', 'Children'].includes(action.screen)) {
                    navigation.navigate('MainTabs', { screen: action.screen } as any);
                  } else {
                    navigation.navigate(action.screen as any);
                  }
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '12' }]}> 
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
=======
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
                onPress={() => { if (a.screen) navigation.navigate(a.screen as any); }}>
                <View style={[styles.actionIcon, { backgroundColor: a.color + '15' }]}>
                  <Ionicons name={a.icon as any} size={22} color={a.color} />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
              </TouchableOpacity>
            ))}
          </View>
        </View>

<<<<<<< HEAD
        <Text style={styles.section}>Fund Utilization</Text>
        <View style={styles.card}>
          <View style={styles.fundMeta}>
            <Text style={styles.fundTotal}>₹{dashboardData?.total_funds || 0}L allocated</Text>
            <Text style={styles.fyText}>FY 2025-26</Text>
          </View>
          {districts.length ? (
            districts.map((district) => (
              <ProgressBar
                key={district.name}
                label={district.name}
                amount={district.amount}
                value={district.pct}
                color={district.color}
              />
            ))
          ) : (
            <Text style={styles.loadingText}>Loading fund summary…</Text>
          )}
        </View>
=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  flex: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.white, marginTop: 4 },
  roleTag: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'flex-start' },
  roleTagText: { color: 'rgba(255,255,255,0.95)', fontSize: 11, fontWeight: '700' },
  headerIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error, borderRadius: 9, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: Spacing.md },
  promoCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24, elevation: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  promoHeadline: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.xs },
  promoCopy: { color: Colors.textSecondary, lineHeight: 22 },
  section: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: Spacing.sm },
  statPanel: { width: '48%', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.sm, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 3, borderWidth: 1, borderColor: '#E5E7EB' },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary, marginBottom: 6 },
  statLabel: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, fontWeight: '500' },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24, elevation: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionItem: { width: '48%', marginBottom: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.sm, backgroundColor: '#F9FAFB', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  actionIcon: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  actionLabel: { fontSize: 12, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  fundMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  fundTotal: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  fyText: { fontSize: 12, color: Colors.textSecondary, backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, fontWeight: '600' },
  loadingText: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.md },
=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
});
