import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Urgent: Follow-up required',
    body: 'Aarav Mandavi (SAM) missed his bi-weekly Anganwadi check-up in Geedam village.',
    type: 'followup',
    timestamp: '2 hours ago',
    read: false,
    childId: 'C-8012',
  },
  {
    id: 'n2',
    title: 'High Occupancy Alert',
    body: 'Bastar Maharani Hospital NRC has exceeded 85% bed occupancy capacity.',
    type: 'alert',
    timestamp: '5 hours ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Referral Request Approved',
    body: 'Aditya Kashyap has been successfully registered at Raipur NRC Center #07.',
    type: 'referral',
    timestamp: '1 day ago',
    read: true,
    childId: 'C-3902',
  },
  {
    id: 'n4',
    title: 'MAM Review Scheduled',
    body: 'Pooja Netam is due for a MUAC assessment review this Friday.',
    type: 'followup',
    timestamp: '2 days ago',
    read: true,
    childId: 'C-4091',
  },
  {
    id: 'n5',
    title: 'Disbursement Complete',
    body: '₹12L fund distribution for nutritional milk packages cleared for Bastar district.',
    type: 'alert',
    timestamp: '3 days ago',
    read: true,
  },
];

const TABS = ['All', 'Followups', 'Alerts', 'NRC Referrals'];

export const NotificationCenterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState(0);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    Alert.alert('Success', 'All notifications marked as read');
  };

  const handleClearNotifications = () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to delete all notification records?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => setNotifications([]) },
      ]
    );
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationPress = (notif: any) => {
    handleToggleRead(notif.id);
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
        title="Notification Center"
        subtitle={`${notifications.filter((n) => !n.read).length} Unread Notifications`}
        showBack
        onBack={() => navigation.goBack()}
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
          >
            <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions Panel */}
      {notifications.length > 0 && (
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleMarkAllRead}>
            <Ionicons name="checkmark-done" size={14} color={Colors.primary} />
            <Text style={styles.quickActionText}>Mark all read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleClearNotifications}>
            <Ionicons name="trash-outline" size={14} color={Colors.error} />
            <Text style={[styles.quickActionText, { color: Colors.error }]}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List Container */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
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
