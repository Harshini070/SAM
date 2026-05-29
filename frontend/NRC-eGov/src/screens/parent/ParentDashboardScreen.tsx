import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/Card';
import { Colors } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

export const ParentDashboardScreen: React.FC = () => {
  const onPress = (label: string) => Alert.alert(label, 'This is a placeholder action');

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Parent Dashboard</Text>
        <Text style={styles.subtitle}>Easy care updates and reminders for your child.</Text>

        <TouchableOpacity style={styles.bigCard} activeOpacity={0.9} onPress={() => onPress('Child Growth')}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardTitle}>Child Growth</Text>
              <Text style={styles.cardText}>Latest weight: 8.5 kg · MUAC: 125 mm</Text>
            </View>
            <Ionicons name="bar-chart-outline" size={28} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bigCard} activeOpacity={0.9} onPress={() => onPress('Vaccination Reminder')}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardTitle}>Vaccination Reminder</Text>
              <Text style={styles.cardText}>Next: DPT dose in 10 days</Text>
            </View>
            <Ionicons name="medkit-outline" size={28} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bigCard} activeOpacity={0.9} onPress={() => onPress('Nutrition Advice')}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardTitle}>Nutrition Advice</Text>
              <Text style={styles.cardText}>Simple meal tips for age 6-24 months</Text>
            </View>
            <Ionicons name="nutrition-outline" size={28} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bigCard} activeOpacity={0.9} onPress={() => onPress('Upcoming Appointment')}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardTitle}>Upcoming Appointment</Text>
              <Text style={styles.cardText}>12 Jun 2026 · NRC Center</Text>
            </View>
            <Ionicons name="calendar-outline" size={28} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        <Card style={styles.alertCard}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.alertTitle}>Emergency Alerts</Text>
              <Text style={styles.cardText}>No active emergencies</Text>
            </View>
            <Ionicons name="alert-circle-outline" size={24} color={Colors.error} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  title: { ...Typography.h2, color: Colors.primary, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.sm },
  bigCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { ...Typography.h3, color: Colors.primary, marginBottom: Spacing.xs },
  cardText: { ...Typography.body, color: Colors.textSecondary },
  alertCard: { padding: Spacing.md },
  alertTitle: { ...Typography.h3, color: Colors.error },
});
