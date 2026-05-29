import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';

type StatCardProps = {
  label: string;
  value: string | number;
  color?: string;
  icon?: string;
  style?: ViewStyle;
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, color = Colors.primary, icon, style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <View>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        {icon ? <Ionicons name={icon as any} size={28} color={color} /> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minWidth: 140,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { ...Typography.h2, fontWeight: '800' },
  label: { ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing.xs },
});

export default StatCard;
