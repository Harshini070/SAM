import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
<<<<<<< HEAD
=======
  TouchableOpacity,
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
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
<<<<<<< HEAD
import { useWindowDimensions } from 'react-native';
import { AuthToggle } from '../components/AuthToggle';
import { AuthLeftPanel } from '../components/AuthLeftPannel';
=======
import { authService } from '../services/authService';
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
<<<<<<< HEAD
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
  const [authMode, setAuthMode] = useState<'mobile' | 'email'>('mobile');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordLogin = () => {
    if (
      !identifier.trim() ||
      (authMode === 'email' && !password.trim())
    ) {
      setError(
        authMode === 'mobile'
          ? 'Mobile number is required.'
          : 'Email and password are required.'
      );
      return;
    }
    setError('');
    login?.(identifier, password);
    navigation.replace('MainTabs');
  };

  const handleOTPLogin = () => {
    navigation.navigate('OTPVerification', { flow: 'login' });
  };

  const handleRegister = () => {
    navigation.navigate('Register');
=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  };

  return (
    <KeyboardAvoidingView
<<<<<<< HEAD
      style={styles.screen}
      keyboardVerticalOffset={20}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { flexGrow: 1 },
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        <View
          style={[
            styles.authWrapper,
            isDesktop && styles.authWrapperDesktop,
          ]}
        >
          {isDesktop && (
            <View style={styles.leftPanel}>
              <AuthLeftPanel />
            </View>
          )}

          <View style={[
            styles.rightPanel,
            !isDesktop && styles.mobileRightPanel,
          ]}
          >
            <Text style={styles.pageTitle}>Welcome Back!</Text>

            <Text style={styles.pageSubtitle}>
              Sign in to continue your NRC workflow and monitor child progress.
            </Text>

            <View style={styles.card}>
              <AuthToggle
                mode={authMode}
                onChange={setAuthMode}
              />

              <InputField
                label={
                  authMode === 'mobile'
                    ? 'Mobile Number'
                    : 'Email Address'
                }
                icon={
                  authMode === 'mobile'
                    ? 'call-outline'
                    : 'mail-outline'
                }
                placeholder={
                  authMode === 'mobile'
                    ? 'Enter mobile number'
                    : 'Enter email address'
                }
                keyboardType={
                  authMode === 'mobile'
                    ? 'phone-pad'
                    : 'email-address'
                }
                value={identifier}
                onChangeText={setIdentifier}
              />

              {authMode === 'email' && (
                <InputField
                  label="Password"
                  icon="lock-closed-outline"
                  placeholder="Enter your password"
                  secureEntry
                  value={password}
                  onChangeText={setPassword}
                />
              )}

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}

              {authMode === 'mobile' ? (
                <Button
                  label="Send OTP"
                  onPress={handleOTPLogin}
                  style={styles.button}
                />
              ) : (
                <>
                  <Button
                    label="Login with Password"
                    onPress={handlePasswordLogin}
                    style={styles.button}
                  />

                  <Button
                    label="Login with OTP"
                    variant="outline"
                    onPress={handleOTPLogin}
                    style={styles.button}
                  />
                </>
              )}

              <Text
                style={styles.forgotText}
                onPress={() =>
                  Alert.alert(
                    'Forgot Password',
                    'Password recovery coming soon.'
                  )
                }
              >
                Forgot Password?
              </Text>
            </View>

            <View style={styles.bottomCard}>
              <Text style={styles.bottomText}>
                Don’t have an account?
              </Text>

              <Text
                style={styles.registerLink}
                onPress={handleRegister}
              >
                Create Account
              </Text>
            </View>
          </View>
=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
<<<<<<< HEAD
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // authWrapper: {
  //   flexDirection: 'column',
  //   gap: 24,
  // },
  // authWrapperDesktop: {
  //   flexDirection: 'row',
  //   height: '100%',
  // },
  // leftPanel: {
  //   flex: 1,
  //   borderTopLeftRadius: 24,
  //   borderBottomLeftRadius: 24,
  // },
  // rightPanel: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   paddingHorizontal: Spacing.lg,
  // },
  container: {
    paddingHorizontal: Spacing.lg,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  pageSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  button: {
    marginTop: Spacing.sm,
  },
  forgotText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  bottomCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  bottomText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginBottom: Spacing.sm,
  },
  authWrapper: {
    flex: 1,
  },

  authWrapperDesktop: {
    flexDirection: 'row',
    gap: 32,
    minHeight: 700,
  },

  leftPanel: {
    flex: 1,
  },

  rightPanel: {
    flex: 1,
    justifyContent: 'center',
  },

  mobileRightPanel: {
    justifyContent: 'flex-start',
  },
=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
});
