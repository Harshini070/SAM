import React, { useState, useEffect } from 'react';
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

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FullRegistration'>;
  route: RouteProp<RootStackParamList, 'FullRegistration'>;
};

export const FullRegistrationScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState(route.params?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (route.params?.phone) {
      setMobile(route.params.phone);
    }
  }, [route.params?.phone]);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !mobile.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (mobile.length !== 10) {
      setError('Mobile number must be 10 digits.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    Alert.alert('Registration complete', 'Your account has been successfully created.', [
      { text: 'Continue', onPress: () => navigation.replace('MainTabs') },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Full Registration</Text>
      <Text style={styles.subtitle}>Complete your account details to finish registration.</Text>

      <View style={styles.card}>
        <InputField
          label="Full Name"
          icon="person-outline"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <InputField
          label="Email Address"
          icon="mail-outline"
          placeholder="name@example.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <InputField
          label="Mobile Number"
          icon="call-outline"
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={(value) => setMobile(value.replace(/[^0-9]/g, ''))}
          maxLength={10}
        />
        <InputField
          label="Password"
          icon="lock-closed-outline"
          placeholder="Create password"
          secureEntry
          value={password}
          onChangeText={setPassword}
        />
        <InputField
          label="Confirm Password"
          icon="lock-closed-outline"
          placeholder="Confirm password"
          secureEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button label="Submit Registration" onPress={handleSubmit} style={styles.submitButton} />
      </View>

      <View style={styles.noteContainer}>
        <Text style={styles.noteTitle}>Your information is protected</Text>
        <Text style={styles.noteBody}>All registration details are stored securely and used only for authorized NRC e-Governance access.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { paddingHorizontal: Spacing.lg },
  title: { marginTop: Spacing.sm, fontSize: 30, fontWeight: '800', color: Colors.primary, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  card: { padding: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24, elevation: 4 },
  submitButton: { marginTop: Spacing.sm },
  errorText: { ...Typography.caption, color: Colors.error, marginTop: Spacing.sm },
  noteContainer: { marginTop: Spacing.lg, padding: Spacing.lg, backgroundColor: '#F0FDFA', borderRadius: Radius.md, borderWidth: 1, borderColor: '#CCFBF1' },
  noteTitle: { fontSize: 15, fontWeight: '700', color: Colors.success, marginBottom: Spacing.xs },
  noteBody: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 20 },
});
