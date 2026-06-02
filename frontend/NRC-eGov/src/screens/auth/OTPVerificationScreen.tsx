import { authService } from '../../services/authService';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { Colors } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { useLanguage } from '../../context/LanguageContext';

type OTPParams = RouteProp<RootStackParamList, 'OTPVerification'>;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTPVerification'>;
  route: OTPParams;
};

export const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [phone, setPhone] = useState(route.params?.phone || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegisterFlow = route.params?.flow === 'register';
  const selectedRole = route.params?.role || 'Parent';

  const handleSendOTP = async () => {
    if (loading) return;
    if (!phone || phone.length !== 10) {
      setError(t('phoneRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      setOtpSent(true);
      Alert.alert(t('otpSentTitle'), t('otpSentMsg'));
    } catch (err: any) {
      setError(err.message || t('failedSendOtp'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (loading) return;
    if (!otp || otp.length !== 6) {
      setError(t('enterOtpCodeError'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyOTP(
        phone,
        otp,
        selectedRole
      );

      if (isRegisterFlow) {
        navigation.replace('FullRegistration', {
          phone,
          role: selectedRole,
        });
      } else {
        navigation.replace('MainTabs');
      }

    } catch (err: any) {
      setError(err.message || t('otpVerificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <Text style={styles.title}>{isRegisterFlow ? t('verifyMobileNum') : t('mobileNumLogin')}</Text>
      <Text style={styles.subtitle}>{isRegisterFlow ? t('enterOtpReg') : t('receiveCodeMobile')}</Text>

      <View style={styles.card}>
        {!otpSent ? (
          <>
            <InputField
              label={t('mobileNumber')}
              icon="call-outline"
              placeholder={t('parentMobilePlaceholder')}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              maxLength={10}
              error={error}
            />
            <Button label={t('sendOtpBtn')} onPress={handleSendOTP} loading={loading} />
          </>
        ) : (
          <>
            <InputField
              label={t('verificationCode')}
              icon="lock-closed-outline"
              placeholder={t('enterOtpPlaceholder')}
              keyboardType="number-pad"
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
              maxLength={6}
              error={error}
            />
            <Button label={isRegisterFlow ? t('verifyContinueBtn') : t('verifyLoginBtn')} onPress={handleVerifyOTP} loading={loading} />
            <Button
              label={t('useDiffNum')}
              variant="outline"
              onPress={() => {
                setOtpSent(false);
                setOtp('');
                setError('');
              }}
              style={styles.secondaryButton}
            />
          </>
        )}
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>{t('secureVerification')}</Text>
        <Text style={styles.noteText}>{t('otpValidityNote')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: Spacing.lg },
  title: { fontSize: 30, fontWeight: '800', color: Colors.primary, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24, elevation: 4 },
  secondaryButton: { marginTop: Spacing.sm },
  noteBox: { marginTop: Spacing.lg, padding: Spacing.lg, backgroundColor: '#F0FDFA', borderRadius: Radius.md, borderWidth: 1, borderColor: '#CCFBF1' },
  noteTitle: { fontSize: 15, fontWeight: '700', color: Colors.success, marginBottom: Spacing.xs },
  noteText: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 20 },
});
