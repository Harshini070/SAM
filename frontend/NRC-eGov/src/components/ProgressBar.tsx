import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Radius, Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface ProgressBarProps {
  label: string;
  value: number; // 0-100
  amount: string;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  amount,
  color = Colors.primary,
}) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        <Text style={[styles.amount]}>{amount}</Text>
        <Text style={[styles.percent, { color }]}>{value}%</Text>
      </View>
    </View>
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${Math.min(value, 100)}%`, backgroundColor: color },
        ]}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: { ...Typography.label, color: Colors.textPrimary, flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amount: { ...Typography.caption, color: Colors.textSecondary },
  percent: { ...Typography.label, fontWeight: '700' },
  track: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
