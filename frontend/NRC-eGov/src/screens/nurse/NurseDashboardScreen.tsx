import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

export const NurseDashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nurse / ANM Dashboard</Text>
        <Text style={styles.subtitle}>Monitor clinical referrals, immunization follow-up, and facility readiness.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Referral Queue</Text>
          <Text style={styles.cardText}>Review children referred for advanced care and follow-up actions.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Facility Status</Text>
          <Text style={styles.cardText}>See stock levels, staffing updates, and service availability.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Resources</Text>
          <Text style={styles.cardText}>Access standard treatment guidelines and reporting tools.</Text>
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
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xs },
  cardText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
});
