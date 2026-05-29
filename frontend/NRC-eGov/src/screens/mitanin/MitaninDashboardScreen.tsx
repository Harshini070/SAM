import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, StatCard } from '../../components/Card';
import { Colors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

const stats = [
  { label: "Today's Visits", value: 12, icon: 'walk-outline', color: '#0A1931' },
  { label: 'High Risk Children', value: 4, icon: 'pulse-outline', color: '#E11D48' },
  { label: 'Pending Followups', value: 7, icon: 'timer-outline', color: '#F59E0B' },
  { label: 'Registered Children', value: 238, icon: 'people-outline', color: '#0F766E' },
];

const actions = [
  { label: 'Register Child', icon: 'person-add-outline', color: Colors.primary },
  { label: 'Scan Child', icon: 'scan-outline', color: Colors.accent },
  { label: 'View Alerts', icon: 'notifications-outline', color: Colors.error },
  { label: 'Followups', icon: 'clipboard-outline', color: Colors.success },
];

const recentChildren = [
  { name: 'Saanvi Patel', risk: 'High Risk', lastCheck: '2 days ago' },
  { name: 'Aarav Sharma', risk: 'Moderate Risk', lastCheck: '4 days ago' },
  { name: 'Meera Singh', risk: 'Low Risk', lastCheck: '6 days ago' },
];

const formatDate = () => {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const MitaninDashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}> 
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Welcome back, Mitanin</Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionRow}>
          {stats.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              color={item.color}
              icon={<Ionicons name={item.icon as any} size={22} color={item.color} />}
              style={styles.statCard}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Complete field tasks with one tap</Text>
        </View>

        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <TouchableOpacity key={action.label} style={styles.actionButton} activeOpacity={0.84}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + '16' }]}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Children</Text>
          <Text style={styles.sectionSubtitle}>Latest risk reviews and checkup dates</Text>
        </View>

        <Card style={styles.recentCard}>
          {recentChildren.map((child) => (
            <View key={child.name} style={styles.childRow}>
              <View>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childMeta}>{child.lastCheck}</Text>
              </View>
              <View style={[styles.riskPill, child.risk === 'High Risk' ? styles.highRisk : child.risk === 'Moderate Risk' ? styles.mediumRisk : styles.lowRisk]}>
                <Text style={styles.riskLabel}>{child.risk}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  headerText: { flex: 1, paddingRight: Spacing.sm },
  greeting: { ...Typography.h2, color: Colors.primary, marginBottom: Spacing.xs },
  date: { ...Typography.body, color: Colors.textSecondary },
  notificationButton: { width: 52, height: 52, borderRadius: Radius.full, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  notificationDot: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.error },
  sectionRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Spacing.xs },
  statCard: { minWidth: '47%', margin: Spacing.xs },
  sectionHeader: { marginTop: Spacing.sm },
  sectionTitle: { ...Typography.h3, color: Colors.primary, marginBottom: Spacing.xs },
  sectionSubtitle: { ...Typography.bodySmall, color: Colors.textSecondary },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: Spacing.sm },
  actionButton: { width: '48%', backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start', justifyContent: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: Spacing.sm },
  actionIcon: { width: 44, height: 44, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  actionLabel: { ...Typography.body, color: Colors.textPrimary, fontWeight: '700' },
  recentCard: { paddingVertical: 0, paddingHorizontal: 0 },
  childRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  childName: { ...Typography.body, color: Colors.textPrimary, fontWeight: '700' },
  childMeta: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
  riskPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.full },
  riskLabel: { ...Typography.caption, color: Colors.white, fontWeight: '700' },
  highRisk: { backgroundColor: Colors.error },
  mediumRisk: { backgroundColor: Colors.warning },
  lowRisk: { backgroundColor: Colors.success },
});
