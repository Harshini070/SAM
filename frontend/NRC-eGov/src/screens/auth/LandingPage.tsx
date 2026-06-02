import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';
import { useLanguage, LocaleType } from '../../context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Landing'>;
};

const screenHeight = Dimensions.get('window').height;

export const LandingPage: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const { t, locale, setLocale } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const handleLogin = () => navigation.navigate('Login');
  const handleRegister = () => navigation.navigate('Register');

  const getLangLabel = (code: string) => {
    if (code === 'hi') return 'हिंदी';
    if (code === 'cg') return 'छत्तीसगढ़ी';
    return 'English';
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroHeader}>
          <View style={styles.heroTextGroup}>
            <Text style={styles.title}>{t('landingTitle')}</Text>
            <Text style={styles.subtitle}>{t('landingSubtitle')}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.langSelectorBtn} 
              onPress={() => setLanguageModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="language-outline" size={14} color={Colors.white} />
              <Text style={styles.langSelectorText}>{getLangLabel(locale)}</Text>
              <Ionicons name="chevron-down-outline" size={10} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>{t('officialPortal')}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardGrid, isWide && styles.cardGridWide]}>
          <View style={[styles.card, isWide && styles.cardSpacing]}> 
            <Text style={styles.sectionTitle}>{t('registerTitle')}</Text>
            <Text style={styles.sectionCopy}>{t('registerSub')}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} activeOpacity={0.86}>
              <Text style={styles.primaryButtonText}>{t('registerMobileBtn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister} activeOpacity={0.86}>
              <Text style={styles.secondaryButtonText}>{t('registerGmailBtn')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('loginTitle')}</Text>
            <Text style={styles.sectionCopy}>{t('loginSub')}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.86}>
              <Text style={styles.primaryButtonText}>{t('loginPasswordBtn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin} activeOpacity={0.86}>
              <Text style={styles.secondaryButtonText}>{t('loginOtpBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>{t('nrcCentersStat')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12K+</Text>
            <Text style={styles.statLabel}>{t('childrenMonitoredStat')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>25%</Text>
            <Text style={styles.statLabel}>{t('samRecoveryStat')}</Text>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerHeading}>{t('trustedGov')}</Text>
          <Text style={styles.footerCopy}>{t('platformTrustText')}</Text>
          <Text style={styles.footerNote}>{t('poweredByNic')}</Text>
        </View>
      </ScrollView>

      {/* Language Picker bottom sheet modal */}
      <Modal visible={languageModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.backdropButton} onPress={() => setLanguageModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.dragIndicator} />
            <Text style={styles.modalTitle}>{t('langSelector')}</Text>

            {[
              { code: 'en', label: 'English (EN)' },
              { code: 'hi', label: 'Hindi (हिंदी)' },
              { code: 'cg', label: 'Chhattisgarhi (छत्तीसगढ़ी)' }
            ].map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langItem, locale === lang.code && styles.langItemActive]}
                onPress={() => setLocale(lang.code as LocaleType)}
              >
                <Text style={[styles.langText, locale === lang.code && styles.langTextActive]}>
                  {lang.label}
                </Text>
                {locale === lang.code && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
              </TouchableOpacity>
            ))}

            <Button
              label={t('applyLanguageBtn')}
              onPress={() => {
                setLanguageModalVisible(false);
              }}
              style={{ marginTop: 24 }}
            />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.lg, justifyContent: 'space-between' },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xl, gap: Spacing.sm },
  heroTextGroup: { flex: 1, paddingRight: Spacing.sm },
  title: { color: Colors.white, fontSize: 34, lineHeight: 42, fontWeight: '900', marginBottom: Spacing.xs },
  subtitle: { color: 'rgba(255,255,255,0.88)', fontSize: 16, lineHeight: 24, maxWidth: 560 },
  headerRight: { alignItems: 'flex-end', gap: Spacing.xs },
  pillBadge: { backgroundColor: 'rgba(255,255,255,0.20)', borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  pillBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  langSelectorBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)', minHeight: 32 },
  langSelectorText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  cardGrid: {},
  cardGridWide: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { backgroundColor: Colors.white, borderRadius: 24, padding: Spacing.lg, flex: 1, minHeight: 280, marginBottom: Spacing.lg, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.12, shadowRadius: 28, elevation: 7, borderWidth: 1, borderColor: 'rgba(10, 25, 49, 0.08)' },
  cardSpacing: { marginRight: Spacing.lg },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: Colors.primary, marginBottom: Spacing.sm },
  sectionCopy: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: Spacing.lg },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center', marginBottom: Spacing.sm, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 5 },
  primaryButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  secondaryButton: { borderRadius: Radius.full, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: 'rgba(255,255,255,0.96)' },
  secondaryButtonText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.24)', borderRadius: 20, padding: Spacing.lg, alignItems: 'center', minWidth: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 3 },
  statNumber: { color: Colors.white, fontSize: 24, fontWeight: '800', marginBottom: Spacing.xs },
  statLabel: { color: 'rgba(255,255,255,0.90)', fontSize: 12, textAlign: 'center' },
  footerContainer: { marginTop: Spacing.sm, paddingVertical: Spacing.lg },
  footerHeading: { color: Colors.white, fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  footerCopy: { color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 22, marginBottom: Spacing.sm },
  footerNote: { color: 'rgba(255,255,255,0.68)' },
  
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  backdropButton: { flex: 1 },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, maxHeight: screenHeight * 0.85, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  dragIndicator: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, marginBottom: 18 },
  langItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  langItemActive: { backgroundColor: '#F0F9FF', paddingHorizontal: 10, borderRadius: 10 },
  langText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '600' },
  langTextActive: { color: Colors.primary, fontWeight: '800' },
});
