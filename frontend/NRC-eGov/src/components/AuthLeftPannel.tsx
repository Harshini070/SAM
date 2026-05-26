import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export const AuthLeftPanel = () => {
    return (
        <LinearGradient
            colors={['#0B4F6C', '#4CAF50', '#F4A261']}
            style={styles.container}
        >
            <Text style={styles.title}>
                Ensuring every child is nourished
            </Text>

            <Text style={styles.subtitle}>
                A forward-thinking initiative for tracking,
                transparency, and healthcare delivery.
            </Text>

            <View style={styles.features}>
                <Feature icon="shield-checkmark-outline" text="Secure & Reliable" />
                <Feature icon="people-outline" text="Role Based Access" />
                <Feature icon="analytics-outline" text="Real-time Monitoring" />
                <Feature icon="phone-portrait-outline" text="Mobile First" />
            </View>
        </LinearGradient>
    );
};

const Feature = ({ icon, text }: any) => (
    <View style={styles.featureRow}>
        <Ionicons name={icon} size={22} color="#fff" />
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 24,
        padding: 40,
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 38,
        fontWeight: '800',
        lineHeight: 46,
        marginBottom: 18,
    },
    subtitle: {
        color: '#E5E7EB',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 40,
    },
    features: {
        gap: 22,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    featureText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});