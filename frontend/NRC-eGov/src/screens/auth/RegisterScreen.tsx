import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { Colors } from '../../theme/colors';
import { Spacing, Radius } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { ROLE_LIST, Role } from '../../constants/roles';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<Role | ''>('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ role?: string; email?: string }>({});
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleGoogleRegister = () => {
    if (!role) return setErrors({ role: 'Please select a professional role' });
    Alert.alert('Google OAuth', 'Google registration integration will use Expo AuthSession.');
  };

  const handleMobileRegister = () => {
    const nextErrors: typeof errors = {};
    if (!role) nextErrors.role = 'Please select a professional role';
    if (role && role !== 'Parent' && !email.trim()) nextErrors.email = 'Government email is required for non-parent roles';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    navigation.navigate('OTPVerification', {
      flow: 'register',
      role,
    });
  };

  const handleNormalRegistration = () => {
    const nextErrors: typeof errors = {};
    if (!role) nextErrors.role = 'Please select a professional role';
    if (role && role !== 'Parent' && !email.trim()) nextErrors.email = 'Government email is required for non-parent roles';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    navigation.navigate('FullRegistration', {
      role,
    });
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

        <Text style={styles.pickerLabel}>Professional Role</Text>
        <TouchableOpacity style={[styles.roleSelect, errors.role ? styles.errorBorder : null]} onPress={() => setPickerVisible(true)}>
          <Text style={[styles.roleSelectText, !role && { color: Colors.textMuted }]}>{role || 'Select role'}</Text>
        </TouchableOpacity>
        {errors.role ? <Text style={styles.errorText}>{errors.role}</Text> : null}

        <InputField
          label="Government Email (required for non-Parent roles)"
          icon="mail-outline"
          placeholder="name@domain.gov.in"
          value={email}
          onChangeText={(v) => { setEmail(v); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
          keyboardType="email-address"
          error={errors.email}
        />

        <Button label="Register with Gmail" onPress={handleGoogleRegister} style={styles.button} />
        <Button label="Register with Mobile Number" onPress={handleMobileRegister} variant="outline" style={styles.button} />
        <Button label="Normal Registration" onPress={handleNormalRegistration} variant="ghost" textStyle={styles.ghostText} style={styles.button} />
      </View>

      <Modal visible={pickerVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setPickerVisible(false)} />
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Role</Text>
          <FlatList
            data={ROLE_LIST}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => { setRole(item); setPickerVisible(false); setErrors((p) => ({ ...p, role: undefined })); }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      <View style={styles.footer}>
        <Text style={styles.footerText}>This portal is managed by the Government of Chhattisgarh and built for trusted public service access.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FBFD', paddingHorizontal: Spacing.lg },
  title: { fontSize: 32, fontWeight: '800', color: Colors.primary, marginBottom: Spacing.xs },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: Spacing.xl },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24, elevation: 4 },
  cardHeadline: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  cardCopy: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.lg },
  button: { marginTop: Spacing.sm },
  ghostText: { color: Colors.primary },
  pickerLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '600' },
  roleSelect: { backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: Spacing.md, minHeight: 52, justifyContent: 'center' },
  roleSelectText: { ...Typography.body, color: Colors.textPrimary },
  errorText: { ...Typography.caption, color: Colors.error, marginTop: Spacing.xs, marginBottom: Spacing.sm },
  errorBorder: { borderColor: Colors.error },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContainer: { backgroundColor: Colors.white, maxHeight: '50%', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: Spacing.md },
  modalTitle: { ...Typography.label, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.sm },
  modalItem: { paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalItemText: { ...Typography.body, color: Colors.textPrimary },
  footer: { marginTop: Spacing.xl },
  footerText: { ...Typography.bodySmall, color: Colors.textSecondary, lineHeight: 20 },
});
