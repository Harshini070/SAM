import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { childService } from '../services/childService';
import { nrcService } from '../services/nrcService';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChildDetail'>;
  route: RouteProp<RootStackParamList, 'ChildDetail'>;
};

const { width } = Dimensions.get('window');

const STATUS_COLORS: Record<string, string> = {
  SAM: Colors.error,
  MAM: '#D97706',
  Healthy: Colors.success,
  Normal: Colors.success,
};

export const ChildDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { childId } = route.params;
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nrcCenters, setNrcCenters] = useState<any[]>([]);
  const [admitting, setAdmitting] = useState(false);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const res = await childService.getChild(childId);
      setChild(res.data);
      
      // Fetch NRC centers in case we need referral
      const centers = await nrcService.getAllCenters();
      setNrcCenters(centers);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch child details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const handleReferral = async () => {
    if (nrcCenters.length === 0) {
      Alert.alert('Error', 'No active NRC centers available for referral');
      return;
    }

    // Pick Bastar or Raipur center based on child's district, or fallback to first
    const localCenter = nrcCenters.find(
      (c) => c.district.toLowerCase() === child.district.toLowerCase()
    ) || nrcCenters[0];

    Alert.alert(
      'Confirm NRC Admission',
      `Would you like to refer ${child.name} to ${localCenter.name} located in ${localCenter.district}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refer Child',
          onPress: async () => {
            setAdmitting(true);
            try {
              await nrcService.admitChild({
                child_id: child.child_id,
                nrc_id: localCenter.nrc_id,
              });
              Alert.alert('Referral Success', `${child.name} is now referred and admitted to ${localCenter.name}. Bed capacity updated.`);
              fetchChildData(); // reload
            } catch (err: any) {
              Alert.alert('Referral Failed', err.message || 'Admission failed');
            } finally {
              setAdmitting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching child medical chart...</Text>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={[styles.flex, styles.center, { padding: Spacing.lg }]}>
        <Ionicons name="alert-circle-outline" size={60} color={Colors.error} />
        <Text style={styles.errorTitle}>Child Profile Not Found</Text>
        <Text style={styles.errorSub}>The child code is incorrect or has been archived.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back to Registry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prepping Chart Data
  const chartLabels = child.growth_history?.map((h: any) => h.date.substring(5)) || [];
  const chartData = child.growth_history?.map((h: any) => h.weight) || [];

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar
        title={child.name}
        subtitle={`ID: ${child.child_id}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Pill Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatarCircle, { backgroundColor: STATUS_COLORS[child.health_status] + '15' }]}>
              <Text style={[styles.avatarText, { color: STATUS_COLORS[child.health_status] }]}>
                {child.name[0]}
              </Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childGenderAge}>{child.gender} · Born {child.dob}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[child.health_status] + '15' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[child.health_status] }]}>
                {child.health_status}
              </Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Weight</Text>
              <Text style={styles.gridVal}>{child.weight ? `${child.weight} kg` : '—'}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Height</Text>
              <Text style={styles.gridVal}>{child.height ? `${child.height} cm` : '—'}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>MUAC</Text>
              <Text style={[styles.gridVal, child.muac < 115 && { color: Colors.error, fontWeight: '700' }]}>
                {child.muac ? `${child.muac} mm` : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action refer button */}
        {child.health_status === 'SAM' && child.nrc_assigned === 'Not assigned' && (
          <TouchableOpacity style={styles.referralBanner} onPress={handleReferral} disabled={admitting}>
            {admitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Ionicons name="business" size={20} color={Colors.white} />
                <View style={styles.referralTextContainer}>
                  <Text style={styles.referralTitle}>Refer to NRC Center</Text>
                  <Text style={styles.referralSubText}>Beds are available in {child.district} district. Tap to admit child.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Assigned NRC info */}
        {child.nrc_assigned !== 'Not assigned' && (
          <View style={[styles.card, styles.nrcAssignedCard]}>
            <View style={styles.nrcHeader}>
              <Ionicons name="checkbox-outline" size={18} color={Colors.success} />
              <Text style={styles.nrcTitle}>Admitted to Rehabilitation Center</Text>
            </View>
            <Text style={styles.nrcSubText}>{child.nrc_assigned}</Text>
          </View>
        )}

        {/* Weight Trend Chart */}
        {chartData.length > 1 && (
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Weight Development Trend</Text>
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [{ data: chartData }],
              }}
              width={width - Spacing.md * 4}
              height={160}
              chartConfig={{
                backgroundGradientFrom: Colors.white,
                backgroundGradientTo: Colors.white,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 43, 91, ${opacity})`,
                labelColor: () => Colors.textSecondary,
                propsForDots: { r: '4', strokeWidth: '1.5', stroke: Colors.primary },
                propsForBackgroundLines: { stroke: Colors.border, strokeDasharray: '3' },
              }}
              style={styles.chart}
              bezier
            />
          </View>
        )}

        {/* Details list */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Registrar & Family Context</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Mother's Name</Text>
            <Text style={styles.metaValue}>{child.mother_name}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Mother's Phone</Text>
            <Text style={styles.metaValue}>+91 {child.mother_phone}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Anganwadi Village</Text>
            <Text style={styles.metaValue}>{child.village}, {child.district}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Last Assessment</Text>
            <Text style={styles.metaValue}>{child.last_screening_date}</Text>
          </View>
        </View>

        {/* Nutritional Recommendations */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Clinical Recommendations</Text>
          {child.health_status === 'SAM' ? (
            <View style={styles.recommendationBox}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>Initiate F-75 therapeutic formula (75 kcal/100ml) immediately under medical supervision.</Text>
            </View>
          ) : child.health_status === 'MAM' ? (
            <View style={styles.recommendationBox}>
              <View style={[styles.recDot, { backgroundColor: '#D97706' }]} />
              <Text style={styles.recText}>Distribute 2 packets of supplementary ready-to-use therapeutic food (RUTF) daily.</Text>
            </View>
          ) : (
            <View style={styles.recommendationBox}>
              <View style={[styles.recDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.recText}>Height-for-age is normal. Maintain active immunization, micronutrient powders, and bi-monthly checkups.</Text>
            </View>
          )}
          <View style={styles.recommendationBox}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>Measure MUAC every 7 days. If MUAC decreases below 110mm, refer for immediate intensive care.</Text>
          </View>
        </View>

        {/* Growth History logs */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Growth Assessment Logs</Text>
          {child.growth_history?.map((h: any, i: number) => (
            <View key={i} style={[styles.logRow, i < child.growth_history.length - 1 && styles.logBorder]}>
              <Text style={styles.logDate}>{h.date}</Text>
              <View style={styles.logMeta}>
                <Text style={styles.logStat}>W: {h.weight}kg</Text>
                <Text style={styles.logStat}>H: {h.height}cm</Text>
                <Text style={styles.logStat}>M: {h.muac}mm</Text>
              </View>
              <View style={[styles.logBadge, { backgroundColor: STATUS_COLORS[h.status || 'Healthy'] + '15' }]}>
                <Text style={[styles.logBadgeText, { color: STATUS_COLORS[h.status || 'Healthy'] }]}>{h.status || 'Healthy'}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.sm },
  errorTitle: { ...Typography.h3, color: Colors.textPrimary, marginTop: Spacing.md },
  errorSub: { ...Typography.bodySmall, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs },
  backBtn: { marginTop: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtnText: { color: Colors.white, ...Typography.caption, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing.md, marginBottom: Spacing.md },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800' },
  headerMeta: { flex: 1 },
  childName: { ...Typography.h3, color: Colors.textPrimary },
  childGenderAge: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '800' },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  gridCol: { alignItems: 'center', flex: 1 },
  gridLabel: { ...Typography.caption, color: Colors.textMuted },
  gridVal: { ...Typography.h4, color: Colors.textPrimary, marginTop: Spacing.xs - 2 },
  referralBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: '#E53935', borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  referralTextContainer: { flex: 1 },
  referralTitle: { ...Typography.h4, color: Colors.white, fontWeight: '700' },
  referralSubText: { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  nrcAssignedCard: { borderLeftWidth: 4, borderLeftColor: Colors.success },
  nrcHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs - 2 },
  nrcTitle: { ...Typography.label, color: Colors.success, fontWeight: '700' },
  nrcSubText: { ...Typography.bodySmall, color: Colors.textSecondary, paddingLeft: 22 },
  sectionHeader: { ...Typography.h4, color: Colors.primary, marginBottom: Spacing.sm },
  chart: { borderRadius: Radius.md, marginLeft: -Spacing.xs },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  metaLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  metaValue: { ...Typography.bodySmall, color: Colors.textPrimary, fontWeight: '600' },
  recommendationBox: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  recDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 7 },
  recText: { ...Typography.bodySmall, color: Colors.textPrimary, flex: 1, lineHeight: 18 },
  logRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  logBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  logDate: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1 },
  logMeta: { flexDirection: 'row', gap: Spacing.sm, flex: 2 },
  logStat: { fontSize: 11, color: Colors.textPrimary, fontWeight: '500' },
  logBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  logBadgeText: { fontSize: 9, fontWeight: '700' },
});
