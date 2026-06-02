import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSync } from '../context/SyncContext';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, queueSize } = useSync();
  const [slideAnim] = useState(new Animated.Value(0));
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  useEffect(() => {
    const show = (!isOnline || isSyncing || queueSize > 0) && !dismissed;
    Animated.timing(slideAnim, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOnline, isSyncing, queueSize, dismissed, slideAnim]);

  if ((isOnline && !isSyncing && queueSize === 0) || dismissed) {
    return null;
  }

  const getStatus = () => {
    if (isSyncing) {
      return {
        title: 'Syncing',
        desc: 'Updating local health records…',
        icon: 'sync',
        bgColor: '#ECFEFF',
        borderColor: '#A5F3FC',
        textColor: '#0891B2',
      };
    }
    if (!isOnline) {
      return {
        title: 'Offline Mode',
        desc: 'Some features may be unavailable.',
        icon: 'warning-outline',
        bgColor: '#FEF2F2',
        borderColor: '#FEE2E2',
        textColor: '#EF4444',
      };
    }
    if (queueSize > 0) {
      return {
        title: 'Pending changes',
        desc: `${queueSize} updates queued for server upload`,
        icon: 'cloud-upload-outline',
        bgColor: '#FFFBEB',
        borderColor: '#FEF3C7',
        textColor: '#D97706',
      };
    }
    return null;
  };

  const status = getStatus();
  if (!status) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], opacity: slideAnim }]}>
      <View style={[styles.banner, { backgroundColor: status.bgColor, borderColor: status.borderColor }]}>
        <Ionicons name={status.icon as any} size={14} color={status.textColor} />
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, { color: status.textColor }]}>⚠ {status.title}</Text>
          <Text style={[styles.descText, { color: status.textColor }]}> — {status.desc}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => setDismissed(true)}>
          <Ionicons name="close" size={15} color={status.textColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 999,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 8,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  titleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  descText: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.9,
  },
  closeBtn: {
    padding: 2,
    marginLeft: 4,
  },
});
