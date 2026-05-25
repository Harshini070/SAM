import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { nrcService } from '../services/nrcService';
import { childService } from '../services/childService';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NRCCenterDetail'>;
  route: RouteProp<RootStackParamList, 'NRCCenterDetail'>;
};

export const NRCCenterDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { centerId } = route.params;
  const [center, setCenter] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await nrcService.getCenter(centerId);
        setCenter(res.data);

        // Fetch children in the registry to see who is assigned to this NRC
        const allChildren = await childService.getChildrenByMother();
        const assigned = allChildren.filter(
          (c: any) => c.nrc_assigned === res.data.name
        );
        setChildren(assigned);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to fetch NRC details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [centerId]);

  const handleCall = () => {
    if (center?.phone) {
      Linking.openURL(`tel:${center.phone}`).catch(() => {
        Alert.alert('Error', 'Unable to open telephone dialer');
      });
    }
  };

  const handleDirections = () => {
    if (center?.latitude && center?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open Google Maps');
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching center credentials & capacity...</Text>
      </View>
    );
  }

  if (!center) {
    return (
      <View style={[styles.flex, styles.center, { padding: Spacing.lg }]}>
        <Ionicons name="alert-circle-outline" size={60} color={Colors.error} />
        <Text style={styles.errorTitle}>NRC Center Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const occPct = Math.round((center.occupied_beds / center.total_beds) * 100);
  const occColor = occPct > 85 ? Colors.error : occPct > 60 ? '#D97706' : Colors.success;

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar
        title={center.name}
        subtitle={`${center.district} District`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Bed Status Card */}
        <View style={styles.card}>
          <View style={styles.bedHeader}>
            <View style={[styles.badgeIcon, { backgroundColor: occColor + '15' }]}>
              <Ionicons name="bed-outline" size={24} color={occColor} />
            </View>
            <View style={styles.bedTextCol}>
              <Text style={styles.bedTitle}>Bed Capacity Status</Text>
              <Text style={styles.bedSubtitle}>Current rehabilitation load</Text>
            </View>
            <View style={styles.percentBlock}>
              <Text style={[styles.percentText, { color: occColor }]}>{occPct}%</Text>
              <Text style={styles.percentSub}>Occupied</Text>
            </View>
          </View>

          <View style={styles.bedProgressTrack}>
            <View style={[styles.bedProgressFill, { width: `${occPct}%`, backgroundColor: occColor }]} />
          </View>

          <View style={styles.bedStatsGrid}>
            <View style={styles.bedStatCol}>
              <Text style={styles.bedStatVal}>{center.total_beds}</Text>
              <Text style={styles.bedStatLbl}>Total Beds</Text>
            </View>
            <View style={styles.bedStatCol}>
              <Text style={[styles.bedStatVal, { color: occColor }]}>{center.occupied_beds}</Text>
              <Text style={styles.bedStatLbl}>Occupied</Text>
            </View>
            <View style={styles.bedStatCol}>
              <Text style={[styles.bedStatVal, { color: Colors.success }]}>
                {center.total_beds - center.occupied_beds}
              </Text>
              <Text style={styles.bedStatLbl}>Available</Text>
            </View>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Ionicons name="call-outline" size={18} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Call Center</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <Ionicons name="map-outline" size={18} color={Colors.primary} />
            <Text style={styles.actionBtnText}>Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Center Details */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Facility Specifications</Text>
          
          <View style={styles.specificationRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textMuted} style={styles.specIcon} />
            <View style={styles.specContent}>
              <Text style={styles.specLabel}>Address</Text>
              <Text style={styles.specValue}>{center.address}</Text>
            </View>
          </View>

          <View style={styles.specificationRow}>
            <Ionicons name="people-outline" size={16} color={Colors.textMuted} style={styles.specIcon} />
            <View style={styles.specContent}>
              <Text style={styles.specLabel}>Medical Staff Team</Text>
              <Text style={styles.specValue}>{center.staff_count} Dedicated Personnel (Doctors, Nutritionists, Nurses)</Text>
            </View>
          </View>

          <View style={styles.specificationRow}>
            <Ionicons name="pulse-outline" size={16} color={Colors.textMuted} style={styles.specIcon} />
            <View style={styles.specContent}>
              <Text style={styles.specLabel}>Primary Treatment Service</Text>
              <Text style={styles.specValue}>F-75 & F-100 therapeutic diet charts, electrolyte replacement, antibiotics and child care supervision.</Text>
            </View>
          </View>
        </View>

        {/* Admitted Children List */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Admitted Children ({children.length})</Text>
          {children.length === 0 ? (
            <View style={styles.emptyPatients}>
              <Ionicons name="people-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.emptyPatientsText}>No registered children currently admitted to this center.</Text>
            </View>
          ) : (
            children.map((child) => (
              <TouchableOpacity
                key={child.child_id}
                style={styles.patientRow}
                onPress={() => navigation.navigate('ChildDetail', { childId: child.child_id })}
              >
                <View style={styles.patientMeta}>
                  <Text style={styles.patientName}>{child.name}</Text>
                  <Text style={styles.patientId}>ID: {child.child_id} · {child.gender}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        child.health_status === 'SAM' ? Colors.error + '15' : '#D9770615',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: child.health_status === 'SAM' ? Colors.error : '#D97706' },
                    ]}
                  >
                    {child.health_status}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.sm },
  errorTitle: { ...Typography.h3, color: Colors.textPrimary },
  backBtn: { marginTop: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtnText: { color: Colors.white, ...Typography.caption, fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, elevation: 1 },
  bedHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  badgeIcon: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  bedTextCol: { flex: 1 },
  bedTitle: { ...Typography.h4, color: Colors.textPrimary, fontWeight: '700' },
  bedSubtitle: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  percentBlock: { alignItems: 'flex-end' },
  percentText: { fontSize: 20, fontWeight: '800' },
  percentSub: { fontSize: 9, color: Colors.textMuted, fontWeight: '600' },
  bedProgressTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.md },
  bedProgressFill: { height: '100%', borderRadius: 4 },
  bedStatsGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: Spacing.md },
  bedStatCol: { flex: 1, alignItems: 'center' },
  bedStatVal: { ...Typography.h3, color: Colors.textPrimary, fontWeight: '700' },
  bedStatLbl: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: Spacing.md },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.white, borderRadius: Radius.lg, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border, elevation: 1 },
  actionBtnText: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  sectionHeader: { ...Typography.h4, color: Colors.primary, marginBottom: Spacing.md },
  specificationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
  specIcon: { marginTop: 2 },
  specContent: { flex: 1 },
  specLabel: { ...Typography.caption, color: Colors.textMuted, fontWeight: '600' },
  specValue: { ...Typography.bodySmall, color: Colors.textPrimary, marginTop: 2, lineHeight: 18 },
  emptyPatients: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, gap: Spacing.xs },
  emptyPatientsText: { fontSize: 11, color: Colors.textMuted, textAlign: 'center' },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  patientMeta: { flex: 1 },
  patientName: { ...Typography.label, color: Colors.textPrimary, fontWeight: '700' },
  patientId: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 2 },
  statusBadgeText: { fontSize: 9, fontWeight: '800' },
});
