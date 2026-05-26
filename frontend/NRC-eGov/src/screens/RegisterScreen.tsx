import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Button } from '../components/Button';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleGoogleRegister = () => {
    Alert.alert('Google OAuth', 'Google registration integration will use Expo AuthSession.');
  };

  const handleMobileRegister = () => {
    navigation.navigate('OTPVerification', { flow: 'register' });
  };

  const handleNormalRegistration = () => {
    navigation.navigate('FullRegistration');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}> 
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Start your registration</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeadline}>Welcome to NRC e-Governance</Text>
        <Text style={styles.cardCopy}>
          Choose your preferred way to create a secure account and access government services.
        </Text>

        <Button label="Register with Gmail" onPress={handleGoogleRegister} style={styles.button} />
        <Button label="Register with Mobile Number" onPress={handleMobileRegister} variant="outline" style={styles.button} />
        <Button label="Normal Registration" onPress={handleNormalRegistration} variant="ghost" textStyle={styles.ghostText} style={styles.button} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>This portal is managed by the Government of Chhattisgarh and built for trusted public service access.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FBFD',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
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
    elevation: 4,
  },
  cardHeadline: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  cardCopy: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  button: {
    marginTop: Spacing.sm,
  },
  ghostText: {
    color: Colors.primary,
  },
  footer: {
    marginTop: Spacing.xl,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
