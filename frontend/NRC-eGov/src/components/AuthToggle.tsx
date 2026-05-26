import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface Props {
    mode: 'mobile' | 'email';
    onChange: (mode: 'mobile' | 'email') => void;
}

export const AuthToggle: React.FC<Props> = ({ mode, onChange }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.tab,
                    mode === 'mobile' && styles.activeTab,
                ]}
                onPress={() => onChange('mobile')}
            >
                <Ionicons
                    name="call-outline"
                    size={18}
                    color={mode === 'mobile' ? '#fff' : Colors.primary}
                />
                <Text
                    style={[
                        styles.text,
                        mode === 'mobile' && styles.activeText,
                    ]}
                >
                    Mobile Number
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.tab,
                    mode === 'email' && styles.activeTab,
                ]}
                onPress={() => onChange('email')}
            >
                <Ionicons
                    name="mail-outline"
                    size={18}
                    color={mode === 'email' ? '#fff' : Colors.primary}
                />
                <Text
                    style={[
                        styles.text,
                        mode === 'email' && styles.activeText,
                    ]}
                >
                    Email ID
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 24,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        padding: 4,
    },
    tab: {
        flex: 1,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    text: {
        fontWeight: '700',
        color: Colors.primary,
    },
    activeText: {
        color: '#fff',
    },
});