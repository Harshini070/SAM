import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Radius, Spacing } from '../../theme/spacing';
import { Typography } from '../../theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Landing'>;
};

export const LandingPage: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const handleLogin = () => navigation.navigate('Login');
  const handleRegister = () => navigation.navigate('Register');

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
            <Text style={styles.title}>NRC e-Governance</Text>
            <Text style={styles.subtitle}>A unified platform for nutrition rehabilitation monitoring across Chhattisgarh.</Text>
          </View>
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>Official Portal</Text>
          </View>
        </View>

        <View style={[styles.cardGrid, isWide && styles.cardGridWide]}>
          <View style={[styles.card, isWide && styles.cardSpacing]}> 
            <Text style={styles.sectionTitle}>Register</Text>
            <Text style={styles.sectionCopy}>Secure onboarding for field staff and caregivers.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} activeOpacity={0.86}>
              <Text style={styles.primaryButtonText}>Register with Mobile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleRegister} activeOpacity={0.86}>
              <Text style={styles.secondaryButtonText}>Register with Gmail</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Login</Text>
            <Text style={styles.sectionCopy}>Access your dashboard, reports, and child records instantly.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} activeOpacity={0.86}>
              <Text style={styles.primaryButtonText}>Login with Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin} activeOpacity={0.86}>
              <Text style={styles.secondaryButtonText}>Login with OTP</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>142</Text>
            <Text style={styles.statLabel}>NRC Centers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12K+</Text>
            <Text style={styles.statLabel}>Children Monitored</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>25%</Text>
            <Text style={styles.statLabel}>SAM Recovery</Text>
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerHeading}>Trusted by Government Agencies</Text>
          <Text style={styles.footerCopy}>The platform is built for transparency, empowerment, and real-time decision-making in the NRC ecosystem.</Text>
          <Text style={styles.footerNote}>Powered by NIC · Ministry of Women & Child Development</Text>
        </View>
      </ScrollView>
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
  pillBadge: { backgroundColor: 'rgba(255,255,255,0.20)', borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, alignSelf: 'flex-start' },
  pillBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
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
});
