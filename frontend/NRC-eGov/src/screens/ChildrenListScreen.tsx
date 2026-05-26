import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { childService } from '../services/childService';

const STATUS_COLORS: Record<string, string> = {
  SAM: Colors.error,
  MAM: '#D97706',
  Healthy: Colors.success,
  Recovery: Colors.success,
  Discharged: Colors.primaryLight,
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
      setChildren(data);
    } catch (err: any) {
      console.error('Failed to fetch children:', err);
      setError(err.message || 'Failed to sync child records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChildren(true);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChildren(false);
  };

  const filtered = children.filter((c) => {
    const matchFilter = filter === 'All' || c.health_status?.toUpperCase() === filter.toUpperCase();
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar title="Children Registry" subtitle={`${children.length} Total Records`} />

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={15} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or district…"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={15} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ChildRegistration')}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Syncing state registry...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerLoader}>
          <Ionicons name="cloud-offline-outline" size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Synchronization Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchChildren(true)}>
            <Text style={styles.retryBtnText}>Retry Sync</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.resultCount}>{filtered.length} results</Text>
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="people-outline" size={54} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Registry Empty</Text>
              <Text style={styles.emptySub}>No children registered. Use the add button to register a child.</Text>
              <TouchableOpacity
                style={styles.emptyAction}
                onPress={() => navigation.navigate('ChildRegistration')}
              >
                <Text style={styles.emptyActionText}>Register First Child</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filtered.map((child) => (
              <TouchableOpacity
                key={child.child_id}
                style={styles.childCard}
                onPress={() => navigation.navigate('ChildDetail', { childId: child.child_id })}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.childAvatar, { backgroundColor: STATUS_COLORS[child.health_status || 'Healthy'] + '18' }]}>
                    <Text style={[styles.childInitial, { color: STATUS_COLORS[child.health_status || 'Healthy'] }]}>
                      {child.name[0]}
                    </Text>
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childSub}>{child.district}</Text>
                    <Text style={styles.childNRC}>{child.nrc_assigned || 'Not assigned'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[child.health_status || 'Healthy'] + '15' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[child.health_status || 'Healthy'] }]}>{child.health_status || 'Healthy'}</Text>
                  </View>
                </View>
                <View style={styles.cardMeta}>
                  {[
                    { icon: 'body-outline', val: child.weight || '—', label: 'Weight' },
                    { icon: 'resize-outline', val: child.muac || '—', label: 'MUAC' },
                  ].map((m) => (
                    <View key={m.label} style={styles.metaItem}>
                      <Ionicons name={m.icon as any} size={12} color={Colors.textMuted} />
                      <Text style={styles.metaVal}>{m.val}</Text>
                      <Text style={styles.metaLabel}>{m.label}</Text>
                    </View>
                  ))}
                  <View style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View Profile</Text>
                    <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  searchWrap: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, gap: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  filterScroll: { backgroundColor: Colors.white, flexGrow: 0 },
  filterRow: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { fontSize: 12, color: Colors.textMuted, marginTop: 12, fontWeight: '600' },
  noData: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 24 },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  resultCount: { fontSize: 11, color: Colors.textMuted, marginBottom: 4, fontWeight: '600' },
  childCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  childAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  childInitial: { fontSize: 18, fontWeight: '800' },
  childInfo: { flex: 1 },
  childName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  childSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
  childNRC: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaVal: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  metaLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  viewBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewBtnText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  
  // Custom Fallbacks styling
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.sm },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.lg },
  emptyAction: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, marginTop: Spacing.sm },
  emptyActionText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  errorTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: Spacing.sm },
  errorText: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginVertical: Spacing.xs, paddingHorizontal: Spacing.lg },
  retryBtn: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginTop: Spacing.sm },
  retryBtnText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
});
