import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';
import { Mail, Lock, User, Phone } from 'lucide-react-native';

const iconMap = {
    email: Mail,
    password: Lock,
    user: User,
    phone: Phone
};

export default function Input({ label, icon, error, ...props }) {
    const IconComponent = icon ? iconMap[icon] : null;

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {IconComponent && (
                    <IconComponent color={Theme.colors.textLight} size={20} style={styles.icon} />
                )}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={Theme.colors.textLight}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Theme.spacing.m,
    },
    label: {
        fontSize: Theme.typography.caption.fontSize,
        color: Theme.colors.text,
        marginBottom: Theme.spacing.xs,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.borderRadius.m,
        paddingHorizontal: Theme.spacing.m,
        height: 50,
    },
    inputError: {
        borderColor: Theme.colors.error,
    },
    icon: {
        marginRight: Theme.spacing.s,
    },
    input: {
        flex: 1,
        color: Theme.colors.text,
        fontSize: Theme.typography.body.fontSize,
    },
    errorText: {
        color: Theme.colors.error,
        fontSize: Theme.typography.small.fontSize,
        marginTop: Theme.spacing.xs,
    }
});
