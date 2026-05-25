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
import { HeaderBar } from '../components/HeaderBar';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChildRegistration'>;
};

const HEALTH_STATUSES = ['SAM (Severe)', 'MAM (Moderate)', 'Normal', 'Under Observation'];
const GENDERS = ['Male', 'Female', 'Others'];

export const ChildRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    childName: '',
    dob: '',
    gender: '',
    motherName: '',
    mobile: '',
    weight: '',
    height: '',
    healthStatus: '',
    district: '',
    anganwadiCode: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = () => {
    if (!form.childName || !form.dob || !form.gender) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Child registered successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 1500);
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionText}>{title}</Text>
    </View>
  );

  const GenderPicker = () => (
    <View style={styles.mb}>
      <Text style={styles.pickerLabel}>Gender *</Text>
      <View style={styles.genderRow}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
            onPress={() => update('gender', g)}
          >
            <Text
              style={[styles.genderText, form.gender === g && styles.genderTextActive]}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const StatusPicker = () => (
    <View style={styles.mb}>
      <Text style={styles.pickerLabel}>Health Status *</Text>
      <View style={styles.statusGrid}>
        {HEALTH_STATUSES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusBtn, form.healthStatus === s && styles.statusBtnActive]}
            onPress={() => update('healthStatus', s)}
          >
            <Text
              style={[
                styles.statusText,
                form.healthStatus === s && styles.statusTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}>
      <HeaderBar
        title="Register Child"
        subtitle="SAM Detection Program"
        showBack
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Personal Info */}
          <View style={styles.card}>
            <SectionTitle title="Personal Information" />
            <InputField
              label="Child Name *"
              icon="person-outline"
              placeholder="Enter full name"
              value={form.childName}
              onChangeText={(v) => update('childName', v)}
            />
            <InputField
              label="Date of Birth *"
              icon="calendar-outline"
              placeholder="DD / MM / YYYY"
              value={form.dob}
              onChangeText={(v) => update('dob', v)}
              keyboardType="numeric"
            />
            <GenderPicker />
            <InputField
              label="Mother's Name *"
              icon="people-outline"
              placeholder="Enter mother's full name"
              value={form.motherName}
              onChangeText={(v) => update('motherName', v)}
            />
            <InputField
              label="Mobile Number"
              icon="call-outline"
              placeholder="10-digit mobile number"
              value={form.mobile}
              onChangeText={(v) => update('mobile', v)}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Health Info */}
          <View style={styles.card}>
            <SectionTitle title="Health Information" />
            <View style={styles.row}>
              <View style={styles.halfField}>
                <InputField
                  label="Weight (kg) *"
                  icon="fitness-outline"
                  placeholder="e.g. 8.5"
                  value={form.weight}
                  onChangeText={(v) => update('weight', v)}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.halfField, styles.halfRight]}>
                <InputField
                  label="Height (cm) *"
                  icon="resize-outline"
                  placeholder="e.g. 72"
                  value={form.height}
                  onChangeText={(v) => update('height', v)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <StatusPicker />
          </View>

          {/* Location Info */}
          <View style={styles.card}>
            <SectionTitle title="Location Details" />
            <InputField
              label="District"
              icon="location-outline"
              placeholder="Select district"
              value={form.district}
              onChangeText={(v) => update('district', v)}
            />
            <InputField
              label="Anganwadi Code"
              icon="business-outline"
              placeholder="Enter Anganwadi center code"
              value={form.anganwadiCode}
              onChangeText={(v) => update('anganwadiCode', v)}
            />
          </View>

          {/* SAM Note */}
          <View style={styles.samNote}>
            <Text style={styles.noteIcon}>⚠️</Text>
            <Text style={styles.noteText}>
              WHO criteria: Weight-for-Height {'<'} -3 SD or MUAC {'<'} 115mm. 
              Ensure measurements are accurate before registration.
            </Text>
          </View>

          <Button
            label="Register Child"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />
          <Button
            label="Save as Draft"
            onPress={() => {}}
            variant="outline"
            style={styles.draftBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  sectionText: { ...Typography.h4, color: Colors.primary },
  mb: { marginBottom: Spacing.md },
  pickerLabel: { ...Typography.label, color: Colors.textPrimary, marginBottom: Spacing.xs },
  genderRow: { flexDirection: 'row', gap: Spacing.sm },
  genderBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
  },
  genderBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '12',
  },
  genderText: { ...Typography.label, color: Colors.textSecondary },
  genderTextActive: { color: Colors.primary, fontWeight: '700' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statusBtn: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.offWhite,
  },
  statusBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  statusText: { ...Typography.caption, color: Colors.textSecondary },
  statusTextActive: { color: Colors.primary, fontWeight: '700' },
  row: { flexDirection: 'row' },
  halfField: { flex: 1 },
  halfRight: { marginLeft: Spacing.sm },
  samNote: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  noteIcon: { fontSize: 14 },
  noteText: { ...Typography.bodySmall, color: '#7A5C00', flex: 1, lineHeight: 18 },
  submitBtn: { marginBottom: Spacing.sm },
  draftBtn: { marginBottom: Spacing.md },
});
