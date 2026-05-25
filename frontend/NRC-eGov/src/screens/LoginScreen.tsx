import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.requestOTP(phone);
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent to your phone');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP');
      Alert.alert('Error', err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(phone, otp);
      navigation.navigate('MainTabs');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP');
      Alert.alert('Error', err.response?.data?.detail || 'Invalid OTP');
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
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.emblemPlaceholder}>
            <Text style={styles.emblemText}>🏛️</Text>
          </View>
          <View>
            <Text style={styles.govTitle}>Government of Chhattisgarh</Text>
            <Text style={styles.deptTitle}>NRC e-Governance Portal</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <View style={styles.flagDot} />
          <View style={styles.divider} />
        </View>

        {/* Heading */}
        <View style={styles.headingBlock}>
          <Text style={[Typography.h2, { color: Colors.primary }]}>Welcome!</Text>
          <Text style={[Typography.body, { color: Colors.textSecondary, marginTop: 4 }]}>
            {otpSent ? 'Enter OTP sent to your phone' : 'Login with your phone number'}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {!otpSent ? (
            <>
              <InputField
                label="Mobile Number"
                icon="call-outline"
                placeholder="Enter your 10-digit mobile number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                label="Request OTP"
                onPress={handleRequestOTP}
                loading={loading}
                style={styles.loginBtn}
              />
            </>
          ) : (
            <>
              <InputField
                label="Enter OTP"
                icon="lock-closed-outline"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={4}
                editable={!loading}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                label="Verify OTP"
                onPress={handleVerifyOTP}
                loading={loading}
                style={styles.loginBtn}
              />
              <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); setError(''); }}>
                <Text style={[Typography.label, { color: Colors.primaryLight, textAlign: 'center' }]}>
                  Back to Phone Entry
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            This is a secure government portal. Unauthorized access is prohibited.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.white },
  scroll: { flex: 1 },
  container: { paddingHorizontal: Spacing.lg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  emblemPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  emblemText: { fontSize: 26 },
  govTitle: { ...Typography.caption, color: Colors.textSecondary, letterSpacing: 0.5 },
  deptTitle: { ...Typography.label, color: Colors.primary, fontWeight: '700' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  flagDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.accent,
  },
  headingBlock: { marginBottom: Spacing.lg },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: Spacing.lg,
  },
  errorText: { color: Colors.error || '#FF3B30', marginVertical: Spacing.sm, ...Typography.bodySmall },
  loginBtn: { marginBottom: Spacing.md },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.offWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  securityIcon: { fontSize: 14 },
  securityText: { ...Typography.bodySmall, color: Colors.textSecondary, flex: 1 },
});
