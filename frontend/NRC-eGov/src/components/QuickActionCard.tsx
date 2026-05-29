import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';

type QuickActionCardProps = {
  label: string;
  icon: string;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
};

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ label, icon, color = Colors.primary, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.container, style]} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.iconWrap, { backgroundColor: color + '12' }]}> 
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: 84 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: Spacing.xs,
  },
  label: { ...Typography.caption, color: Colors.textPrimary, textAlign: 'center' },
});

export default QuickActionCard;
