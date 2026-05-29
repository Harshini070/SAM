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

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [loginType, setLoginType] = useState<'phone' | 'email'>('phone');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('parent');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async () => {
    if (!phone || phone.length !== 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.requestOTP(phone);

      setOtpSent(true);

      Alert.alert(
        'Success',
        'OTP sent successfully'
      );

    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        'Failed to send OTP';

      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(phone, otp);
      navigation.replace('MainTabs');
    } catch (err: any) {
      const message = err?.response?.data?.detail || 'Invalid OTP';
      setError(message);
      Alert.alert('Error', message);
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
          <View>
            <Text style={styles.govTitle}>Government of Chhattisgarh</Text>
            <Text style={styles.deptTitle}>NRC e-Governance Portal</Text>
          </View>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <View style={styles.flagDot} />
          <View style={styles.divider} />
        </View>

        <View style={styles.headingBlock}>
          <Text style={[Typography.h2, { color: Colors.primary }]}>Welcome!</Text>
          <Text style={[Typography.body, { color: Colors.textSecondary, marginTop: 4 }]}>
            {otpSent ? 'Enter OTP sent to your phone' : 'Login with your phone number'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: loginType === 'phone' ? Colors.primary : '#E5E7EB',
              borderRadius: 10,
              marginRight: 5,
            }}
            onPress={() => setLoginType('phone')}
          >
            <Text style={{ textAlign: 'center', color: 'white', fontWeight: '700' }}>
              Mobile Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: loginType === 'email' ? Colors.primary : '#E5E7EB',
              borderRadius: 10,
              marginLeft: 5,
            }}
            onPress={() => setLoginType('email')}
          >
            <Text style={{ textAlign: 'center', color: 'white', fontWeight: '700' }}>
              Email Login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {!otpSent ? (
            <>
              <InputField
                label='Mobile Number'
                icon='call-outline'
                placeholder='Enter your 10-digit mobile number'
                value={phone}
                onChangeText={setPhone}
                keyboardType='phone-pad'
                maxLength={10}
                editable={!loading}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button label='Request OTP' onPress={handleRequestOTP} loading={loading} style={styles.loginBtn} />
            </>
          ) : (
            <>
              <InputField
                label='Enter OTP'
                icon='lock-closed-outline'
                placeholder='Enter 4-digit OTP'
                value={otp}
                onChangeText={setOtp}
                keyboardType='numeric'
                maxLength={6}
                editable={!loading}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button label='Verify OTP' onPress={handleVerifyOTP} loading={loading} style={styles.loginBtn} />
              <TouchableOpacity
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                  setError('');
                }}
              >
                <Text style={[Typography.label, { color: Colors.primaryLight, textAlign: 'center' }]}>Back to Phone Entry</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            This is a secure government portal. Unauthorized access is prohibited.
          </Text>
        </View>

        <View style={styles.bottomCard}>
          <Text style={styles.bottomText}>Don't have an account?</Text>
          <Text style={styles.registerLink} onPress={handleRegister}>Create Account</Text>
        </View>
      </ScrollView>
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
});
