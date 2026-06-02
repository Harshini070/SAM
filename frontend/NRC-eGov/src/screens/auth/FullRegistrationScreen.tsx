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
import { useLanguage } from '../../context/LanguageContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FullRegistration'>;
  route: RouteProp<RootStackParamList, 'FullRegistration'>;
};

export const FullRegistrationScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { t, locale } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState(route.params?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.phone) {
      setMobile(route.params.phone);
    }
  }, [route.params?.phone]);

  const handleSubmit = () => {
    if (loading) return;
    if (!name.trim() || !email.trim() || !mobile.trim() || !password || !confirmPassword) {
      setError(t('fieldsRequiredError'));
      return;
    }
    if (mobile.length !== 10) {
      setError(t('mobileFormat'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordsMismatchError'));
      return;
    }

    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(t('regSuccessTitle'), t('regSuccessMsg'), [
        { text: t('continueBtn'), onPress: () => navigation.replace('MainTabs') },
      ]);
    }, 800);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t('fullRegistrationTitle')}</Text>
      <Text style={styles.subtitle}>{t('completeDetailsText')}</Text>

      <View style={styles.card}>
        <InputField
          label={t('fullNameLabel')}
          icon="person-outline"
          placeholder={t('enterFullName')}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!loading}
        />
        <InputField
          label={t('emailAddressLabel')}
          icon="mail-outline"
          placeholder={t('enterEmailAddress')}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          editable={!loading}
        />
        <InputField
          label={t('mobileNumber')}
          icon="call-outline"
          placeholder={t('parentMobilePlaceholder')}
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={(value) => setMobile(value.replace(/[^0-9]/g, ''))}
          maxLength={10}
          editable={!loading}
        />
        <InputField
          label={t('passwordLabel')}
          icon="lock-closed-outline"
          placeholder={t('createPasswordPlaceholder')}
          secureEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <InputField
          label={t('confirmPasswordLabel')}
          icon="lock-closed-outline"
          placeholder={t('confirmPasswordPlaceholder')}
          secureEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!loading}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button label={t('submitRegistration')} onPress={handleSubmit} loading={loading} style={styles.submitButton} />
      </View>

      <View style={styles.noteContainer}>
        <Text style={styles.noteTitle}>{t('infoProtectedTitle')}</Text>
        <Text style={styles.noteBody}>{t('infoProtectedBody')}</Text>
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
