import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/config';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        setLoading(true);

        try {
            // Assuming a forgot-password endpoint exists on the backend.
            // If none, we will at least simulate or show error based on api response
            const response = await api.post('/forgot-password', { email });
            if (response.data.success) {
                Alert.alert('Success', 'Password reset link sent to your email.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Error', response.data.error || 'Failed to send reset link');
            }
        } catch (error) {
            Alert.alert('Info', 'Forgot password API might not be implemented on this backend yet. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>← Back to Login</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Email Address"
                            icon="email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Button
                            title="Send Reset Link"
                            onPress={handleReset}
                            loading={loading}
                            style={{ marginTop: Theme.spacing.l }}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: Theme.spacing.l,
        justifyContent: 'center'
    },
    backButton: {
        position: 'absolute',
        top: Theme.spacing.l,
        left: Theme.spacing.l,
        zIndex: 10,
    },
    backButtonText: {
        color: Theme.colors.text,
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xxl,
    },
    title: {
        fontSize: Theme.typography.h1.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
        marginBottom: Theme.spacing.xs,
    },
    subtitle: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
    },
    form: {
        width: '100%',
    }
});
