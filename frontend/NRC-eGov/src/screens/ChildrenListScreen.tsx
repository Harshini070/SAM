import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { childService } from '../services/childService';
import { useLanguage } from '../context/LanguageContext';

const STATUS_COLORS: Record<string, string> = {
  SAM: Colors.error,
  MAM: '#D97706',
  Healthy: Colors.success,
  Recovery: Colors.success,
  Discharged: Colors.primaryLight,
};

const STATUS_BG_COLORS: Record<string, string> = {
  SAM: '#FEE2E2',
  MAM: '#FEF3C7',
  Healthy: '#D1FAE5',
  Recovery: '#D1FAE5',
  Discharged: '#E0E7FF',
};

const FILTERS = ['All', 'SAM', 'MAM', 'Healthy'];

interface Child {
  _id?: string;
  child_id: string;
  name: string;
  dob: string;
  gender: string;
  mother_name: string;
  mother_phone: string;
  village: string;
  district: string;
  weight?: number;
  height?: number;
  muac?: number;
  health_status?: string;
  last_screening_date?: string;
  nrc_assigned?: string;
}

export const ChildrenListScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, locale } = useLanguage();
  const isFocused = useIsFocused();
  const [children, setChildren] = useState<Child[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchChildren = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const data = await childService.getChildrenByMother();
      setChildren(data || []);
    } catch (err: any) {
      console.error('Failed to fetch children:', err);
      setError(err.message || 'Failed to sync child records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchChildren(children.length === 0);
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChildren(false);
  };

  const filtered = children.filter((c) => {
    const matchFilter = filter === 'All' || c.health_status?.toUpperCase() === filter.toUpperCase();
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase()) ||
      (c.village && c.village.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar title={t('childrenList')} subtitle={`${children.length} ${t('totalRegisteredProfiles')}`} />

      {/* Search Header Container */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ChildRegistration')}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Category Row */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const filterLabel = f === 'All' ? t('all') : f === 'SAM' ? t('sam') : f === 'MAM' ? t('mam') : t('healthy');
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, filter === f && styles.chipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{filterLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('syncingRegistry')}</Text>
        </View>
      ) : error ? (
        <View style={styles.centerLoader}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="cloud-offline-outline" size={40} color={Colors.error} />
          </View>
          <Text style={styles.errorTitle}>{t('syncFailed')}</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchChildren(true)}>
            <Text style={styles.retryBtnText}>{t('retryBtn')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.resultCount}>{filtered.length} {t('matchingRecords')}</Text>
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="people-outline" size={36} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>{t('registryEmpty')}</Text>
              <Text style={styles.emptySub}>
                {t('noChildren')}
              </Text>
              <TouchableOpacity
                style={styles.emptyAction}
                onPress={() => navigation.navigate('ChildRegistration')}
              >
                <Text style={styles.emptyActionText}>{t('registerChildBtn')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((child) => {
              const statusKey = child.health_status || 'Healthy';
              const statusColor = STATUS_COLORS[statusKey] || Colors.success;
              const statusBg = STATUS_BG_COLORS[statusKey] || '#D1FAE5';

              return (
                <TouchableOpacity
                  key={child.child_id}
                  style={[styles.childCard, { borderLeftColor: statusColor }]}
                  onPress={() => navigation.navigate('ChildDetail', { childId: child.child_id })}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.childAvatar, { backgroundColor: statusColor + '12' }]}>
                      <Text style={[styles.childInitial, { color: statusColor }]}>
                        {child.name[0]}
                      </Text>
                    </View>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                        <Text style={styles.childSub}>
                          {child.village ? `${child.village}, ` : ''}
                          {t(child.district.toLowerCase())}
                        </Text>
                      </View>
                      <View style={styles.facilityRow}>
                        <Ionicons name="business-outline" size={11} color={Colors.textMuted} />
                        <Text style={styles.childNRC} numberOfLines={1}>
                          {child.nrc_assigned && child.nrc_assigned !== 'Not assigned'
                            ? child.nrc_assigned
                            : 'Anganwadi Home Care'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusKey.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardMeta}>
                    <View style={styles.metaBadge}>
                      <Ionicons name="scale-outline" size={11} color={Colors.textSecondary} />
                      <Text style={styles.metaLabel}>{t('weight')}:</Text>
                      <Text style={styles.metaVal}>
                        {child.weight ? `${child.weight} kg` : '—'}
                      </Text>
                    </View>
                    <View style={styles.metaBadge}>
                      <Ionicons name="pulse-outline" size={11} color={Colors.textSecondary} />
                      <Text style={styles.metaLabel}>{t('muac')}:</Text>
                      <Text style={styles.metaVal}>
                        {child.muac ? `${child.muac} mm` : '—'}
                      </Text>
                    </View>

                    <View style={styles.viewBtn}>
                      <Text style={styles.viewBtnText}>{t('profile')}</Text>
                      <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },

  // Search Bar Layout
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
    padding: 0,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },

  // Category Filter Row
  filterWrapper: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 2,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },

  // Loader & Errors
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
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
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  retryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 12,
  },
  retryBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  // Scrollable list content
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  resultCount: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Core Premium Child Card Layout
  childCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    shadowColor: 'rgba(15, 23, 42, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  childInitial: { fontSize: 18, fontWeight: '800' },
  childInfo: { flex: 1, gap: 2 },
  childName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  childSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  childNRC: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
    maxWidth: '90%',
  },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },

  // Card Metadata footer
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  metaVal: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary },

  viewBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewBtnText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '800',
  },

  // Fallbacks
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    paddingHorizontal: 12,
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '500',
  },
  emptyAction: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  emptyActionText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
});
