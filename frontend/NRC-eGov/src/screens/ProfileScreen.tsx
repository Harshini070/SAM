import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Switch,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { HeaderBar } from '../components/HeaderBar';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { AuthContext } from '../context/AuthContext';
import { parentService } from '../services/parentService';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage, LocaleType } from '../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISTRICTS = ['Raipur', 'Durg', 'Bastar', 'Bilaspur', 'Rajnandgaon'];
const { height: screenHeight } = Dimensions.get('window');

export const ProfileScreen: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t, locale, setLocale } = useLanguage();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editDistrict, setEditDistrict] = useState(user?.district || '');
  const [updating, setUpdating] = useState(false);

  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  // Preference states
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [followupReminders, setFollowupReminders] = useState(true);
  const [helplineUpdates, setHelplineUpdates] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditDistrict(user.district || '');
    }
  }, [user]);

  useEffect(() => {
    const loadPersistedPreferences = async () => {
      try {
        const biom = await AsyncStorage.getItem('biometricsEnabled');
        if (biom !== null) setBiometricsEnabled(biom === 'true');
        
        const crit = await AsyncStorage.getItem('criticalAlerts');
        if (crit !== null) setCriticalAlerts(crit === 'true');
        
        const follow = await AsyncStorage.getItem('followupReminders');
        if (follow !== null) setFollowupReminders(follow === 'true');
        
        const help = await AsyncStorage.getItem('helplineUpdates');
        if (help !== null) setHelplineUpdates(help === 'true');
      } catch (e) {
        console.warn('Failed to load preferences:', e);
      }
    };
    loadPersistedPreferences();
  }, []);

  const handleToggleBiometrics = async (val: boolean) => {
    setBiometricsEnabled(val);
    try {
      await AsyncStorage.setItem('biometricsEnabled', String(val));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleToggleCritical = async (val: boolean) => {
    setCriticalAlerts(val);
    try {
      await AsyncStorage.setItem('criticalAlerts', String(val));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleToggleFollowup = async (val: boolean) => {
    setFollowupReminders(val);
    try {
      await AsyncStorage.setItem('followupReminders', String(val));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleToggleHelpline = async (val: boolean) => {
    setHelplineUpdates(val);
    try {
      await AsyncStorage.setItem('helplineUpdates', String(val));
    } catch (e) {
      console.warn(e);
    }
  };

  const getLangLabel = (code: LocaleType) => {
    if (code === 'hi') return 'Hindi (हिंदी)';
    if (code === 'cg') return 'Chhattisgarhi (छत्तीसगढ़ी)';
    return 'English (EN)';
  };

  const handleLogout = () => {
    Alert.alert(t('confirmLogout'), t('logoutMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await auth?.logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Splash' }],
          });
        },
      },
    ]);
  };

  const handleMenuPress = (rawLabel: string) => {
    if (rawLabel === 'Edit Profile Details' || rawLabel === 'Registered District') {
      setEditName(user?.name || '');
      setEditDistrict(user?.district || '');
      setEditModalVisible(true);
    } else if (rawLabel === 'Security & Password') {
      setSecurityModalVisible(true);
    } else if (rawLabel === 'Notification Settings') {
      setNotificationModalVisible(true);
    } else if (rawLabel === 'Language Selector') {
      setLanguageModalVisible(true);
    } else if (rawLabel === 'Support & Helpline') {
      setSupportModalVisible(true);
    } else if (rawLabel === 'Terms & Privacy Policy') {
      setTermsModalVisible(true);
    }
  };

  const handleSaveProfile = async () => {
    if (updating) return;
    if (!editName.trim()) {
      Alert.alert(t('errorLabel'), t('nameRequiredCaregiver'));
      return;
    }
    try {
      setUpdating(true);
      await parentService.updateProfile(editName, editDistrict);
      await auth?.refreshUser();
      setEditModalVisible(false);
      Alert.alert(t('successLabel'), t('profileUpdated'));
    } catch (err: any) {
      Alert.alert(t('errorLabel'), err.message || t('failedUpdate'));
    } finally {
      setUpdating(false);
    }
  };

  const MENU_SECTIONS = [
    {
      title: t('accountSettings'),
      items: [
        { label: t('editProfile'), icon: 'person-outline', value: user?.phone, rawLabel: 'Edit Profile Details' },
        { label: t('regDistrict'), icon: 'location-outline', value: user?.district ? t(user.district.toLowerCase()) : t('notAssigned'), rawLabel: 'Registered District' },
        { label: t('securityPassword'), icon: 'shield-checkmark-outline', rawLabel: 'Security & Password' },
      ],
    },
    {
      title: t('preferencesHelp'),
      items: [
        { label: t('notifSettings'), icon: 'notifications-outline', rawLabel: 'Notification Settings' },
        { label: t('langSelector'), icon: 'language-outline', value: getLangLabel(locale), rawLabel: 'Language Selector' },
        { label: t('supportHelpline'), icon: 'help-circle-outline', rawLabel: 'Support & Helpline' },
        { label: t('termsPrivacy'), icon: 'document-text-outline', rawLabel: 'Terms & Privacy Policy' },
      ],
    },
  ];

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar title={t('myProfile')} subtitle={user?.role?.toUpperCase()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Modern Caregiver Info Header Card */}
        <View style={styles.userCard}>
          <LinearGradient
            colors={['#0A1931', '#15305B']}
            style={styles.userCardBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>
                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
              </Text>
              <View style={styles.activeIndicator} />
            </View>
            <Text style={styles.userName}>{user?.name || 'Caregiver User'}</Text>
            <Text style={styles.userPhone}>📞 +91 {user?.phone || '—'}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <Ionicons name="shield-checkmark" size={10} color="#D1FAE5" />
                <Text style={styles.statusPillText}>{t('verifiedAccount')}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Setting Groups */}
        {MENU_SECTIONS.map((sec) => (
          <View key={sec.title} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <View style={styles.menuCard}>
              {sec.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, idx < sec.items.length - 1 && styles.borderBottom]}
                  onPress={() => handleMenuPress(item.rawLabel)}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIconCircle}>
                      <Ionicons name={item.icon as any} size={15} color={Colors.primary} />
                    </View>
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

        {/* Edit Modal (Styled as Bottom Sheet) */}
        <Modal visible={editModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity style={styles.backdropButton} onPress={() => setEditModalVisible(false)} />
            <View style={styles.modalContent}>
              <View style={styles.dragIndicator} />
              <Text style={styles.modalTitle}>{t('editProfile')}</Text>

              <InputField
                label={t('nameLabel')}
                icon="person-outline"
                placeholder={t('enterName')}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.pickerLabel}>{t('regDistrict')}</Text>
              <View style={styles.districtGrid}>
                {DISTRICTS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.districtBtn, editDistrict === d && styles.districtBtnActive]}
                    onPress={() => setEditDistrict(d)}
                  >
                    <Text style={[styles.districtBtnText, editDistrict === d && styles.districtBtnTextActive]}>
                      {t(d.toLowerCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  label={t('cancel')}
                  variant="outline"
                  onPress={() => setEditModalVisible(false)}
                  style={styles.modalBtn}
                  disabled={updating}
                />
                <Button
                  label={updating ? t('saving') : t('saveChanges')}
                  onPress={handleSaveProfile}
                  style={styles.modalBtn}
                  loading={updating}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Security Modal (Styled as Bottom Sheet) */}
        <Modal visible={securityModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity style={styles.backdropButton} onPress={() => setSecurityModalVisible(false)} />
            <View style={styles.modalContent}>
              <View style={styles.dragIndicator} />
              <Text style={styles.modalTitle}>{t('securityAccess')}</Text>

              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={30} color={Colors.success} />
                <Text style={styles.securityTitle}>{t('secureOtpActive')}</Text>
                <Text style={styles.securitySub}>
                  {t('secureOtpDesc')}{user?.phone}.
                </Text>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingTextWrap}>
                  <Text style={styles.settingTitle}>{t('biometrics')}</Text>
                  <Text style={styles.settingDesc}>{t('biometricsDesc')}</Text>
                </View>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={handleToggleBiometrics}
                  trackColor={{ false: '#CBD5E1', true: Colors.primaryLight }}
                  thumbColor={biometricsEnabled ? Colors.primary : '#F8FAFC'}
                />
              </View>

              <View style={styles.sessionBox}>
                <Text style={styles.sessionTitle}>{t('activeSession')}</Text>
                <View style={styles.sessionItem}>
                  <Ionicons name="phone-portrait-outline" size={15} color={Colors.primary} />
                  <Text style={styles.sessionText}>{t('activeDeviceAccess')}</Text>
                </View>
              </View>

              <Button label={t('closeSecurity')} onPress={() => setSecurityModalVisible(false)} style={{ marginTop: 24 }} />
            </View>
          </View>
        </Modal>

        {/* Notification Modal (Styled as Bottom Sheet) */}
        <Modal visible={notificationModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity style={styles.backdropButton} onPress={() => setNotificationModalVisible(false)} />
            <View style={styles.modalContent}>
              <View style={styles.dragIndicator} />
              <Text style={styles.modalTitle}>{t('notifPreferences')}</Text>

              <View style={styles.settingRow}>
                <View style={styles.settingTextWrap}>
                  <Text style={styles.settingTitle}>{t('criticalAlertsOpt')}</Text>
                  <Text style={styles.settingDesc}>{t('criticalAlertsDesc')}</Text>
                </View>
                <Switch
                  value={criticalAlerts}
                  onValueChange={handleToggleCritical}
                  trackColor={{ false: '#CBD5E1', true: Colors.primaryLight }}
                  thumbColor={criticalAlerts ? Colors.primary : '#F8FAFC'}
                />
              </View>

              <View style={[styles.settingRow, { marginTop: 14 }]}>
                <View style={styles.settingTextWrap}>
                  <Text style={styles.settingTitle}>{t('followupRemindersOpt')}</Text>
                  <Text style={styles.settingDesc}>{t('followupRemindersDesc')}</Text>
                </View>
                <Switch
                  value={followupReminders}
                  onValueChange={handleToggleFollowup}
                  trackColor={{ false: '#CBD5E1', true: Colors.primaryLight }}
                  thumbColor={followupReminders ? Colors.primary : '#F8FAFC'}
                />
              </View>

              <View style={[styles.settingRow, { marginTop: 14 }]}>
                <View style={styles.settingTextWrap}>
                  <Text style={styles.settingTitle}>{t('helplineUpdatesOpt')}</Text>
                  <Text style={styles.settingDesc}>{t('helplineUpdatesDesc')}</Text>
                </View>
                <Switch
                  value={helplineUpdates}
                  onValueChange={handleToggleHelpline}
                  trackColor={{ false: '#CBD5E1', true: Colors.primaryLight }}
                  thumbColor={helplineUpdates ? Colors.primary : '#F8FAFC'}
                />
              </View>

              <Button
                label={t('saveNotifSettings')}
                onPress={() => {
                  setNotificationModalVisible(false);
                  Alert.alert(t('preferencesSaved'), t('notifPreferencesUpdated'));
                }}
                style={{ marginTop: 24 }}
              />
            </View>
          </View>
        </Modal>

        {/* Language Modal (Styled as Bottom Sheet) */}
        <Modal visible={languageModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity style={styles.backdropButton} onPress={() => setLanguageModalVisible(false)} />
            <View style={styles.modalContent}>
              <View style={styles.dragIndicator} />
              <Text style={styles.modalTitle}>{t('langSelector')}</Text>

              {[
                { code: 'en', label: 'English (EN)' },
                { code: 'hi', label: 'Hindi (हिंदी)' },
                { code: 'cg', label: 'Chhattisgarhi (छत्तीसगढ़ी)' }
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langItem, locale === lang.code && styles.langItemActive]}
                  onPress={() => setLocale(lang.code as LocaleType)}
                >
                  <Text style={[styles.langText, locale === lang.code && styles.langTextActive]}>
                    {lang.label}
                  </Text>
                  {locale === lang.code && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
                </TouchableOpacity>
              ))}

              <Button
                label={t('applyLanguageBtn')}
                onPress={() => {
                  setLanguageModalVisible(false);
                }}
                style={{ marginTop: 24 }}
              />
            </View>
          </View>
        </Modal>

        {/* Support Modal (Styled as Bottom Sheet) */}
        <Modal visible={supportModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity style={styles.backdropButton} onPress={() => setSupportModalVisible(false)} />
            <View style={styles.modalContent}>
              <View style={styles.dragIndicator} />
              <Text style={styles.modalTitle}>{t('supportHelpline')}</Text>
              <Text style={styles.supportIntro}>
                {t('supportIntro')}
              </Text>

              {[
                { name: t('stateWcd'), phone: '181', desc: t('stateWcdDesc') },
                { name: t('emergencyHealth'), phone: '104', desc: t('emergencyHealthDesc') },
                { name: t('mitaninSupportLine'), phone: '108', desc: t('mitaninSupportLineDesc') },
              ].map((helpline) => (
                <View key={helpline.phone} style={styles.supportCard}>
                  <View style={styles.supportCardLeft}>
                    <Text style={styles.supportName}>{helpline.name}</Text>
                    <Text style={styles.supportDesc}>{helpline.desc}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dialBtn}
                    onPress={() => {
                      Linking.openURL(`tel:${helpline.phone}`).catch(() => {
                        Alert.alert('Dialing Support', `Dialing support phone: ${helpline.phone}`);
                      });
                    }}
                  >
                    <Ionicons name="call" size={10} color={Colors.white} />
                    <Text style={styles.dialBtnText}>{t('callBtn')} {helpline.phone}</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <Button
                label={t('cancel')}
                variant="outline"
                onPress={() => setSupportModalVisible(false)}
                style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </Modal>

        {/* Terms Modal (Styled as Bottom Sheet) */}
        <Modal visible={termsModalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <TouchableOpacity style={styles.backdropButton} onPress={() => setTermsModalVisible(false)} />
            <View style={styles.modalContent}>
              <View style={styles.dragIndicator} />
              <Text style={styles.modalTitle}>{t('termsPrivacy')}</Text>

              <ScrollView style={{ maxHeight: 220, marginBottom: 16 }} showsVerticalScrollIndicator={true}>
                <Text style={styles.termsSectionTitle}>{t('termsScopeTitle')}</Text>
                <Text style={styles.termsText}>
                  {t('termsScopeText')}
                </Text>

                <Text style={[styles.termsSectionTitle, { marginTop: 10 }]}>{t('termsPrivacyTitle')}</Text>
                <Text style={styles.termsText}>
                  {t('termsPrivacyText')}
                </Text>

                <Text style={[styles.termsSectionTitle, { marginTop: 10 }]}>{t('termsSecurityTitle')}</Text>
                <Text style={styles.termsText}>
                  {t('termsSecurityText')}
                </Text>
              </ScrollView>

              <Button label={t('acceptUnderstand')} onPress={() => setTermsModalVisible(false)} />
            </View>
          </View>
        </Modal>

        {/* Logout Control Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>{t('logoutBtnText')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          {t('appVersionText')}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 14 },

  // Caregiver user header card
  userCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  userCardBg: {
    padding: 20,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: Colors.white },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#15305B',
  },
  userName: { fontSize: 18, fontWeight: '800', color: Colors.white, letterSpacing: 0.1 },
  userPhone: { fontSize: 11, color: 'rgba(255, 255, 255, 0.75)', marginTop: 4, fontWeight: '600' },
  statusRow: { marginTop: 10 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: { fontSize: 9, color: Colors.white, fontWeight: '700' },

  // Settings Items
  sectionWrap: { gap: 6 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(15, 23, 42, 0.03)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  // Bottom Sheet Modal Backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  backdropButton: { flex: 1 },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    maxHeight: screenHeight * 0.85,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginBottom: 18 },

  // Custom Form controls for Edit details sheet
  pickerLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, marginTop: 10 },
  districtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  districtBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  districtBtnActive: { borderColor: Colors.primary, backgroundColor: '#EFF6FF' },
  districtBtnText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },
  districtBtnTextActive: { color: Colors.primary, fontWeight: '800' },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1 },

  // Custom Preferences sheets styles
  securityBadge: { alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  securityTitle: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary, marginTop: 8 },
  securitySub: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, textAlign: 'center', lineHeight: 16, fontWeight: '500' },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  settingTextWrap: { flex: 1, paddingRight: 16 },
  settingTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  settingDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  sessionBox: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 14 },
  sessionTitle: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, marginBottom: 8, textTransform: 'uppercase' },
  sessionItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sessionText: { fontSize: 11, color: Colors.textPrimary, fontWeight: '600' },

  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  langItemActive: { backgroundColor: '#F0F9FF', paddingHorizontal: 10, borderRadius: 10 },
  langText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  langTextActive: { color: Colors.primary, fontWeight: '800' },

  supportIntro: { fontSize: 12, color: Colors.textSecondary, marginBottom: 14, lineHeight: 18, fontWeight: '500' },
  supportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  supportCardLeft: { flex: 1, paddingRight: 8, gap: 2 },
  supportName: { fontSize: 12, fontWeight: '800', color: Colors.textPrimary },
  supportDesc: { fontSize: 10, color: Colors.textSecondary, lineHeight: 14 },
  dialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dialBtnText: { color: Colors.white, fontSize: 9, fontWeight: '700' },

  termsSectionTitle: { fontSize: 11, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase' },
  termsText: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, lineHeight: 16, fontWeight: '500' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    shadowColor: 'rgba(239, 68, 68, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
    marginTop: 6,
  },
  logoutText: { fontSize: 13, fontWeight: '800', color: Colors.error },
  versionText: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
