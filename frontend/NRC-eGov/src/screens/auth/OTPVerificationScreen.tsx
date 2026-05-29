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

type OTPParams = RouteProp<RootStackParamList, 'OTPVerification'>;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTPVerification'>;
  route: OTPParams;
};

export const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState(route.params?.phone || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegisterFlow = route.params?.flow === 'register';
  const selectedRole = route.params?.role || 'Parent';

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Your verification code has been sent.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Enter the 4-digit OTP');
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
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <Text style={styles.title}>{isRegisterFlow ? 'Verify Mobile Number' : 'Mobile Number Login'}</Text>
      <Text style={styles.subtitle}>{isRegisterFlow ? 'Enter OTP to continue registration' : 'Receive a one-time code on your mobile'}</Text>

      <View style={styles.card}>
        {!otpSent ? (
          <>
            <InputField
              label="Mobile Number"
              icon="call-outline"
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              maxLength={10}
              error={error}
            />
            <Button label="Send OTP" onPress={handleSendOTP} loading={loading} />
          </>
        ) : (
          <>
            <InputField
              label="Verification Code"
              icon="lock-closed-outline"
              placeholder="Enter 4-digit OTP"
              keyboardType="number-pad"
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
              maxLength={4}
              error={error}
            />
            <Button label={isRegisterFlow ? 'Verify & Continue' : 'Verify & Login'} onPress={handleVerifyOTP} loading={loading} />
            <Button
              label="Use different number"
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
        <Text style={styles.noteTitle}>Secure verification</Text>
        <Text style={styles.noteText}>OTP is valid only for a short time and is used to protect your account with a trusted government login experience.</Text>
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
