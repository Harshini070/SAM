import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync } from '../context/SyncContext';
import { Colors } from '../theme/colors';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, queueSize } = useSync();
  const [slideAnim] = useState(new Animated.Value(0));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!isOnline || isSyncing || queueSize > 0) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isOnline, isSyncing, queueSize, slideAnim]);

  if (isOnline && !isSyncing && queueSize === 0) {
    return null;
  }

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  const getStatus = () => {
    if (isSyncing) {
      return { text: 'Syncing...', icon: 'sync', color: '#0891B2' };
    }
    if (!isOnline) {
      return { text: 'Offline Mode', icon: 'wifi-off-outline', color: Colors.error };
    }
    if (queueSize > 0) {
      return { text: `${queueSize} pending`, icon: 'cloud-upload-outline', color: '#D97706' };
    }
    return { text: 'Online', icon: 'checkmark-circle', color: Colors.success };
  };

  const status = getStatus();

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity style={[styles.indicator, { backgroundColor: status.color + '15', borderColor: status.color }]} onPress={() => setExpanded(!expanded)}>
        <Ionicons name={status.icon as any} size={16} color={status.color} />
        <Text style={[styles.text, { color: status.color }]}>{status.text}</Text>
        {queueSize > 0 && <View style={[styles.badge, { backgroundColor: status.color }]}><Text style={styles.badgeText}>{queueSize}</Text></View>}
      </TouchableOpacity>
      {expanded && queueSize > 0 && (
        <View style={styles.details}>
          <Text style={styles.detailsText}>{queueSize} requests waiting to sync</Text>
          <Text style={styles.detailsSubtext}>They will sync automatically when you're online</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  details: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  detailsSubtext: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
