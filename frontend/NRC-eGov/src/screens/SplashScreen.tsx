import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography } from '../theme/typography';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
<<<<<<< HEAD
      colors={[Colors.primary, Colors.primaryLight, Colors.gradientEnd]}
      locations={[0, 0.5, 1]}
=======
      colors={['#1A6B3C', '#2E8B57', '#D4A017', '#C0522A']}
      locations={[0, 0.35, 0.7, 1]}
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Decorative circles */}
      <View style={styles.circleTR} />
      <View style={styles.circleBL} />

      <View style={[styles.container, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>

        {/* Top: Emblem */}
        <View style={styles.topSection}>
          <View style={styles.emblemRow}>
            <View style={styles.emblemBadge}>
              <Text style={styles.emblemIcon}>🏛️</Text>
            </View>
            <View style={styles.emblemLine} />
            <View style={styles.emblemBadge}>
              <Text style={styles.emblemIcon}>🌿</Text>
            </View>
          </View>
          <Text style={styles.appName}>NRC e-Governance</Text>
          <Text style={styles.govName}>Government of Chhattisgarh</Text>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>
        </View>

        {/* Middle: Tagline */}
        <View style={styles.midSection}>
          <Text style={styles.tagline}>"Ensuring every child{'\n'}is nourished"</Text>
          <Text style={styles.subtitle}>
            A forward-thinking initiative for tracking, transparency, and service delivery across Chhattisgarh.
          </Text>

          {/* Stats */}
          <View style={styles.statsCard}>
            {[
              { val: '33', lbl: 'Districts' },
              { val: '142', lbl: 'NRC Centers' },
              { val: '12K+', lbl: 'Children' },
            ].map((s, i) => (
              <View key={s.lbl} style={[styles.statItem, i < 2 && styles.statBorder]}>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLbl}>{s.lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom: CTAs */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Text style={styles.getStartedArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>Already registered? Login</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Powered by NIC · Ministry of Women & Child Development
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  circleTR: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
<<<<<<< HEAD
    backgroundColor: 'rgba(255,255,255,0.04)', top: -100, right: -80,
  },
  circleBL: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.03)', bottom: 60, left: -70,
=======
    backgroundColor: 'rgba(255,255,255,0.06)', top: -100, right: -80,
  },
  circleBL: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: 60, left: -70,
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  },
  container: { flex: 1, paddingHorizontal: Spacing.lg, justifyContent: 'space-between' },
  topSection: { alignItems: 'center' },
  emblemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  emblemBadge: {
    width: 68, height: 68, borderRadius: 34,
<<<<<<< HEAD
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  emblemIcon: { fontSize: 30 },
  emblemLine: { width: 28, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 10 },
  appName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', letterSpacing: -0.5 },
  govName: { fontSize: 13, color: 'rgba(255,255,255,0.82)', textAlign: 'center', marginTop: 4, letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, width: 160 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  dividerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 8 },
=======
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  emblemIcon: { fontSize: 30 },
  emblemLine: { width: 28, height: 2, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 10 },
  appName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', letterSpacing: -0.5 },
  govName: { fontSize: 13, color: 'rgba(255,255,255,0.82)', textAlign: 'center', marginTop: 4, letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, width: 160 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)', marginHorizontal: 8 },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  midSection: { alignItems: 'center' },
  tagline: {
    fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center',
    fontStyle: 'italic', lineHeight: 32, marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 13, color: 'rgba(255,255,255,0.82)', textAlign: 'center',
    lineHeight: 21, paddingHorizontal: Spacing.sm, marginBottom: Spacing.lg,
  },
  statsCard: {
<<<<<<< HEAD
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.lg, overflow: 'hidden', width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)' },
=======
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg, overflow: 'hidden', width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.2)' },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
  statVal: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 2, letterSpacing: 0.3 },
  bottomSection: { gap: Spacing.md },
  getStartedBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.full,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
<<<<<<< HEAD
    shadowColor: 'rgba(0,0,0,0.15)',
=======
    shadowColor: 'rgba(0,0,0,0.25)',
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
<<<<<<< HEAD
  getStartedText: { fontSize: 15, fontWeight: '700', color: Colors.primary, letterSpacing: 0.3 },
  getStartedArrow: { fontSize: 18, color: Colors.primary, fontWeight: '700' },
  loginBtn: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
=======
  getStartedText: { fontSize: 15, fontWeight: '700', color: '#1A6B3C', letterSpacing: 0.3 },
  getStartedArrow: { fontSize: 18, color: '#1A6B3C', fontWeight: '700' },
  loginBtn: {
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)',
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
    borderRadius: Radius.full, paddingVertical: 14,
    alignItems: 'center',
  },
  loginBtnText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
<<<<<<< HEAD
  footer: { fontSize: 11, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
=======
  footer: { fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
>>>>>>> 5e8bec6be688a352d89cc92498e0f2b61eef0eb8
});
