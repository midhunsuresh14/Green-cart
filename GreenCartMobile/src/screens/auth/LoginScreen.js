import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen({ navigation }) {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigation.navigate('MainTab'); // Navigate back to main flow or close modal
        } else {
            Alert.alert('Login Failed', result.error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to GreenCart to continue</Text>
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

                        <Input
                            label="Password"
                            icon="password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={{ marginTop: Theme.spacing.l }}
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.footerLink}>Sign Up</Text>
                        </TouchableOpacity>
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
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: Theme.spacing.xs,
    },
    forgotPasswordText: {
        color: Theme.colors.primary,
        fontWeight: '600',
        fontSize: Theme.typography.caption.fontSize,
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
