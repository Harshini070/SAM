import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { AuthContext } from '../../context/AuthContext';
import { childService } from '../../services/childService';
import { nrcService } from '../../services/nrcService';
import { parentService } from '../../services/parentService';
import { Colors } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const { width } = Dimensions.get('window');

export const ParentDashboardScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const navigation = useNavigation<NavigationProp>();
  const { t, locale } = useLanguage();

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [nrcCenters, setNrcCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // 1. Fetch children
      const data = await childService.getChildrenByMother();
      setChildren(data || []);

      // 2. Fetch alerts
      const dbAlerts = await parentService.getMyAlerts();
      setAlerts(dbAlerts ? dbAlerts.slice(0, 2) : []);

      // 3. Fetch NRC centers
      const centers = await nrcService.getAllCenters();
      setNrcCenters(centers || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData(true);
    }, [])
  );

  const getStatusColor = (status: string) => {
    if (!status) return Colors.success;
    const lower = status.toLowerCase();
    if (lower === 'sam') return Colors.error;
    if (lower === 'mam') return '#D97706';
    return Colors.success;
  };

  const getStatusLabelColor = (status: string) => {
    if (!status) return '#D1FAE5';
    const lower = status.toLowerCase();
    if (lower === 'sam') return '#FEE2E2';
    if (lower === 'mam') return '#FEF3C7';
    return '#D1FAE5';
  };

  const getStatusGradient = (status: string): [string, string] => {
    if (!status) return ['#34D399', '#059669'];
    const lower = status.toLowerCase();
    if (lower === 'sam') return ['#FCA5A5', '#DC2626'];
    if (lower === 'mam') return ['#FCD34D', '#D97706'];
    return ['#34D399', '#059669'];
  };

  const getWeightTrend = (child: any) => {
    if (!child.growth_history || child.growth_history.length < 2) return null;
    const history = [...child.growth_history].sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const latest = history[history.length - 1].weight;
    const prev = history[history.length - 2].weight;
    const diff = latest - prev;

    if (diff > 0) {
      return {
        text: `+${diff.toFixed(1)} kg ${t('weightGain')}`,
        icon: 'trending-up-outline' as const,
        color: Colors.success,
        bgColor: '#E6FBF3',
      };
    } else if (diff < 0) {
      return {
        text: `${diff.toFixed(1)} kg ${t('weightLoss')}`,
        icon: 'trending-down-outline' as const,
        color: Colors.error,
        bgColor: '#FDF2F2',
      };
    }
    return {
      text: t('noChange'),
      icon: 'arrow-forward-outline' as const,
      color: Colors.textSecondary,
      bgColor: '#F3F4F6',
    };
  };

  const renderTracker = (child: any) => {
    let currentStage = 1; // Registered
    const status = child.health_status?.toLowerCase();

    if (status === 'healthy' || status === 'normal') {
      currentStage = 5; // Healthy
    } else if (child.nrc_assigned && child.nrc_assigned !== 'Not assigned') {
      currentStage = 4; // Admitted to NRC
    } else if (status === 'sam') {
      currentStage = 3; // Referred
    } else if (child.last_screening_date) {
      currentStage = 2; // Screened
    }

    const stages = [
      { num: 1, label: t('registeredStep') },
      { num: 2, label: t('screenedStep') },
      { num: 3, label: t('referredStep') },
      { num: 4, label: t('nrcAdmittedStep') },
      { num: 5, label: t('healthy') },
    ];

    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <Ionicons name="git-commit-outline" size={18} color={Colors.primary} />
          <Text style={styles.sectionTitle}>{t('recoveryTimeline')}</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          {t('recoveryMilestones')}
        </Text>
        <View style={styles.stepperRow}>
          {stages.map((st, idx) => {
            const isCompleted = st.num < currentStage;
            const isActive = st.num === currentStage;
            const isPending = st.num > currentStage;

            return (
              <React.Fragment key={st.num}>
                <View style={styles.stepCol}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.stepCompleted,
                      isActive && styles.stepActive,
                      isPending && styles.stepPending,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={10} color={Colors.white} />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumText,
                          isActive && styles.stepActiveNumText,
                          isPending && styles.stepPendingNumText,
                        ]}
                      >
                        {st.num}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                      isCompleted && styles.stepLabelCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {st.label}
                  </Text>
                </View>
                {idx < stages.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      st.num < currentStage ? styles.stepLineCompleted : styles.stepLinePending,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  const renderAssignedFacility = (child: any) => {
    const isAdmitted = child.nrc_assigned && child.nrc_assigned !== 'Not assigned';

    if (isAdmitted) {
      const center = nrcCenters.find(
        (c) =>
          c.name.toLowerCase() === child.nrc_assigned.toLowerCase() ||
          c.nrc_id === child.nrc_assigned
      ) || {
        name: child.nrc_assigned,
        phone: '0771-4091223',
        address: t('assignedDistrictHospitalNrc'),
      };

      return (
        <View style={[styles.facilityCard, { borderLeftColor: Colors.error }]}>
          <View style={styles.facilityHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="business" size={16} color={Colors.error} />
            </View>
            <View style={styles.facilityHeaderMeta}>
              <Text style={styles.facilityLabel}>{t('activeReferralPlacement')}</Text>
              <Text style={styles.facilityName}>{center.name}</Text>
            </View>
          </View>
          <View style={styles.facilityBody}>
            <View style={styles.facilityInfoRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.facilityInfoText}>{center.address}</Text>
            </View>
            <View style={styles.facilityInfoRow}>
              <Ionicons name="call-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.facilityInfoText}>{center.phone}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: Colors.error }]}
            onPress={() => Alert.alert('Calling NRC', `Dialing helpline: ${center.phone}`)}
          >
            <Ionicons name="call" size={14} color={Colors.white} />
            <Text style={styles.contactBtnText}>{t('callCenterCoordinator')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.facilityCard, { borderLeftColor: Colors.accent }]}>
        <View style={styles.facilityHeader}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFE4E6' }]}>
            <Ionicons name="home-outline" size={16} color={Colors.accent} />
          </View>
          <View style={styles.facilityHeaderMeta}>
            <Text style={styles.facilityLabel}>{t('primaryCareFacility')}</Text>
            <Text style={styles.facilityName}>{t('anganwadiCenterAwc')} {child.village || t('localVillageCenter')}</Text>
          </View>
        </View>
        <View style={styles.facilityBody}>
          <View style={styles.facilityInfoRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.facilityInfoText}>{t('villageLabel')}: {child.village || '—'}, {t('districtLabel')}: {child.district ? t(child.district.toLowerCase()) : '—'}</Text>
          </View>
          <View style={styles.facilityInfoRow}>
            <Ionicons name="ribbon-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.facilityInfoText}>{t('icdsProgram')}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.contactBtn, { backgroundColor: Colors.primary }]}
          onPress={() => Alert.alert('Contacting Mitanin', 'Contacting local community healthcare worker')}
        >
          <Ionicons name="chatbox-ellipses-outline" size={14} color={Colors.white} />
          <Text style={styles.contactBtnText}>{t('messageMitaninField')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Syncing parent registry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedChild = children[selectedChildIndex];
  const trend = selectedChild ? getWeightTrend(selectedChild) : null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDashboardData(false);
            }}
          />
        }
      >
        {/* Modern Linear Gradient Header */}
        <LinearGradient
          colors={['#0A1931', '#15305B']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerUserMeta}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>
                  {user?.name?.substring(0, 2).toUpperCase() || 'CG'}
                </Text>
              </View>
              <View>
                <Text style={styles.headerWelcome}>{t('welcomeBack')}</Text>
                <Text style={styles.headerName}>{user?.name || 'Guardian'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notificationBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={20} color={Colors.white} />
              {alerts.length > 0 && <View style={styles.badge} />}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {children.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>{t('noChildrenRegistered')}</Text>
            <Text style={styles.emptySub}>
              {t('registerChildDesc')}
            </Text>
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('ChildRegistration')}
            >
              <Text style={styles.registerBtnText}>{t('registerChildBtn')}</Text>
              <Ionicons name="add" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Child Profile Chips Selector */}
            {children.length > 1 && (
              <View style={styles.selectorWrapper}>
                <Text style={styles.selectorTitle}>{t('selectChildProfile')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {children.map((ch, idx) => (
                    <TouchableOpacity
                      key={ch.child_id}
                      style={[
                        styles.chip,
                        selectedChildIndex === idx && styles.chipActive,
                      ]}
                      onPress={() => setSelectedChildIndex(idx)}
                    >
                      <View
                        style={[
                          styles.chipDot,
                          { backgroundColor: getStatusColor(ch.health_status) },
                        ]}
                      />
                      <Text style={[styles.chipText, selectedChildIndex === idx && styles.chipTextActive]}>
                        {ch.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Premium Child Details Card */}
            <View style={styles.childCard}>
              <View style={styles.cardHeader}>
                <LinearGradient
                  colors={getStatusGradient(selectedChild.health_status)}
                  style={styles.avatarCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarLetter}>
                    {selectedChild.name[0]}
                  </Text>
                </LinearGradient>
                <View style={styles.headerMeta}>
                  <Text style={styles.childName}>{selectedChild.name}</Text>
                  <Text style={styles.childDob}>
                    {t('dobLabel')}: {new Date(selectedChild.dob).toLocaleDateString(locale === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusLabelColor(selectedChild.health_status) }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(selectedChild.health_status) }]}>
                    {selectedChild.health_status?.toUpperCase() || 'HEALTHY'}
                  </Text>
                </View>
              </View>

              {/* Weight Change Trend Callout */}
              {trend && (
                <View style={[styles.trendContainer, { backgroundColor: trend.bgColor }]}>
                  <Ionicons name={trend.icon} size={14} color={trend.color} />
                  <Text style={[styles.trendText, { color: trend.color }]}>{trend.text}</Text>
                </View>
              )}

              {/* Vitals Grid Widgets */}
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <View style={styles.vitalIconWrap}>
                    <Ionicons name="barbell-outline" size={14} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>{t('weight').toUpperCase()}</Text>
                  <Text style={styles.gridVal}>
                    {selectedChild.weight ? `${selectedChild.weight} kg` : '—'}
                  </Text>
                </View>
                <View style={styles.gridCol}>
                  <View style={styles.vitalIconWrap}>
                    <Ionicons name="resize-outline" size={14} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>{t('height').toUpperCase()}</Text>
                  <Text style={styles.gridVal}>
                    {selectedChild.height ? `${selectedChild.height} cm` : '—'}
                  </Text>
                </View>
                <View style={styles.gridCol}>
                  <View style={styles.vitalIconWrap}>
                    <Ionicons name="speedometer-outline" size={14} color={Colors.primary} />
                  </View>
                  <Text style={styles.gridLabel}>{t('muac').toUpperCase()}</Text>
                  <Text style={[styles.gridVal, selectedChild.muac < 115 && { color: Colors.error }]}>
                    {selectedChild.muac ? `${selectedChild.muac} mm` : '—'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.detailsLink}
                onPress={() =>
                  navigation.navigate('ChildDetail', { childId: selectedChild.child_id })
                }
              >
                <Text style={styles.detailsLinkText}>{t('viewDevelopmentHistory')}</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Stepper Timeline Tracker */}
            {renderTracker(selectedChild)}

            {/* Anganwadi / NRC Facility Cards */}
            {renderAssignedFacility(selectedChild)}

            {/* Reminders & Nutritional Guidelines */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <Ionicons name="heart-half-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>{t('remindersNutritionalTips')}</Text>
              </View>
              <View style={styles.adviceBlock}>
                <View style={[styles.adviceItem, { borderLeftColor: Colors.warning }]}>
                  <Ionicons name="time" size={16} color={Colors.warning} />
                  <View style={styles.adviceContent}>
                    <Text style={styles.adviceHeader}>{t('nextAssessmentDue')}</Text>
                    <Text style={styles.adviceText}>
                      {t('scheduledFor')}{' '}
                      {new Date(
                        selectedChild.next_followup_date ||
                          Date.now() + 15 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString(locale === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'short' })}
                      . {t('checksRequiredBimonthly')}
                    </Text>
                  </View>
                </View>
                <View style={[styles.adviceItem, { borderLeftColor: Colors.success }]}>
                  <Ionicons name="nutrition" size={16} color={Colors.success} />
                  <View style={styles.adviceContent}>
                    <Text style={styles.adviceHeader}>{t('nutritionalGuideline')}</Text>
                    <Text style={styles.adviceText}>
                      {selectedChild.health_status?.toLowerCase() === 'sam'
                        ? t('adviceSamGuide')
                        : t('adviceNormalGuide')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Quick Actions Control Panel */}
        <View style={styles.actionsPanel}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ChildRegistration')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#ECEFF6' }]}>
              <Ionicons name="add-circle" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionCardText}>{t('registerChildBtn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#ECEFF6' }]}>
              <Ionicons name="notifications" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionCardText}>{t('notifications')} ({alerts.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Alerts Feed */}
        {alerts.length > 0 && (
          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <Ionicons name="newspaper-outline" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{t('recentAlerts')}</Text>
            </View>
            {alerts.map((alert, idx) => (
              <View key={alert._id || idx} style={[styles.alertRow, idx > 0 && styles.borderTop]}>
                <View style={styles.alertHeaderRow}>
                  <View style={styles.alertPulseDot} />
                  <Text style={styles.alertTitleText}>{alert.title}</Text>
                </View>
                <Text style={styles.alertMsgText}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footerNote}>
          {t('dashboardFooterText')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 13, color: Colors.textMuted, marginTop: 12, fontWeight: '600' },
  content: { gap: 14, paddingBottom: Spacing.xl },

  // Linear Gradient Header Layout
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerUserMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  headerWelcome: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerName: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1,
    borderColor: '#0A1931',
  },

  // Selector Wrapper
  selectorWrapper: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  selectorTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipRow: { gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  chipActive: {
    backgroundColor: '#EEF2F6',
    borderColor: Colors.primary,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },

  // Child Card
  childCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
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
  avatarLetter: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  headerMeta: { flex: 1 },
  childName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  childDob: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },

  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Vitals Grid
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  gridCol: { alignItems: 'center', flex: 1 },
  vitalIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '700', letterSpacing: 0.3 },
  gridVal: { fontSize: 14, color: Colors.textPrimary, marginTop: 2, fontWeight: '800' },

  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingTop: 12,
  },
  detailsLinkText: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  // Section Cards
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(15, 23, 42, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 15,
  },

  // Journey Stepper Tracker
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepCol: { alignItems: 'center', width: 56 },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  stepCompleted: { backgroundColor: Colors.success, borderColor: Colors.success },
  stepActive: { backgroundColor: Colors.white, borderColor: Colors.primary, borderWidth: 2 },
  stepPending: { backgroundColor: Colors.white, borderColor: '#CBD5E1' },
  stepNumText: { fontSize: 9, fontWeight: '800' },
  stepActiveNumText: { color: Colors.primary, fontWeight: '900' },
  stepPendingNumText: { color: Colors.textMuted },
  stepLabel: { fontSize: 8, color: Colors.textMuted, marginTop: 6, fontWeight: '700', textAlign: 'center' },
  stepLabelActive: { color: Colors.primary, fontWeight: '800' },
  stepLabelCompleted: { color: Colors.success, fontWeight: '700' },
  stepLine: { flex: 1, height: 2, marginBottom: 12 },
  stepLineCompleted: { backgroundColor: Colors.success },
  stepLinePending: { backgroundColor: '#E2E8F0' },

  // Facility Card Design
  facilityCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    shadowColor: 'rgba(15, 23, 42, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityHeaderMeta: { flex: 1 },
  facilityLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  facilityBody: {
    gap: 6,
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  facilityInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  facilityInfoText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 10,
  },
  contactBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  // Advice Section
  adviceBlock: { gap: 10 },
  adviceItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
  },
  adviceContent: { flex: 1 },
  adviceHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  adviceText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginTop: 2,
    fontWeight: '500',
  },

  // Actions Panel
  actionsPanel: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(15, 23, 42, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  actionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionCardText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Recent Alerts Feed
  alertRow: { paddingVertical: 12 },
  borderTop: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alertPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  alertTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  alertMsgText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    fontWeight: '500',
  },

  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(15, 23, 42, 0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  registerBtnText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  footerNote: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginVertical: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
