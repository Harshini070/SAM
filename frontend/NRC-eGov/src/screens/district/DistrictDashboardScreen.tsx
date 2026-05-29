import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const mockMetrics = {
  districtSamPercent: 78,
  recoveryRate: 64,
  fundUtilizationPercent: 52,
  nrcOccupancyPercent: 71,
};

const hotspots = [
  { name: 'Ward 12 - North', cases: 18 },
  { name: 'Village A', cases: 12 },
  { name: 'Sector 5', cases: 9 },
];

const MetricCard: React.FC<{ label: string; value: string | number; accent?: string }> = ({ label, value, accent }) => (
  <View style={[styles.metricCard, accent ? { borderLeftColor: accent, borderLeftWidth: 4 } : {}]}>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const ChartPlaceholder: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.chartBox}>
      <Text style={styles.chartPlaceholder}>Chart placeholder</Text>
    </View>
  </View>
);

export const DistrictDashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>District Dashboard</Text>
        <Text style={styles.subtitle}>District SAM coverage, recovery and resource analytics (mock data).</Text>

        <View style={styles.metricsRow}>
          <MetricCard label="District SAM %" value={`${mockMetrics.districtSamPercent}%`} accent={Colors.accent} />
          <MetricCard label="Recovery Rate" value={`${mockMetrics.recoveryRate}%`} accent={Colors.success} />
          <MetricCard label="Fund Utilization" value={`${mockMetrics.fundUtilizationPercent}%`} accent={Colors.primaryLight} />
          <MetricCard label="NRC Occupancy" value={`${mockMetrics.nrcOccupancyPercent}%`} accent={Colors.warning} />
        </View>

        <View style={[styles.row, isTablet ? {} : { flexDirection: 'column' }]}>
          <View style={styles.leftColumn}>
            <ChartPlaceholder title="SAM Trend (Last 6 months)" />
            <ChartPlaceholder title="Admissions vs Discharges" />
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Hotspot Areas</Text>
              {hotspots.map((h, i) => (
                <View key={i} style={styles.hotspotRow}>
                  <Text style={styles.hotspotName}>{h.name}</Text>
                  <Text style={styles.hotspotCases}>{h.cases} cases</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fund Utilization Details</Text>
              <Text style={styles.cardText}>Mock breakdown of program funds and spend categories.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Operational Notes</Text>
              <Text style={styles.cardText}>Recent coordination items and pending district actions.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  title: { ...Typography.h2, color: Colors.primary, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, marginBottom: Spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  cardText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, flexWrap: 'wrap' },
  metricCard: { flex: 1, minWidth: 140, backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  metricValue: { ...Typography.h3, color: Colors.primary },
  metricLabel: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.lg },
  leftColumn: { flex: 2 },
  rightColumn: { flex: 1 },
  chartContainer: { marginBottom: Spacing.lg },
  chartTitle: { ...Typography.h4, color: Colors.textPrimary, marginBottom: Spacing.sm },
  chartBox: { height: 160, borderRadius: Radius.md, backgroundColor: Colors.offWhite, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  chartPlaceholder: { color: Colors.textMuted },
  hotspotRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  hotspotName: { ...Typography.body, color: Colors.textPrimary },
  hotspotCases: { ...Typography.bodySmall, color: Colors.error },
});
