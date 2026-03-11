import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/config';

export default function SignupScreen({ navigation }) {
    const { login } = useContext(AuthContext);

    const [step, setStep] = useState(1); // 1 = Details, 2 = OTP Verification
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !phone || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/signup', { name, email, phone, password });
            if (response.data.success) {
                setStep(2);
                Alert.alert('Success', 'OTP sent to your email.');
            } else {
                Alert.alert('Error', response.data.error || 'Signup failed');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/verify-otp', { email, otp, password, name, phone });

            if (response.data.success) {
                Alert.alert('Success', 'Account created successfully!');
                // Login the user to set contexts
                const loginRes = await login(email, password);
                if (loginRes.success) {
                    navigation.navigate('MainTab');
                } else {
                    navigation.navigate('Login');
                }
            } else {
                Alert.alert('Error', response.data.error || 'Verification failed');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Network error occurred');
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
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.title}>Join GreenCart</Text>
                        <Text style={styles.subtitle}>Create an account to start your green journey</Text>
                    </View>

                    {step === 1 ? (
                        <View style={styles.form}>
                            <Input
                                label="Full Name"
                                icon="user"
                                placeholder="Enter your full name"
                                value={name}
                                onChangeText={setName}
                            />
                            <Input
                                label="Email Address"
                                icon="email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Input
                                label="Phone Number"
                                icon="phone"
                                placeholder="Enter your phone number"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                            <Input
                                label="Password"
                                icon="password"
                                placeholder="Create a password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <Button
                                title="Sign Up"
                                onPress={handleSignup}
                                loading={loading}
                                style={{ marginTop: Theme.spacing.m }}
                            />
                        </View>
                    ) : (
                        <View style={styles.form}>
                            <Text style={styles.helperText}>Please enter the OTP sent to {email}</Text>
                            <Input
                                label="OTP Code"
                                icon="password"
                                placeholder="Enter OTP"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                            />
                            <Button
                                title="Verify & Create Account"
                                onPress={handleVerifyOTP}
                                loading={loading}
                                style={{ marginTop: Theme.spacing.m }}
                            />
                        </View>
                    )}

                    {step === 1 && (
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.footerLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    )}

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
        marginBottom: Theme.spacing.xl,
        marginTop: Theme.spacing.xxl,
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
    },
    helperText: {
        marginBottom: Theme.spacing.m,
        color: Theme.colors.primaryDark,
        textAlign: 'center',
        fontWeight: '500'
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Theme.spacing.xxl,
    },
    footerText: {
        color: Theme.colors.textLight,
        fontSize: Theme.typography.body.fontSize,
    },
    footerLink: {
        color: Theme.colors.primary,
        fontWeight: 'bold',
        fontSize: Theme.typography.body.fontSize,
    }
});
