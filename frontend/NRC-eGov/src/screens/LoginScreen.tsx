import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
  route: RouteProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check if routed with sessionExpired flag
  useEffect(() => {
    if (route.params && (route.params as any).sessionExpired) {
      setSessionExpired(true);
    }
  }, [route.params]);

  const handlePhoneChange = (text: string) => {
    // Keep only numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhone(cleaned);
    if (cleaned.length > 0 && cleaned.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setOtp(cleaned);
    if (cleaned.length > 0 && cleaned.length !== 4) {
      setOtpError('OTP must be 4 digits');
    } else {
      setOtpError('');
    }
  };

  const handleRequestOTP = async () => {
    if (!phone || phone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setPhoneError('');
    try {
      await authService.requestOTP(phone);
      setOtpSent(true);
      setSessionExpired(false);
      Alert.alert('Security Verification', 'For testing, enter verification code: 1234');
    } catch (err: any) {
      setPhoneError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      setOtpError('Please enter the 4-digit code sent to your phone');
      return;
    }
    setLoading(true);
    setOtpError('');
    try {
      const response = await login(phone, otp);
      if (response && response.success) {
        navigation.replace('MainTabs');
      } else {
        setOtpError(response.error || 'Invalid verification code. Try again.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'Invalid code. Enter 1234 for testing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Government Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.emblemPlaceholder}>
            <Text style={styles.emblemText}>🏛️</Text>
          </View>
          <View>
            <Text style={styles.govTitle}>GOVERNMENT OF CHHATTISGARH</Text>
            <Text style={styles.deptTitle}>NRC e-Governance Portal</Text>
          </View>
        </View>

        {/* Tricolor Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.flagStrip, { backgroundColor: '#FF9933' }]} />
          <View style={[styles.flagStrip, { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }]}>
            <View style={styles.ashokaChakra} />
          </View>
          <View style={[styles.flagStrip, { backgroundColor: '#138808' }]} />
        </View>

        {/* Session Expired Banner */}
        {sessionExpired && (
          <View style={styles.expiredBanner}>
            <Ionicons name="alert-circle" size={18} color={Colors.error} />
            <Text style={styles.expiredText}>Session Expired. Please log in again to continue.</Text>
          </View>
        )}

        {/* Heading */}
        <View style={styles.headingBlock}>
          <Text style={[Typography.h2, { color: Colors.primary }]}>Portal Sign In</Text>
          <Text style={[Typography.body, { color: Colors.textSecondary, marginTop: 4 }]}>
            {otpSent 
              ? `Verification code sent to +91 ${phone.substring(0, 3)}***${phone.substring(7)}` 
              : 'Access the state dashboard using your registered mobile number'}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {!otpSent ? (
            <>
              <InputField
                label="Registered Mobile Number"
                icon="call-outline"
                placeholder="Enter 10-digit number"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
                style={phoneError ? styles.errorBorder : undefined}
              />
              {phoneError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning-outline" size={14} color={Colors.error} />
                  <Text style={styles.errorText}>{phoneError}</Text>
                </View>
              ) : null}

              {loading ? (
                <View style={styles.spinnerWrap}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Securing line & requesting OTP...</Text>
                </View>
              ) : (
                <Button
                  label="Request Security OTP"
                  onPress={handleRequestOTP}
                  style={styles.loginBtn}
                />
              )}
            </>
          ) : (
            <>
              <InputField
                label="Verification Code (OTP)"
                icon="lock-closed-outline"
                placeholder="Enter 4-digit code"
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="numeric"
                maxLength={4}
                editable={!loading}
                style={otpError ? styles.errorBorder : undefined}
              />
              {otpError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="close-circle-outline" size={14} color={Colors.error} />
                  <Text style={styles.errorText}>{otpError}</Text>
                </View>
              ) : null}

              {loading ? (
                <View style={styles.spinnerWrap}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Verifying token details...</Text>
                </View>
              ) : (
                <Button
                  label="Verify & Login"
                  onPress={handleVerifyOTP}
                  style={styles.loginBtn}
                />
              )}

              <Button
                label="Change Mobile Number"
                onPress={() => { setOtpSent(false); setOtp(''); setOtpError(''); }}
                variant="outline"
                style={styles.backBtn}
              />
            </>
          )}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            NIC Encrypted Tunnel: Authorized personnel only. Access logs are monitored by the state IT department.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  container: { paddingHorizontal: Spacing.lg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emblemPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '0A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '20',
  },
  emblemText: { fontSize: 24 },
  govTitle: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1.2 },
  deptTitle: { ...Typography.label, color: Colors.primary, fontWeight: '700', fontSize: 14, marginTop: 1 },
  dividerRow: {
    flexDirection: 'row',
    height: 4,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  flagStrip: {
    flex: 1,
    height: '100%',
  },
  ashokaChakra: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    borderWidth: 0.5,
    borderColor: '#000080',
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  expiredText: {
    ...Typography.bodySmall,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1,
  },
  headingBlock: { marginBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md + 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: Spacing.lg,
  },
  errorBorder: {
    borderColor: Colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  errorText: { color: Colors.error, ...Typography.bodySmall, fontWeight: '500' },
  loginBtn: { marginVertical: Spacing.xs },
  backBtn: { marginTop: Spacing.sm },
  spinnerWrap: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityIcon: { fontSize: 14 },
  securityText: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1, lineHeight: 16 },
});
