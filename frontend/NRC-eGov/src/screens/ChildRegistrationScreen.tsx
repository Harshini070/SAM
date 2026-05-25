import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
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
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChildRegistration'>;
};

const GENDERS = ['Male', 'Female', 'Others'];
const DISTRICTS = ['Raipur', 'Durg', 'Bastar', 'Bilaspur', 'Rajnandgaon'];

export const ChildRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1); // 1: Personal, 2: Health, 3: Location
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

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic health status prediction based on MUAC input
  useEffect(() => {
    const muacVal = parseFloat(form.muac);
    if (!isNaN(muacVal)) {
      if (muacVal < 115) {
        update('healthStatus', 'SAM');
      } else if (muacVal < 125) {
        update('healthStatus', 'MAM');
      } else {
        update('healthStatus', 'Healthy');
      }
    } else {
      update('healthStatus', 'Healthy');
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

  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};
    if (step === 1) {
      if (!form.childName.trim()) stepErrors.childName = 'Child name is required';
      if (!form.dob.trim()) {
        stepErrors.dob = 'Date of birth is required';
      } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.dob)) {
        stepErrors.dob = 'Use DD/MM/YYYY format';
      }
      if (!form.gender) stepErrors.gender = 'Gender selection is required';
      if (!form.motherName.trim()) stepErrors.motherName = "Mother's name is required";
      if (form.mobile && form.mobile.length !== 10) {
        stepErrors.mobile = 'Mobile number must be 10 digits';
      }
    } else if (step === 2) {
      const weightVal = parseFloat(form.weight);
      if (!form.weight) {
        stepErrors.weight = 'Weight is required';
      } else if (isNaN(weightVal) || weightVal <= 0 || weightVal > 30) {
        stepErrors.weight = 'Enter valid weight (0.5 - 30 kg)';
      }

      const heightVal = parseFloat(form.height);
      if (!form.height) {
        stepErrors.height = 'Height is required';
      } else if (isNaN(heightVal) || heightVal <= 30 || heightVal > 150) {
        stepErrors.height = 'Enter valid height (30 - 150 cm)';
      }

      const muacVal = parseFloat(form.muac);
      if (!form.muac) {
        stepErrors.muac = 'MUAC is required';
      } else if (isNaN(muacVal) || muacVal <= 50 || muacVal > 250) {
        stepErrors.muac = 'Enter valid MUAC (50 - 250 mm)';
      }
    } else if (step === 3) {
      if (!form.district) stepErrors.district = 'District selection is required';
      if (!form.anganwadiCode.trim()) stepErrors.anganwadiCode = 'Anganwadi code is required';
      if (!form.village.trim()) stepErrors.village = 'Village / Area is required';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleRegister = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      await childService.registerChild(form);
      setLoading(false);
      Alert.alert('Success', 'Child registered successfully in e-Gov register!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Failed to register child');
    }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionText}>{title}</Text>
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

      {/* Step Progress Indicator */}
      <View style={styles.progressWrap}>
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <View style={styles.stepIndicatorRow}>
              <View
                style={[
                  styles.stepDot,
                  currentStep >= step && styles.stepDotActive,
                  currentStep === step && styles.stepDotCurrent,
                ]}
              >
                {currentStep > step ? (
                  <Ionicons name="checkmark" size={12} color={Colors.white} />
                ) : (
                  <Text style={[styles.stepDotText, currentStep >= step && styles.stepDotTextActive]}>
                    {step}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, currentStep === step && styles.stepLabelActive]}>
                {step === 1 ? 'Personal' : step === 2 ? 'Measurements' : 'Location'}
              </Text>
            </View>
            {step < 3 && <View style={[styles.stepLine, currentStep > step && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>

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
          {currentStep === 1 && (
            <View style={styles.card}>
              <SectionTitle title="Personal Information" />
              
              <InputField
                label="Child Full Name *"
                icon="person-outline"
                placeholder="Enter full name"
                value={form.childName}
                onChangeText={(v) => update('childName', v)}
                style={errors.childName ? styles.errorInput : undefined}
              />
              {errors.childName && <Text style={styles.errorText}>{errors.childName}</Text>}

              <InputField
                label="Date of Birth *"
                icon="calendar-outline"
                placeholder="DD/MM/YYYY"
                value={form.dob}
                onChangeText={(v) => update('dob', v)}
                keyboardType="numeric"
                style={errors.dob ? styles.errorInput : undefined}
              />
              {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

              {/* Gender selection Chips */}
              <View style={styles.mb}>
                <Text style={styles.pickerLabel}>Gender *</Text>
                <View style={styles.genderRow}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderBtn,
                        form.gender === g && styles.genderBtnActive,
                        errors.gender ? styles.errorBorder : undefined,
                      ]}
                      onPress={() => update('gender', g)}
                    >
                      <Text style={[styles.genderText, form.gender === g && styles.genderTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              </View>

              <InputField
                label="Mother's Full Name *"
                icon="people-outline"
                placeholder="Enter mother's full name"
                value={form.motherName}
                onChangeText={(v) => update('motherName', v)}
                style={errors.motherName ? styles.errorInput : undefined}
              />
              {errors.motherName && <Text style={styles.errorText}>{errors.motherName}</Text>}

              <InputField
                label="Parent's Mobile Number"
                icon="call-outline"
                placeholder="10-digit number"
                value={form.mobile}
                onChangeText={(v) => update('mobile', v)}
                keyboardType="phone-pad"
                maxLength={10}
                style={errors.mobile ? styles.errorInput : undefined}
              />
              {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.card}>
              <SectionTitle title="Measurements & Growth" />
              
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <InputField
                    label="Weight (kg) *"
                    icon="fitness-outline"
                    placeholder="e.g. 8.5"
                    value={form.weight}
                    onChangeText={(v) => update('weight', v)}
                    keyboardType="decimal-pad"
                    style={errors.weight ? styles.errorInput : undefined}
                  />
                  {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
                </View>
                
                <View style={[styles.halfField, styles.halfRight]}>
                  <InputField
                    label="Height (cm) *"
                    icon="resize-outline"
                    placeholder="e.g. 72"
                    value={form.height}
                    onChangeText={(v) => update('height', v)}
                    keyboardType="decimal-pad"
                    style={errors.height ? styles.errorInput : undefined}
                  />
                  {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
                </View>
              </View>

              <InputField
                label="MUAC (mm) *"
                icon="analytics-outline"
                placeholder="Mid-Upper Arm Circumference e.g. 112"
                value={form.muac}
                onChangeText={(v) => update('muac', v)}
                keyboardType="numeric"
                style={errors.muac ? styles.errorInput : undefined}
              />
              {errors.muac && <Text style={styles.errorText}>{errors.muac}</Text>}

              {/* Dynamic Health Status Indicator */}
              <View style={styles.dynamicStatusCard}>
                <Text style={styles.statusLabel}>Calculated Health Status:</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        form.healthStatus === 'SAM'
                          ? Colors.error + '15'
                          : form.healthStatus === 'MAM'
                          ? '#D9770615'
                          : Colors.success + '15',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          form.healthStatus === 'SAM'
                            ? Colors.error
                            : form.healthStatus === 'MAM'
                            ? '#D97706'
                            : Colors.success,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          form.healthStatus === 'SAM'
                            ? Colors.error
                            : form.healthStatus === 'MAM'
                            ? '#D97706'
                            : Colors.success,
                      },
                    ]}
                  >
                    {form.healthStatus === 'SAM'
                      ? 'SAM (Severe Acute Malnutrition)'
                      : form.healthStatus === 'MAM'
                      ? 'MAM (Moderate Acute Malnutrition)'
                      : 'Healthy / Normal'}
                  </Text>
                </View>
                <Text style={styles.statusInfoText}>
                  {form.healthStatus === 'SAM'
                    ? '⚠️ Immediate referral to Nutrition Rehabilitation Center (NRC) is highly recommended.'
                    : form.healthStatus === 'MAM'
                    ? '⚠️ Distribute supplementary nutritional items and review growth in 15 days.'
                    : '✓ Continue regular growth monitoring and standard immunization schedule.'}
                </Text>
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.card}>
              <SectionTitle title="Location & Anganwadi Center" />

              {/* District Selector Chips */}
              <View style={styles.mb}>
                <Text style={styles.pickerLabel}>District *</Text>
                <View style={styles.statusGrid}>
                  {DISTRICTS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.districtBtn,
                        form.district === d && styles.districtBtnActive,
                        errors.district ? styles.errorBorder : undefined,
                      ]}
                      onPress={() => update('district', d)}
                    >
                      <Text
                        style={[
                          styles.districtText,
                          form.district === d && styles.districtTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
              </View>

              <InputField
                label="Village / Ward Area *"
                icon="location-outline"
                placeholder="Enter village or ward name"
                value={form.village}
                onChangeText={(v) => update('village', v)}
                style={errors.village ? styles.errorInput : undefined}
              />
              {errors.village && <Text style={styles.errorText}>{errors.village}</Text>}

              <InputField
                label="Anganwadi Code *"
                icon="business-outline"
                placeholder="Enter 11-digit Anganwadi code"
                value={form.anganwadiCode}
                onChangeText={(v) => update('anganwadiCode', v)}
                style={errors.anganwadiCode ? styles.errorInput : undefined}
              />
              {errors.anganwadiCode && <Text style={styles.errorText}>{errors.anganwadiCode}</Text>}
            </View>
          )}

          {/* Navigation Controls */}
          <View style={styles.controlsRow}>
            {currentStep > 1 && (
              <Button
                label="Back"
                onPress={handleBack}
                variant="outline"
                style={styles.controlBtn}
                icon="arrow-back-outline"
              />
            )}
            
            {currentStep < 3 ? (
              <Button
                label="Continue"
                onPress={handleNext}
                style={[styles.controlBtn, currentStep === 1 && { flex: 1 }]}
                icon="arrow-forward-outline"
              />
            ) : loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingSub}>Saving to state registry...</Text>
              </View>
            ) : (
              <Button
                label="Submit Registration"
                onPress={handleRegister}
                style={styles.controlBtn}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primaryLight,
  },
  stepDotCurrent: {
    backgroundColor: Colors.primary,
    ringColor: Colors.primaryLight,
  },
  stepDotText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stepDotTextActive: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: Spacing.xs,
  },
  stepLineActive: {
    backgroundColor: Colors.primaryLight,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md + 4,
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
  pickerLabel: { ...Typography.label, color: Colors.textPrimary, marginBottom: Spacing.xs, fontWeight: '600' },
  genderRow: { flexDirection: 'row', gap: Spacing.sm },
  genderBtn: {
    flex: 1,
    paddingVertical: Spacing.sm - 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
  },
  genderBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '0A',
  },
  genderText: { ...Typography.label, color: Colors.textSecondary, fontWeight: '600' },
  genderTextActive: { color: Colors.primary, fontWeight: '700' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  districtBtn: {
    paddingVertical: Spacing.sm - 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.offWhite,
  },
  districtBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '0A',
  },
  districtText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  districtTextActive: { color: Colors.primary, fontWeight: '700' },
  row: { flexDirection: 'row' },
  halfField: { flex: 1 },
  halfRight: { marginLeft: Spacing.sm },
  errorInput: {
    borderColor: Colors.error,
  },
  errorBorder: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    ...Typography.bodySmall,
    marginTop: -Spacing.xs - 2,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  dynamicStatusCard: {
    marginTop: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusInfoText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  controlBtn: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  loadingSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});
