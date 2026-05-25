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
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <Ionicons
              name="chevron-back"
              size={22}
              color={light ? Colors.white : Colors.primary}
            />
          </TouchableOpacity>
        )}
        <View style={styles.titleBlock}>
          <Text style={[Typography.h3, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[Typography.caption, { color: light ? 'rgba(255,255,255,0.75)' : Colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightIcon && (
          <TouchableOpacity style={styles.iconBtn} onPress={onRightPress}>
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
    borderBottomColor: Colors.border,
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
