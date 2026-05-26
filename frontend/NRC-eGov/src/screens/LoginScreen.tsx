import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { useWindowDimensions } from 'react-native';
import { AuthToggle } from '../components/AuthToggle';
import { AuthLeftPanel } from '../components/AuthLeftPannel';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
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
  };

  return (
    <KeyboardAvoidingView
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
});
