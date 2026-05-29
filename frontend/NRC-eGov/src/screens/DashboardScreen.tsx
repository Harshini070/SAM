import React, { useState, useEffect } from 'react';
import {

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
import { ProgressBar } from '../components/ProgressBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useAuth } from '../hooks/useAuth';
import { analyticsService } from '../services/analyticsService';

const QUICK_ACTIONS = [
  { label: 'Add Child', icon: 'person-add-outline', color: Colors.primary, screen: 'ChildRegistration' },

  { label: 'NRC Centers', icon: 'business-outline', color: '#7C3AED', screen: 'NRCCenters' },
  { label: 'Funds', icon: 'bar-chart-outline', color: '#D97706', screen: 'Funds' },
  { label: 'Reports', icon: 'analytics-outline', color: Colors.success, screen: 'Reports' },
];

interface DashboardData {
  total_children?: number;
  sam_children?: number;

  mam_children?: number;
  healthy_children?: number;
  nrc_occupancy_pct?: number;
  total_funds?: number;
  district_stats?: { name: string; amount: number; percentage: number }[];
}

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await analyticsService.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {

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

    { label: 'Total Children', value: dashboardData?.total_children || '0', color: Colors.primary },
    { label: 'SAM Cases', value: dashboardData?.sam_children || '0', color: Colors.error },
    { label: 'MAM Cases', value: dashboardData?.mam_children || '0', color: '#D97706' },
    { label: 'Recovery Rate', value: `${dashboardData?.nrc_occupancy_pct || 0}%`, color: Colors.success },
  ];

  const districts = (dashboardData?.district_stats || []).map((d, i) => ({
    name: d.name,
    amount: `₹${d.amount}`,
    pct: d.percentage,
    color: [Colors.primary, Colors.success, '#7C3AED', '#D97706'][i % 4],
  }));


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
              </TouchableOpacity>
            ))}
          </View>
        </View>


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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({

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
});
