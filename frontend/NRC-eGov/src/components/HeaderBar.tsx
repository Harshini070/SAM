import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { Typography } from '../theme/typography';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightBadge?: number;
  style?: ViewStyle;
  light?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  rightIcon,
  onRightPress,
  rightBadge,
  style,
  light = false,
}) => {
  const insets = useSafeAreaInsets();
  const textColor = light ? Colors.white : Colors.textPrimary;
<<<<<<< HEAD
  const buttonBg = light ? 'rgba(255,255,255,0.16)' : 'rgba(10, 25, 49, 0.05)';
=======
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm },
        light && styles.lightBg,
        style,
      ]}
    >
      <StatusBar
        barStyle={light ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.row}>
        {showBack && (
<<<<<<< HEAD
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: buttonBg }]} onPress={onBack}>
=======
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
            <Ionicons
              name="chevron-back"
              size={22}
              color={light ? Colors.white : Colors.primary}
            />
          </TouchableOpacity>
        )}
        <View style={styles.titleBlock}>
<<<<<<< HEAD
          <Text style={[Typography.h3, { color: textColor, fontWeight: '700' }]}>{title}</Text>
          {subtitle && (
            <Text style={[Typography.caption, { color: light ? 'rgba(255,255,255,0.75)' : Colors.textSecondary, fontWeight: '500' }]}>
=======
          <Text style={[Typography.h3, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[Typography.caption, { color: light ? 'rgba(255,255,255,0.75)' : Colors.textSecondary }]}>
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
              {subtitle}
            </Text>
          )}
        </View>
        {rightIcon && (
<<<<<<< HEAD
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: buttonBg }]} onPress={onRightPress}>
=======
          <TouchableOpacity style={styles.iconBtn} onPress={onRightPress}>
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
            <Ionicons
              name={rightIcon}
              size={22}
              color={light ? Colors.white : Colors.primary}
            />
            {rightBadge !== undefined && rightBadge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {rightBadge > 9 ? '9+' : rightBadge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
<<<<<<< HEAD
    borderBottomColor: '#F1F5F9',
=======
    borderBottomColor: Colors.border,
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  },
  lightBg: {
    backgroundColor: Colors.primary,
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,43,91,0.07)',
  },
  titleBlock: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
});
