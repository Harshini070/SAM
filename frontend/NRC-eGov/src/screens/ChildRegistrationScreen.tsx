<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
=======
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
<<<<<<< HEAD
  StyleSheet,
=======
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
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
<<<<<<< HEAD
import { childService } from '../services/childService';
=======
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChildRegistration'>;
};

<<<<<<< HEAD
const GENDERS = ['Male', 'Female', 'Others'];
const DISTRICTS = ['Raipur', 'Durg', 'Bastar', 'Bilaspur', 'Rajnandgaon'];
=======
const HEALTH_STATUSES = ['SAM (Severe)', 'MAM (Moderate)', 'Normal', 'Under Observation'];
const GENDERS = ['Male', 'Female', 'Others'];
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8

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
<<<<<<< HEAD
    muac: '',
    healthStatus: 'Healthy',
    district: '',
    anganwadiCode: '',
    village: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const muacValue = parseFloat(form.muac);
    if (!isNaN(muacValue)) {
      const status =
        muacValue < 115 ? 'SAM' : muacValue < 125 ? 'MAM' : 'Healthy';
      setForm((prev) => ({ ...prev, healthStatus: status }));
    }
  }, [form.muac]);

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.childName.trim()) nextErrors.childName = 'Child full name is required';
    if (!form.dob.trim()) nextErrors.dob = 'Date of birth is required';
    if (!/^[0-3]\d\/[0-1]\d\/[0-9]{4}$/.test(form.dob)) nextErrors.dob = 'Use DD/MM/YYYY format';
    if (!form.gender) nextErrors.gender = 'Select gender';
    if (!form.motherName.trim()) nextErrors.motherName = "Mother's name is required";
    if (form.mobile && form.mobile.length !== 10) nextErrors.mobile = 'Mobile number must be 10 digits';
    if (!form.weight.trim()) nextErrors.weight = 'Weight is required';
    if (!form.height.trim()) nextErrors.height = 'Height is required';
    if (!form.muac.trim()) nextErrors.muac = 'MUAC is required';
    if (!form.district.trim()) nextErrors.district = 'District is required';
    if (!form.anganwadiCode.trim()) nextErrors.anganwadiCode = 'Anganwadi code is required';
    if (!form.village.trim()) nextErrors.village = 'Village / area is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await childService.registerChild(form);
      setLoading(false);
      Alert.alert('Registration Complete', 'Child record has been added.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Registration Failed', error?.message || 'Unable to save child record.');
    }
  };

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}> 
      <HeaderBar
        title="Child Registration"
        subtitle="SAM intake form"
        showBack
        onBack={() => navigation.goBack()}
      />

=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
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
<<<<<<< HEAD
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Child Information</Text>
            <InputField
              label="Child Full Name"
              icon="person-outline"
              placeholder="Enter child full name"
              value={form.childName}
              onChangeText={(value) => update('childName', value)}
              error={errors.childName}
            />
            <InputField
              label="Date of Birth"
              icon="calendar-outline"
              placeholder="DD/MM/YYYY"
              value={form.dob}
              onChangeText={(value) => update('dob', value)}
              keyboardType="numeric"
              error={errors.dob}
            />
            <Text style={styles.pickerLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDERS.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    form.gender === gender && styles.genderActive,
                  ]}
                  onPress={() => update('gender', gender)}
                >
                  <Text style={[styles.genderButtonText, form.gender === gender && styles.genderActiveText]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Measurements</Text>
            <InputField
              label="Mother's Name"
              icon="people-outline"
              placeholder="Enter mother or guardian name"
              value={form.motherName}
              onChangeText={(value) => update('motherName', value)}
              error={errors.motherName}
            />
            <InputField
              label="Parent Mobile"
              icon="call-outline"
              placeholder="10-digit phone number"
              keyboardType="phone-pad"
              value={form.mobile}
              onChangeText={(value) => update('mobile', value)}
              error={errors.mobile}
            />
            <View style={styles.measureRow}>
              <View style={styles.measureField}>
                <InputField
                  label="Weight (kg)"
                  icon="fitness-outline"
                  placeholder="e.g. 8.5"
                  keyboardType="decimal-pad"
                  value={form.weight}
                  onChangeText={(value) => update('weight', value)}
                  error={errors.weight}
                />
              </View>
              <View style={styles.measureField}>
                <InputField
                  label="Height (cm)"
                  icon="resize-outline"
                  placeholder="e.g. 72"
                  keyboardType="decimal-pad"
                  value={form.height}
                  onChangeText={(value) => update('height', value)}
                  error={errors.height}
                />
              </View>
            </View>
            <InputField
              label="MUAC (mm)"
              icon="analytics-outline"
              placeholder="e.g. 112"
              keyboardType="numeric"
              value={form.muac}
              onChangeText={(value) => update('muac', value)}
              error={errors.muac}
            />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Health Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{form.healthStatus}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <Text style={styles.pickerLabel}>District</Text>
            <View style={styles.statusGrid}>
              {DISTRICTS.map((district) => (
                <TouchableOpacity
                  key={district}
                  style={[
                    styles.districtBtn,
                    form.district === district && styles.districtBtnActive,
                  ]}
                  onPress={() => update('district', district)}
                >
                  <Text style={[styles.districtText, form.district === district && styles.districtTextActive]}>
                    {district}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
            <InputField
              label="Village / Ward Area"
              icon="location-outline"
              placeholder="Enter village or ward area"
              value={form.village}
              onChangeText={(value) => update('village', value)}
              error={errors.village}
=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
            />
            <InputField
              label="Anganwadi Code"
              icon="business-outline"
<<<<<<< HEAD
              placeholder="Enter Anganwadi code"
              value={form.anganwadiCode}
              onChangeText={(value) => update('anganwadiCode', value)}
              error={errors.anganwadiCode}
            />
          </View>

          <Button label={loading ? 'Saving...' : 'Submit Registration'} onPress={handleRegister} loading={loading} />
          <TouchableOpacity style={styles.dismissLink} onPress={() => navigation.goBack()}>
            <Text style={styles.dismissText}>Cancel registration</Text>
          </TouchableOpacity>
=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
<<<<<<< HEAD
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 24, elevation: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  pickerLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '600' },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  genderButton: { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: Radius.lg, paddingVertical: Spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', minHeight: 48 },
  genderActive: { backgroundColor: Colors.primary + '0A', borderColor: Colors.primary },
  genderButtonText: { color: Colors.textPrimary, fontWeight: '700' },
  genderActiveText: { color: Colors.primary },
  errorText: { ...Typography.caption, color: Colors.error, marginTop: Spacing.xs, marginBottom: Spacing.sm },
  measureRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm },
  measureField: { flex: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  statusLabel: { ...Typography.body, color: Colors.textPrimary, fontWeight: '700' },
  statusBadge: { backgroundColor: '#E6F4EA', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full },
  statusBadgeText: { color: Colors.success, fontWeight: '700' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  districtBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radius.full, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', marginBottom: Spacing.sm },
  districtBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '0A' },
  districtText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '700' },
  districtTextActive: { color: Colors.primary },
  dismissLink: { marginTop: Spacing.lg, alignItems: 'center' },
  dismissText: { ...Typography.bodySmall, color: Colors.textSecondary, fontWeight: '600' },
=======
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
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
});
