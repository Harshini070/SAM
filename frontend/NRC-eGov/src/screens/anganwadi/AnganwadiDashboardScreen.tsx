import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

export const AnganwadiDashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Anganwadi Worker Dashboard</Text>
        <Text style={styles.subtitle}>Manage child nutrition registrations, meal tracking, and local service updates.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Visit Plan</Text>
          <Text style={styles.cardText}>Review scheduled home visits and community outreach tasks.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Growth Monitoring</Text>
          <Text style={styles.cardText}>Track MUAC and weight checks for enrolled children.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Program Messages</Text>
          <Text style={styles.cardText}>Receive official instructions from the district health team.</Text>
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
