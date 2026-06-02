import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { parentService } from '../services/parentService';
import { useLanguage } from '../context/LanguageContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  timestamp: string;
  read: boolean;
  childId?: string;
}

const TABS = ['All', 'Followups', 'Alerts', 'NRC Referrals'];

export const NotificationCenterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const dbAlerts = await parentService.getMyAlerts();
      const mapped: Notification[] = dbAlerts.map((a: any) => {
        let type = 'alert';
        if (a.alert_type === 'sam_detected' || a.alert_type === 'mam_detected' || a.alert_type === 'missed_followup') {
          type = 'followup';
        } else if (a.alert_type === 'referral_urgent') {
          type = 'referral';
        }
        
        // Relative or formatted date
        const dateObj = new Date(a.created_at || a.sent_at || Date.now());
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          id: a._id || Math.random().toString(),
          title: a.title || 'Malnutrition Alert',
          body: a.message || '',
          type,
          timestamp: formattedDate,
          read: a.status === 'read', // backend status
          childId: a.data?.child_id
        };
      });
      setNotifications(mapped);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to retrieve recent alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAllRead = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await parentService.markAllAlertsAsRead();
      await fetchAlerts();
      Alert.alert(t('successLabel') || 'Success', t('allNotificationsMarkedRead'));
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to update notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleClearNotifications = () => {
    if (loading) return;
    Alert.alert(
      t('clearNotifications'),
      t('confirmDeleteAllNotifications'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clearAll'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await parentService.clearAllAlerts();
              setNotifications([]);
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to clear notifications');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleToggleRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
      );
      await parentService.markAlertAsRead(id);
    } catch (err) {
      console.error('Failed to mark alert as read in DB:', err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await parentService.deleteAlert(id);
    } catch (err) {
      console.error('Failed to delete alert from DB:', err);
    }
  };

  const handleNotificationPress = async (notif: any) => {
    if (!notif.read) {
      await handleToggleRead(notif.id);
    }
    if (notif.childId) {
      navigation.navigate('ChildDetail', { childId: notif.childId });
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 0) return true;
    if (activeTab === 1) return n.type === 'followup';
    if (activeTab === 2) return n.type === 'alert';
    if (activeTab === 3) return n.type === 'referral';
    return true;
  });

  const getIconName = (type: string) => {
    switch (type) {
      case 'followup':
        return 'calendar-outline';
      case 'alert':
        return 'warning-outline';
      case 'referral':
        return 'business-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'followup':
        return '#7C3AED';
      case 'alert':
        return Colors.error;
      case 'referral':
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar
        title={t('notifications')}
        subtitle={`${notifications.filter((n) => !n.read).length} ${t('unreadNotifications')}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab, idx) => {
          const tabLabel = idx === 0 ? t('all') : idx === 1 ? t('followupsTab') : idx === 2 ? t('alertsTab') : t('nrcReferralsTab');
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === idx && styles.tabActive]}
              onPress={() => setActiveTab(idx)}
            >
              <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>
                {tabLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Actions Panel */}
      {notifications.length > 0 && (
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-done" size={14} color={Colors.primary} />
            <Text style={styles.quickActionText}>{t('markAllRead')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleClearNotifications}>
            <Ionicons name="trash-outline" size={14} color={Colors.error} />
            <Text style={[styles.quickActionText, { color: Colors.error }]}>{t('clearAllAction')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List Container */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.emptyTitle, { marginTop: Spacing.sm }]}>Loading alerts...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={54} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No notifications found in the "{TABS[activeTab]}" filter.</Text>
          </View>
        ) : (
          filtered.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notificationCard, !notif.read && styles.unreadCard]}
              onPress={() => handleNotificationPress(notif)}
              activeOpacity={0.9}
            >
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: getIconColor(notif.type) + '12' },
                ]}
              >
                <Ionicons name={getIconName(notif.type) as any} size={18} color={getIconColor(notif.type)} />
              </View>

              <View style={styles.bodyWrap}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.notifTitle, !notif.read && styles.unreadText]}>
                    {notif.title}
                  </Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifBody} numberOfLines={3}>
                  {notif.body}
                </Text>
                <Text style={styles.notifTime}>{notif.timestamp}</Text>
                {notif.childId && (
                  <View style={styles.actionChip}>
                    <Text style={styles.actionChipText}>View Child Medical Profile</Text>
                    <Ionicons name="arrow-forward" size={10} color={Colors.primary} />
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={() => handleDismiss(notif.id)}
              >
                <Ionicons name="close" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  scroll: { flex: 1 },
  list: { padding: Spacing.md, gap: Spacing.sm },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  unreadCard: {
    borderColor: Colors.success + '20',
    backgroundColor: '#F0FDFA',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  bodyWrap: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  unreadText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  notifBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs - 2,
    lineHeight: 16,
  },
  notifTime: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '0A',
    alignSelf: 'flex-start',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginTop: Spacing.sm,
  },
  actionChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  dismissBtn: {
    alignSelf: 'flex-start',
    padding: 2,
  },
  emptyWrap: {
    flex: 1,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  emptySub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
