
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,

  StyleSheet,
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

import { childService } from '../services/childService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChildRegistration'>;
};


const GENDERS = ['Male', 'Female', 'Others'];
const DISTRICTS = ['Raipur', 'Durg', 'Bastar', 'Bilaspur', 'Rajnandgaon'];

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
            />
            <InputField
              label="Anganwadi Code"
              icon="business-outline"

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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

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
});
