import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import { Target, ShieldCheck, HeartPulse } from 'lucide-react-native';

export default function AboutScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>About Us</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.heroSection}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.heroOverlay}>
                        <Text style={styles.heroTitle}>Cultivating Wellness</Text>
                        <Text style={styles.heroSubtitle}>Connecting you with nature's smartest remedies.</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Mission</Text>
                    <Text style={styles.textBody}>
                        At GreenCart, our mission is to empower individuals to live healthier, greener lives by providing easy access to medicinal plants, expert care advice, and AI-driven plant identification. We believe in the healing power of nature and strive to make it accessible to everyone, from seasoned gardeners to beginners.
                    </Text>
                </View>

                <View style={styles.valuesSection}>
                    <Text style={styles.sectionTitle}>Our Values</Text>

                    <View style={styles.valueCard}>
                        <View style={styles.iconContainer}><Target color={Theme.colors.primaryDark} size={28} /></View>
                        <View style={styles.valueTextContainer}>
                            <Text style={styles.valueTitle}>Sustainability</Text>
                            <Text style={styles.textBody}>Eco-friendly practices in everything we do, ensuring a greener tomorrow.</Text>
                        </View>
                    </View>

                    <View style={styles.valueCard}>
                        <View style={styles.iconContainer}><ShieldCheck color={Theme.colors.primaryDark} size={28} /></View>
                        <View style={styles.valueTextContainer}>
                            <Text style={styles.valueTitle}>Quality</Text>
                            <Text style={styles.textBody}>Only the best, healthiest plants make it from our nursery to your home.</Text>
                        </View>
                    </View>

                    <View style={styles.valueCard}>
                        <View style={styles.iconContainer}><HeartPulse color={Theme.colors.primaryDark} size={28} /></View>
                        <View style={styles.valueTextContainer}>
                            <Text style={styles.valueTitle}>Wellness</Text>
                            <Text style={styles.textBody}>Promoting natural remedies to support your physical and mental health.</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

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
        paddingBottom: Theme.spacing.xl,
    },
    heroSection: {
        height: 250,
        position: 'relative',
        marginBottom: Theme.spacing.l,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Theme.spacing.l,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: Theme.spacing.sm,
    },
    heroSubtitle: {
        fontSize: Theme.typography.h3.fontSize,
        color: '#E0E0E0',
        textAlign: 'center',
    },
    section: {
        padding: Theme.spacing.l,
        backgroundColor: Theme.colors.surface,
        marginBottom: Theme.spacing.m,
    },
    sectionTitle: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
        marginBottom: Theme.spacing.m,
    },
    textBody: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        lineHeight: 24,
    },
    valuesSection: {
        padding: Theme.spacing.l,
        backgroundColor: Theme.colors.surface,
    },
    valueCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Theme.spacing.l,
        backgroundColor: Theme.colors.primaryLight + '20',
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.m,
    },
    valueTextContainer: {
        flex: 1,
    },
    valueTitle: {
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.xs,
    }
});
