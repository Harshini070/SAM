
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
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChildRegistration'>;
};


const GENDERS = ['Male', 'Female', 'Others'];
const DISTRICTS = ['Raipur', 'Durg', 'Bastar', 'Bilaspur', 'Rajnandgaon'];

const getStatusColors = (status: string) => {
  if (status === 'SAM') return { bg: '#FEE2E2', text: '#EF4444' };
  if (status === 'MAM') return { bg: '#FEF3C7', text: '#D97706' };
  return { bg: '#E6F4EA', text: '#137333' };
};

export const ChildRegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isParent = user?.role === 'parent';
  const { t } = useLanguage();

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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (isParent && user) {
      setForm((prev) => ({
        ...prev,
        motherName: user.name || '',
        mobile: user.phone || '',
        district: user.district || '',
      }));
    }
  }, [user, isParent]);

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

    if (!form.childName.trim()) nextErrors.childName = t('nameRequired');
    if (!form.dob.trim()) nextErrors.dob = t('dobRequired');
    if (!/^[0-3]\d\/[0-1]\d\/[0-9]{4}$/.test(form.dob)) nextErrors.dob = t('dobFormat');
    if (!form.gender) nextErrors.gender = t('selectGenderError');
    if (!form.motherName.trim()) nextErrors.motherName = t('motherNameRequired');
    if (form.mobile && form.mobile.length !== 10) nextErrors.mobile = t('mobileFormat');
    if (!form.weight.trim()) nextErrors.weight = t('weightRequired');
    if (!form.height.trim()) nextErrors.height = t('heightRequired');
    if (!form.muac.trim()) nextErrors.muac = t('muacRequired');
    if (!form.district.trim()) nextErrors.district = t('districtRequired');
    if (!form.anganwadiCode.trim()) nextErrors.anganwadiCode = t('anganwadiRequired');
    if (!form.village.trim()) nextErrors.village = t('villageRequired');

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (loading || registrationSuccess) return;
    if (!validate()) return;
    setLoading(true);
    try {
      const requestId = 'req_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      const child = await childService.registerChild({ ...form, request_id: requestId });
      setRegistrationSuccess(true);
      setLoading(false);
      Alert.alert(t('regComplete'), t('regCompleteDesc'));
      if (child && child.child_id) {
        navigation.replace('ChildDetail', { childId: child.child_id });
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert(t('regFailed'), error?.message || t('regFailedDesc'));
    }
  };

  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom }]}> 
      <HeaderBar
        title={t('childRegistrationTitle')}
        subtitle={t('samIntakeForm')}
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
            <Text style={styles.sectionTitle}>{t('childInfo')}</Text>
            <InputField
              label={t('childFullName')}
              icon="person-outline"
              placeholder={t('enterChildName')}
              value={form.childName}
              onChangeText={(value) => update('childName', value)}
              error={errors.childName}
            />
            <InputField
              label={t('dob')}
              icon="calendar-outline"
              placeholder={t('dobPlaceholder')}
              value={form.dob}
              onChangeText={(value) => update('dob', value)}
              keyboardType="numeric"
              error={errors.dob}
            />
            <Text style={styles.pickerLabel}>{t('gender')}</Text>
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
                    {gender === 'Male' ? t('male') : gender === 'Female' ? t('female') : t('others')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('measurements')}</Text>
            <InputField
              label={t('motherName')}
              icon="people-outline"
              placeholder={t('enterMotherName')}
              value={form.motherName}
              onChangeText={(value) => update('motherName', value)}
              error={errors.motherName}
              editable={!isParent}
            />
            <InputField
              label={t('parentMobile')}
              icon="call-outline"
              placeholder={t('parentMobilePlaceholder')}
              keyboardType="phone-pad"
              value={form.mobile}
              onChangeText={(value) => update('mobile', value)}
              error={errors.mobile}
              editable={!isParent}
            />
            <View style={styles.measureRow}>
              <View style={styles.measureField}>
                <InputField
                  label={t('weightKg')}
                  icon="fitness-outline"
                  placeholder={t('weightPlaceholder')}
                  keyboardType="decimal-pad"
                  value={form.weight}
                  onChangeText={(value) => update('weight', value)}
                  error={errors.weight}
                />
              </View>
              <View style={styles.measureField}>
                <InputField
                  label={t('heightCm')}
                  icon="resize-outline"
                  placeholder={t('heightPlaceholder')}
                  keyboardType="decimal-pad"
                  value={form.height}
                  onChangeText={(value) => update('height', value)}
                  error={errors.height}
                />
              </View>
            </View>
            <InputField
              label={t('muacMm')}
              icon="analytics-outline"
              placeholder={t('muacPlaceholder')}
              keyboardType="numeric"
              value={form.muac}
              onChangeText={(value) => update('muac', value)}
              error={errors.muac}
            />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>{t('healthStatus')}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColors(form.healthStatus).bg }]}>
                <Text style={[styles.statusBadgeText, { color: getStatusColors(form.healthStatus).text }]}>
                  {form.healthStatus === 'SAM' ? t('sam') : form.healthStatus === 'MAM' ? t('mam') : t('healthy')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('locationDetails')}</Text>
            <Text style={styles.pickerLabel}>{t('district')}</Text>
            <View style={styles.statusGrid}>
              {DISTRICTS.map((district) => (
                <TouchableOpacity
                  key={district}
                  style={[
                    styles.districtBtn,
                    form.district === district && styles.districtBtnActive,
                  ]}
                  onPress={() => update('district', district)}
                  disabled={isParent && !!user?.district}
                >
                  <Text style={[styles.districtText, form.district === district && styles.districtTextActive]}>
                    {t(district.toLowerCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
            <InputField
              label={t('villageWard')}
              icon="location-outline"
              placeholder={t('enterVillage')}
              value={form.village}
              onChangeText={(value) => update('village', value)}
              error={errors.village}
            />
            <InputField
              label={t('anganwadiCode')}
              icon="business-outline"
              placeholder={t('enterAnganwadiCode')}
              value={form.anganwadiCode}
              onChangeText={(value) => update('anganwadiCode', value)}
              error={errors.anganwadiCode}
            />
          </View>

          <Button label={loading ? t('saving') : t('submitRegistration')} onPress={handleRegister} loading={loading} disabled={loading || registrationSuccess} />
          <TouchableOpacity style={styles.dismissLink} onPress={() => navigation.goBack()} disabled={loading || registrationSuccess}>
            <Text style={[styles.dismissText, (loading || registrationSuccess) && { opacity: 0.5 }]}>{t('cancelRegistration')}</Text>
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
