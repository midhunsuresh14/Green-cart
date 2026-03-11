import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Mail, Phone, MapPin } from 'lucide-react-native';

export default function ContactScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (!name || !email || !message) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        Alert.alert('Success', 'Your message has been sent. We will get back to you soon!');
        setName('');
        setEmail('');
        setMessage('');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Contact Us</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Get in Touch</Text>
                    <Text style={styles.subtitle}>We'd love to hear from you. Please fill out the form or use the contact information below.</Text>

                    <View style={styles.contactItem}>
                        <View style={styles.iconCircle}><Mail color={Theme.colors.primary} size={20} /></View>
                        <Text style={styles.contactText}>support@greencart.com</Text>
                    </View>

                    <View style={styles.contactItem}>
                        <View style={styles.iconCircle}><Phone color={Theme.colors.primary} size={20} /></View>
                        <Text style={styles.contactText}>+1 (555) 123-4567</Text>
                    </View>

                    <View style={styles.contactItem}>
                        <View style={styles.iconCircle}><MapPin color={Theme.colors.primary} size={20} /></View>
                        <Text style={styles.contactText}>123 Green Avenue, NY 10001</Text>
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.formTitle}>Drop a Message</Text>
                    <Input
                        label="Your Name"
                        placeholder="John Doe"
                        value={name}
                        onChangeText={setName}
                    />
                    <Input
                        label="Your Email"
                        placeholder="john@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Message</Text>
                        <View style={styles.messageInputWrapper}>
                            <TextInput
                                style={styles.messageInput}
                                placeholder="How can we help you?"
                                placeholderTextColor={Theme.colors.textLight}
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    <Button
                        title="Send Message"
                        onPress={handleSend}
                        style={{ marginTop: Theme.spacing.l }}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// Ensure TextInput is imported
import { TextInput } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Theme.spacing.m,
        backgroundColor: Theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    title: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
    },
    backBtnText: {
        color: Theme.colors.text,
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: Theme.spacing.m,
    },
    infoSection: {
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.l,
        borderRadius: Theme.borderRadius.l,
        marginBottom: Theme.spacing.m,
        ...Theme.shadows.small,
    },
    sectionTitle: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.s,
    },
    subtitle: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        lineHeight: 22,
        marginBottom: Theme.spacing.l,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Theme.spacing.m,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.primaryLight + '40',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.m,
    },
    contactText: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.text,
        fontWeight: '500',
    },
    formSection: {
        backgroundColor: Theme.colors.surface,
        padding: Theme.spacing.l,
        borderRadius: Theme.borderRadius.l,
        ...Theme.shadows.small,
    },
    formTitle: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.l,
    },
    inputContainer: {
        marginBottom: Theme.spacing.m,
    },
    label: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: '600',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.xs,
    },
    messageInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.borderRadius.m,
        backgroundColor: Theme.colors.background,
        paddingHorizontal: Theme.spacing.m,
    },
    messageInput: {
        flex: 1,
        minHeight: 120,
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.text,
        paddingTop: Theme.spacing.m,
        paddingBottom: Theme.spacing.m,
    }
});
