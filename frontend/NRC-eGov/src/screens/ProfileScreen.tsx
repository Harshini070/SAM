import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out of the NRC e-Governance portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Splash' }],
          });
        },
      },
    ]);
  };

  const MENU_SECTIONS = [
    {
      title: 'Account Settings',
      items: [
        { label: 'Edit Profile Details', icon: 'person-outline', value: 'Chhattisgarh Admin' },
        { label: 'Registered District', icon: 'location-outline', value: 'All Districts' },
        { label: 'Security & Password', icon: 'shield-checkmark-outline' },
      ],
    },
    {
      title: 'Preferences & Help',
      items: [
        { label: 'Notification Settings', icon: 'notifications-outline' },
        { label: 'Language Selector', icon: 'language-outline', value: 'English (EN)' },
        { label: 'Support & Helpline', icon: 'help-circle-outline' },
        { label: 'Terms & Privacy Policy', icon: 'document-text-outline' },
      ],
    },
  ];

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar title="User Profile" subtitle="NRC Administration Panel" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>SA</Text>
            <View style={styles.activeIndicator} />
          </View>
          <Text style={styles.userName}>State Administrator</Text>
          <Text style={styles.userRole}>Super Admin · Women & Child Development</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Verified Portal Officer</Text>
            </View>
          </View>
        </View>

        {/* Sections */}
        {MENU_SECTIONS.map((sec) => (
          <View key={sec.title} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <View style={styles.menuCard}>
              {sec.items.map((item, idx) => (
                <TouchableOpacity key={item.label} style={[styles.menuItem, idx < sec.items.length - 1 && styles.borderBottom]}>
                  <View style={styles.menuLeft}>
                    <Ionicons name={item.icon as any} size={18} color={Colors.primary} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuRight}>
                    {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                    <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Action Buttons */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Logout from Portal</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>App Version 1.0.0 (Expo SDK 54) · NIC Chhattisgarh</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#EEF2F7' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  userCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: 'rgba(0,43,91,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2, marginBottom: 16 },
  avatarWrap: { width: 68, height: 68, borderRadius: 34, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: '800', color: Colors.white },
  activeIndicator: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  userName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  userRole: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  statusRow: { marginTop: 10 },
  statusPill: { backgroundColor: Colors.primary + '12', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  sectionWrap: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 },
  menuCard: { backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, shadowColor: 'rgba(0,43,91,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuValue: { fontSize: 12, color: Colors.textSecondary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 14, shadowColor: 'rgba(0,43,91,0.08)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: 'rgba(229,57,53,0.15)', marginTop: 8 },
  logoutText: { fontSize: 13, fontWeight: '700', color: Colors.error },
  versionText: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 24 },
});
