import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

export const NRCDashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>NRC Staff Dashboard</Text>
        <Text style={styles.subtitle}>Coordinate rehabilitation activities, bed occupancy, and center performance.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Center Capacity</Text>
          <Text style={styles.cardText}>Track current occupancy and discharge targets.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Admissions</Text>
          <Text style={styles.cardText}>Review recent admissions and pending registrations.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Quality</Text>
          <Text style={styles.cardText}>Monitor daily nutrition and caregiving standards.</Text>
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
