import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { nrcService } from '../services/nrcService';

const DISTRICTS = ['All Districts', 'Raipur', 'Durg', 'Bastar', 'Bilaspur', 'Rajnandgaon'];

interface NRCCenter {
  nrc_id: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  total_beds: number;
  occupied_beds: number;
  staff_count: number;
  latitude?: number;
  longitude?: number;
}

export const NRCCentersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [centers, setCenters] = useState<NRCCenter[]>([]);
  const [district, setDistrict] = useState('All Districts');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const fetchCenters = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const data = await nrcService.getAllCenters(district !== 'All Districts' ? district : undefined);
      setCenters(data);
    } catch (err: any) {
      console.error('Failed to fetch NRC centers:', err);
      setError(err.message || 'Failed to fetch active centers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {

    fetchCenters(true);
  }, [district]); // refetch when district changes!

  const onRefresh = () => {
    setRefreshing(true);
    fetchCenters(false);
  };

  const handleDistrictChange = (d: string) => {
    setDistrict(d);

  };

  const filtered = centers.filter((c) =>
    (district === 'All Districts' || c.district === district) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalBeds = centers.reduce((s, c) => s + c.total_beds, 0);
  const totalOcc = centers.reduce((s, c) => s + c.occupied_beds, 0);

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar title="NRC Centers" subtitle={`${centers.length} Centers · Chhattisgarh`} />

      {/* Summary */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Total Centers', val: centers.length.toString(), icon: 'business', color: Colors.primary },
          { label: 'Bed Capacity', val: totalBeds.toString(), icon: 'bed', color: '#7C3AED' },
          { label: 'Occupied', val: totalOcc.toString(), icon: 'people', color: Colors.error },
          { label: 'Occupancy', val: `${totalBeds > 0 ? Math.round((totalOcc / totalBeds) * 100) : 0}%`, icon: 'analytics', color: Colors.success },
        ].map((s) => (
          <View key={s.label} style={styles.summaryCard}>
            <Ionicons name={s.icon as any} size={16} color={s.color} />
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={15} color={Colors.textMuted} />
          <TextInput style={styles.searchInput} placeholder="Search NRC centers…"
            placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
        </View>
      </View>

      {/* District Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        {DISTRICTS.map((d) => (
          <TouchableOpacity key={d} style={[styles.chip, district === d && styles.chipActive]} onPress={() => handleDistrictChange(d)}>
            <Text style={[styles.chipText, district === d && styles.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading NRC centers...</Text>
        </View>

      ) : error ? (
        <View style={styles.centerLoader}>
          <Ionicons name="cloud-offline-outline" size={52} color={Colors.error} />
          <Text style={styles.errorTitle}>Failed to Load Centers</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchCenters(true)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filtered.length === 0 ? (

            <View style={styles.emptyWrap}>
              <Ionicons name="business-outline" size={54} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Centers Found</Text>
              <Text style={styles.emptySub}>
                {search.length > 0
                  ? `No NRC centers match "${search}".`
                  : district !== 'All Districts'
                  ? `No active centers in ${district} district.`
                  : 'No NRC centers are currently available.'}
              </Text>
            </View>
          ) : (
            filtered.map((center) => {
              const occPct = Math.round((center.occupied_beds / center.total_beds) * 100);
              const occColor = occPct > 85 ? Colors.error : occPct > 60 ? '#D97706' : Colors.success;
              return (

                <TouchableOpacity
                  key={center.nrc_id}
                  style={styles.centerCard}
                  onPress={() => navigation.navigate('NRCCenterDetail', { centerId: center.nrc_id })}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.centerIcon, { backgroundColor: Colors.primary + '12' }]}>
                      <Ionicons name="business-outline" size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.centerInfo}>
                      <Text style={styles.centerName}>{center.name}</Text>
                      <Text style={styles.centerDistrict}>{center.district} District</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: Colors.success + '15' }]}>
                      <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
                      <Text style={[styles.statusText, { color: Colors.success }]}>Active</Text>
                    </View>
                  </View>

                  <View style={styles.bedRow}>
                    <Text style={styles.bedLabel}>Bed Occupancy</Text>
                    <Text style={[styles.bedPct, { color: occColor }]}>{center.occupied_beds}/{center.total_beds} beds ({occPct}%)</Text>
                  </View>
                  <View style={styles.bedTrack}>
                    <View style={[styles.bedFill, { width: `${occPct}%`, backgroundColor: occColor }]} />
                  </View>
                  <View style={styles.centerMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={12} color={Colors.textMuted} />

                      <Text style={styles.metaText}>{center.address.split(',')[0]}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={12} color={Colors.textMuted} />
                      <Text style={styles.metaText}>{center.staff_count} Staff</Text>
                    </View>

                    <View style={styles.detailBtn}>
                      <Text style={styles.detailBtnText}>Details</Text>
                      <Ionicons name="chevron-forward" size={11} color={Colors.primary} />
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

  flex: { flex: 1, backgroundColor: Colors.background },
  summaryRow: { flexDirection: 'row', backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  summaryCard: { flex: 1, alignItems: 'center', gap: 3 },
  summaryVal: { fontSize: 16, fontWeight: '800' },
  summaryLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center', fontWeight: '600' },
  searchWrap: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, gap: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  searchInput: { flex: 1, fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  filterScroll: { backgroundColor: Colors.white, flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  filterRow: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  centerLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { fontSize: 12, color: Colors.textMuted, marginTop: 12, fontWeight: '600' },
  // Error state
  errorTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 12 },
  errorText: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginVertical: 6, paddingHorizontal: 24 },
  retryBtn: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 24, paddingHorizontal: 24, paddingVertical: 8, marginTop: 10 },
  retryBtnText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  // Empty state
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 },
  scroll: { flex: 1 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  centerCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 2, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  centerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  centerInfo: { flex: 1 },
  centerName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  centerDistrict: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
  statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '800' },
  bedRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  bedLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  bedPct: { fontSize: 11, fontWeight: '700' },
  bedTrack: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  bedFill: { height: '100%', borderRadius: 3 },
  centerMeta: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  detailBtn: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 2 },
  detailBtnText: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
});
