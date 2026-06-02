import React, { useState } from 'react';
import { authService } from '../../services/authService';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { Colors } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage, LocaleType } from '../../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const screenHeight = Dimensions.get('window').height;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { t, locale, setLocale } = useLanguage();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleRequestOTP = async () => {
    if (loading) return;
    if (!phone || phone.length !== 10) {
      setError(t('phoneRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.requestOTP(phone);
      setOtpSent(true);
      Alert.alert(
        t('successLabel'),
        t('otpSentSuccess')
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        t('failedSendOtp');

      setError(message);
      Alert.alert(t('errorLabel'), message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (loading) return;
    if (!otp || otp.length !== 6) {
      setError(t('otpRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(phone, otp);
      navigation.replace('MainTabs');
    } catch (err: any) {
      const message = err?.response?.data?.detail || t('invalidOtp');
      setError(message);
      Alert.alert(t('errorLabel'), message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.emblemPlaceholder}>
            <Text style={styles.emblemText}>🏛️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.govTitle}>{t('govCg')}</Text>
            <Text style={styles.deptTitle}>{t('nrcGovPortal')}</Text>
          </View>
          <TouchableOpacity 
            style={styles.langSelectorBtn} 
            onPress={() => setLanguageModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="language-outline" size={14} color={Colors.primary} />
            <Text style={styles.langSelectorText}>{locale.toUpperCase()}</Text>
            <Ionicons name="chevron-down-outline" size={10} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <View style={styles.flagDot} />
          <View style={styles.divider} />
        </View>

        <View style={styles.headingBlock}>
          <Text style={[Typography.h2, { color: Colors.primary }]}>{t('welcome')}</Text>
          <Text style={[Typography.body, { color: Colors.textSecondary, marginTop: 4 }]}>
            {otpSent ? t('enterOtpSub') : t('loginPhoneSub')}
          </Text>
        </View>

        <View style={styles.card}>
          {!otpSent ? (
            <>
              <InputField
                label={t('mobileNumber')}
                icon='call-outline'
                placeholder={t('enterMobilePlaceholder')}
                value={phone}
                onChangeText={setPhone}
                keyboardType='phone-pad'
                maxLength={10}
                editable={!loading}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button label={t('requestOtp')} onPress={handleRequestOTP} loading={loading} style={styles.loginBtn} />
            </>
          ) : (
            <>
              <InputField
                label={t('enterOtp')}
                icon='lock-closed-outline'
                placeholder={t('enterOtpPlaceholder')}
                value={otp}
                onChangeText={setOtp}
                keyboardType='numeric'
                maxLength={6}
                editable={!loading}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button label={t('verifyOtp')} onPress={handleVerifyOTP} loading={loading} style={styles.loginBtn} />
              <TouchableOpacity
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                  setError('');
                }}
              >
                <Text style={[Typography.label, { color: Colors.primaryLight, textAlign: 'center' }]}>{t('backPhoneEntry')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            {t('secureGovPortalText')}
          </Text>
        </View>

        <View style={styles.bottomCard}>
          <Text style={styles.bottomText}>{t('dontHaveAccount')}</Text>
          <Text style={styles.registerLink} onPress={handleRegister}>{t('createAccount')}</Text>
        </View>
      </ScrollView>

      {/* Language picker Modal */}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1 },
  container: { paddingHorizontal: Spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  emblemPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.primary + '30' },
  emblemText: { fontSize: 26 },
  govTitle: { ...Typography.caption, color: Colors.textSecondary, letterSpacing: 0.5 },
  deptTitle: { ...Typography.label, color: Colors.primary, fontWeight: '700' },
  langSelectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 32 },
  langSelectorText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, gap: Spacing.sm },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  flagDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
  headingBlock: { marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4, marginBottom: Spacing.lg },
  errorText: { color: Colors.error || '#FF3B30', marginVertical: Spacing.sm, ...Typography.bodySmall },
  loginBtn: { marginBottom: Spacing.md },
  bottomCard: { marginTop: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.md, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  bottomText: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.xs },
  registerLink: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  securityNote: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.offWhite, borderRadius: Radius.md, padding: Spacing.md },
  securityIcon: { fontSize: 14 },
  securityText: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1 },
  
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  backdropButton: { flex: 1 },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, maxHeight: screenHeight * 0.85, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  dragIndicator: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginBottom: 18 },
  langItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  langItemActive: { backgroundColor: '#F0F9FF', paddingHorizontal: 10, borderRadius: 10 },
  langText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  langTextActive: { color: Colors.primary, fontWeight: '800' },
});
