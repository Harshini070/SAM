import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const mockStateMetrics = {
  statewideSamPercent: 74,
  statewideRecovery: 61,
  avgFundUtilization: 59,
  totalNrcOccupancy: 68,
};

const MetricCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <View style={[styles.metricCard, color ? { borderLeftColor: color, borderLeftWidth: 4 } : {}]}>
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

export const AdminDashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>State Administration Dashboard</Text>
        <Text style={styles.subtitle}>High-level view for policy, funding and statewide performance (mock data).</Text>

        <View style={styles.metricsRow}>
          <MetricCard label="State SAM %" value={`${mockStateMetrics.statewideSamPercent}%`} color={Colors.accent} />
          <MetricCard label="Recovery Avg" value={`${mockStateMetrics.statewideRecovery}%`} color={Colors.success} />
          <MetricCard label="Fund Utilization" value={`${mockStateMetrics.avgFundUtilization}%`} color={Colors.primaryLight} />
          <MetricCard label="NRC Occupancy" value={`${mockStateMetrics.totalNrcOccupancy}%`} color={Colors.warning} />
        </View>

        <View style={[styles.row, isTablet ? {} : { flexDirection: 'column' }]}>
          <View style={styles.leftColumn}>
            <ChartPlaceholder title="Statewide SAM Trend" />
            <ChartPlaceholder title="District Comparison" />
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Top Performing Districts</Text>
              <Text style={styles.cardText}>List of districts with highest coverage and recovery rates (mock).</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fund Allocation Overview</Text>
              <Text style={styles.cardText}>Summary of recent disbursements and utilization across programs.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Governance Alerts</Text>
              <Text style={styles.cardText}>High-priority escalations and policy action items.</Text>
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
});
