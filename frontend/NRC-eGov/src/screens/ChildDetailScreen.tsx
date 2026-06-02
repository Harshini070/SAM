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
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';

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

const STATUS_BG_COLORS: Record<string, string> = {
  SAM: '#FEE2E2',
  MAM: '#FEF3C7',
  Healthy: '#D1FAE5',
  Normal: '#D1FAE5',
};

const STATUS_GRADIENTS: Record<string, [string, string]> = {
  SAM: ['#FCA5A5', '#DC2626'],
  MAM: ['#FCD34D', '#D97706'],
  Healthy: ['#34D399', '#059669'],
  Normal: ['#34D399', '#059669'],
};

export const ChildDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { childId } = route.params;
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isParent = user?.role === 'parent';
  const { t, locale } = useLanguage();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nrcCenters, setNrcCenters] = useState<any[]>([]);
  const [admitting, setAdmitting] = useState(false);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const res = await childService.getChild(childId);
      setChild(res);

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

    const localCenter =
      nrcCenters.find((c) => c.district.toLowerCase() === child.district.toLowerCase()) ||
      nrcCenters[0];

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
              Alert.alert(
                'Referral Success',
                `${child.name} is now referred and admitted to ${localCenter.name}. Bed capacity updated.`
              );
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
        <View style={styles.errorIconCircle}>
          <Ionicons name="alert-circle-outline" size={44} color={Colors.error} />
        </View>
        <Text style={styles.errorTitle}>Child Profile Not Found</Text>
        <Text style={styles.errorSub}>The child code is incorrect or has been archived.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Return to Registry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Prepping Chart Data
  const chartLabels = child.growth_history?.map((h: any) => h.date.substring(5)) || [];
  const chartData = child.growth_history?.map((h: any) => h.weight) || [];
  const activeStatus = child.health_status || 'Healthy';
  const statusColor = STATUS_COLORS[activeStatus] || Colors.success;
  const statusBg = STATUS_BG_COLORS[activeStatus] || '#D1FAE5';
  const statusGradient = STATUS_GRADIENTS[activeStatus] || ['#34D399', '#059669'];

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar
        title={child.name}
        subtitle={`ID: ${child.child_id}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Core Pediatric Profile Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={statusGradient}
              style={styles.avatarCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>{child.name[0]}</Text>
            </LinearGradient>
            <View style={styles.headerMeta}>
              <Text style={styles.childName}>{child.name}</Text>
              <View style={styles.genderDobRow}>
                <Ionicons
                  name={child.gender === 'M' ? 'male-outline' : 'female-outline'}
                  size={12}
                  color={Colors.textSecondary}
                />
                <Text style={styles.childGenderAge}>
                  {child.gender === 'M' ? t('male') : child.gender === 'F' ? t('female') : child.gender} · {t('dobLabel')}:{' '}
                  {new Date(child.dob).toLocaleDateString(locale === 'en' ? 'en-IN' : 'hi-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {activeStatus.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Vitals Widgets Grid */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <View style={styles.vitalIconBg}>
                <Ionicons name="barbell-outline" size={13} color={Colors.primary} />
              </View>
              <Text style={styles.gridLabel}>{t('weight')}</Text>
              <Text style={styles.gridVal}>{child.weight ? `${child.weight} kg` : '—'}</Text>
            </View>
            <View style={styles.gridCol}>
              <View style={styles.vitalIconBg}>
                <Ionicons name="resize-outline" size={13} color={Colors.primary} />
              </View>
              <Text style={styles.gridLabel}>{t('height')}</Text>
              <Text style={styles.gridVal}>{child.height ? `${child.height} cm` : '—'}</Text>
            </View>
            <View style={styles.gridCol}>
              <View style={styles.vitalIconBg}>
                <Ionicons name="speedometer-outline" size={13} color={Colors.primary} />
              </View>
              <Text style={styles.gridLabel}>{t('muac')}</Text>
              <Text style={[styles.gridVal, child.muac < 115 && { color: Colors.error }]}>
                {child.muac ? `${child.muac} mm` : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Referral Button for Supervisors/Health workers */}
        {!isParent && child.health_status === 'SAM' && child.nrc_assigned === 'Not assigned' && (
          <TouchableOpacity
            style={styles.referralBanner}
            onPress={handleReferral}
            disabled={admitting}
          >
            {admitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <View style={styles.bannerIconCircle}>
                  <Ionicons name="business" size={16} color={Colors.error} />
                </View>
                <View style={styles.referralTextContainer}>
                  <Text style={styles.referralTitle}>{t('referToNrc')}</Text>
                  <Text style={styles.referralSubText}>
                    {t('activeBedCapacityAvailable').replace('{district}', t(child.district.toLowerCase()))}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.white} />
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Assigned NRC info */}
        {child.nrc_assigned !== 'Not assigned' && (
          <View style={[styles.card, styles.nrcAssignedCard]}>
            <View style={styles.nrcHeader}>
              <View style={styles.nrcSuccessCircle}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              </View>
              <Text style={styles.nrcTitle}>{t('admittedToNrcTitle')}</Text>
            </View>
            <Text style={styles.nrcSubText}>{child.nrc_assigned}</Text>
          </View>
        )}

        {/* Weight Development Trend Chart */}
        {chartData.length > 1 && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="trending-up-outline" size={16} color={Colors.primary} />
              <Text style={styles.sectionHeader}>{t('growthChart')}</Text>
            </View>
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [{ data: chartData }],
              }}
              width={width - Spacing.md * 3.5}
              height={180}
              chartConfig={{
                backgroundGradientFrom: Colors.white,
                backgroundGradientTo: Colors.white,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(10, 25, 49, ${opacity})`,
                labelColor: () => Colors.textSecondary,
                propsForDots: { r: '5', strokeWidth: '2', stroke: Colors.primary },
                propsForBackgroundLines: { stroke: '#E2E8F0', strokeDasharray: '4' },
              }}
              style={styles.chart}
              bezier
            />
          </View>
        )}

        {/* Details list */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="people-outline" size={16} color={Colors.primary} />
            <Text style={styles.sectionHeader}>{t('familyContextTitle')}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('mothersName')}</Text>
            <Text style={styles.metaValue}>{child.mother_name}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('mothersPhone')}</Text>
            <Text style={styles.metaValue}>+91 {child.mother_phone}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('anganwadiVillage')}</Text>
            <Text style={styles.metaValue}>
              {child.village}, {t(child.district.toLowerCase())}
            </Text>
          </View>
          <View style={[styles.metaRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.metaLabel}>{t('lastAssessmentDate')}</Text>
            <Text style={styles.metaValue}>
              {child.last_screening_date
                ? new Date(child.last_screening_date).toLocaleDateString(locale === 'en' ? 'en-IN' : 'hi-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'}
            </Text>
          </View>
        </View>

        {/* Clinical Recommendations Banner Box */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: statusColor }]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="medical-outline" size={16} color={statusColor} />
            <Text style={[styles.sectionHeader, { color: Colors.textPrimary }]}>
              {t('clinicalAdvice')}
            </Text>
          </View>
          <View style={[styles.recommendationContainer, { backgroundColor: statusColor + '0A' }]}>
            {child.health_status === 'SAM' ? (
              <View style={styles.recommendationBox}>
                <Ionicons name="alert-circle" size={15} color={Colors.error} style={{ marginTop: 2 }} />
                <Text style={styles.recText}>
                  {t('recSamFormula')}
                </Text>
              </View>
            ) : child.health_status === 'MAM' ? (
              <View style={styles.recommendationBox}>
                <Ionicons name="warning" size={15} color="#D97706" style={{ marginTop: 2 }} />
                <Text style={styles.recText}>
                  {t('recMamFormula')}
                </Text>
              </View>
            ) : (
              <View style={styles.recommendationBox}>
                <Ionicons name="checkmark-circle" size={15} color={Colors.success} style={{ marginTop: 2 }} />
                <Text style={styles.recText}>
                  {t('recHealthyFormula')}
                </Text>
              </View>
            )}
            <View style={[styles.recommendationBox, { marginTop: 10 }]}>
              <Ionicons name="analytics" size={15} color={statusColor} style={{ marginTop: 2 }} />
              <Text style={styles.recText}>
                {t('recMuacWarning')}
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline Growth History logs */}
        {child.growth_history && child.growth_history.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={styles.sectionHeader}>{t('assessmentLog')}</Text>
            </View>

            <View style={styles.timelineContainer}>
              {child.growth_history.map((h: any, i: number) => {
                const logStatus = h.status || 'Healthy';
                const logColor = STATUS_COLORS[logStatus] || Colors.success;
                const isLast = i === child.growth_history.length - 1;

                return (
                  <View key={i} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineNode, { borderColor: logColor }]}>
                        <View style={[styles.timelineNodeInner, { backgroundColor: logColor }]} />
                      </View>
                      {!isLast && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineRight}>
                      <View style={styles.logCard}>
                        <View style={styles.logHeader}>
                          <Text style={styles.logDate}>
                            {new Date(h.date).toLocaleDateString(locale === 'en' ? 'en-IN' : 'hi-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Text>
                          <View
                            style={[
                              styles.logBadge,
                              { backgroundColor: STATUS_BG_COLORS[logStatus] || '#D1FAE5' },
                            ]}
                          >
                            <Text style={[styles.logBadgeText, { color: logColor }]}>
                              {logStatus.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.logVitalsRow}>
                          <Text style={styles.logStat}>
                            {t('weight')}: <Text style={styles.logStatVal}>{h.weight} kg</Text>
                          </Text>
                          <Text style={styles.logStat}>
                            {t('height')}: <Text style={styles.logStatVal}>{h.height} cm</Text>
                          </Text>
                          <Text style={styles.logStat}>
                            {t('muac')}: <Text style={styles.logStatVal}>{h.muac} mm</Text>
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  loadingText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 12,
    fontWeight: '600',
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '800',
  },
  errorSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtnText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },

  // Base Premium Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: 'rgba(15, 23, 42, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.white },
  headerMeta: { flex: 1, gap: 2 },
  childName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  genderDobRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  childGenderAge: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },

  // Vitals Grid Widgets
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  gridCol: { alignItems: 'center', flex: 1 },
  vitalIconBg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '700', letterSpacing: 0.3 },
  gridVal: { fontSize: 14, color: Colors.textPrimary, marginTop: 2, fontWeight: '800' },

  // Banner Actions
  referralBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.error,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTextContainer: { flex: 1 },
  referralTitle: { fontSize: 13, color: Colors.white, fontWeight: '800' },
  referralSubText: { fontSize: 10, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2, fontWeight: '500' },

  nrcAssignedCard: { borderLeftWidth: 4, borderLeftColor: Colors.success },
  nrcHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  nrcSuccessCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nrcTitle: { fontSize: 9, color: Colors.success, fontWeight: '800', letterSpacing: 0.5 },
  nrcSubText: { fontSize: 13, color: Colors.textPrimary, paddingLeft: 24, fontWeight: '700' },

  // Sections
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeader: { fontSize: 13, color: Colors.primary, fontWeight: '800' },
  chart: { borderRadius: 14, marginTop: 4 },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metaLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  metaValue: { fontSize: 11, color: Colors.textPrimary, fontWeight: '700' },

  // Recommendation Card Details
  recommendationContainer: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  recommendationBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  recText: { fontSize: 11, color: Colors.textPrimary, flex: 1, lineHeight: 16, fontWeight: '500' },

  // Vertical Timeline for growth logs
  timelineContainer: {
    marginTop: 8,
    paddingLeft: 6,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
    width: 16,
  },
  timelineNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 14,
  },
  timelineNodeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
    marginBottom: -14,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 14,
  },
  logCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logDate: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  logBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  logBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  logVitalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  logStat: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  logStatVal: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
