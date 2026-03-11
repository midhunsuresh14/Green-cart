import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Theme } from '../../constants/theme';

export default function Button({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style
}) {
    const bgColors = {
        primary: Theme.colors.primary,
        secondary: Theme.colors.secondary,
        outline: 'transparent',
        ghost: 'transparent'
    };

    const textColors = {
        primary: '#FFF',
        secondary: '#FFF',
        outline: Theme.colors.primary,
        ghost: Theme.colors.textLight
    };

    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: bgColors[variant] },
                isOutline && styles.outlineButton,
                disabled && styles.disabledButton,
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={textColors[variant]} />
            ) : (
                <Text style={[
                    styles.text,
                    { color: textColors[variant] }
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: Theme.borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        width: '100%',
        marginVertical: Theme.spacing.s,
        ...Theme.shadows.small
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: Theme.colors.primary,
        elevation: 0,
        shadowOpacity: 0,
    },
    disabledButton: {
        opacity: 0.6,
    },
    text: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
    }
});
