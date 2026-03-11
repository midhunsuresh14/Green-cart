import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Dimensions, Animated, Easing, ImageBackground
} from 'react-native';
import { Theme } from '../../constants/theme';
import { Leaf, Search, Sun, HeartPulse, ScanLine, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import GrowingPlantAnimation from '../../components/ui/GrowingPlantAnimation';

const { width } = Dimensions.get('window');

// A premium unsplash plant image for the hero
const HERO_IMAGE = 'https://images.unsplash.com/photo-1416879598555-52054fb4a22c?q=80&w=1000&auto=format&fit=crop';

export default function HomeScreen({ navigation }) {
    const [stats, setStats] = useState({ users: 5000, plants: 10000, accuracy: 95 });

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(50)).current;
    const cardsOpacity = useRef(new Animated.Value(0)).current;
    const cardsTranslate = useRef(new Animated.Value(30)).current;

    // Breathing animation for the plant background
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // 1. Entrance Animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(300),
                Animated.parallel([
                    Animated.timing(cardsOpacity, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(cardsTranslate, {
                        toValue: 0,
                        duration: 600,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    })
                ])
            ])
        ]).start();

        // 2. Continuous Breathing Animation for Hero Image
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.08,
                    duration: 8000, // Very slow, graceful scale
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 8000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const features = [
        { title: 'Identify Plant', subtitle: 'AI Scanner', icon: ScanLine, route: 'IdentifyTab', colors: ['#10b981', '#059669'] },
        { title: 'Crop Planner', subtitle: 'Weather Based', icon: Sun, route: 'ProductsTab', colors: ['#f59e0b', '#d97706'] },
        { title: 'Remedies', subtitle: 'Natural Cures', icon: HeartPulse, route: 'ProductsTab', colors: ['#8b5cf6', '#6d28d9'] },
        { title: 'Shop Now', subtitle: 'Premium Plants', icon: Leaf, route: 'ProductsTab', colors: ['#3b82f6', '#2563eb'] },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Hero Section with Parallax/Breathing Image & Glassmorphism */}
                <Animated.View style={[styles.heroContainer, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
                    <View style={styles.imageOverflowHider}>
                        <Animated.Image
                            source={{ uri: HERO_IMAGE }}
                            style={[styles.heroBgImage, { transform: [{ scale: scaleAnim }] }]}
                        />
                        <LinearGradient
                            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
                            style={StyleSheet.absoluteFill}
                        />

                        <View style={styles.heroContent}>
                            <BlurView intensity={30} tint="light" style={styles.blurBadge}>
                                <Text style={styles.badgeText}>✨ Welcome to GreenCart</Text>
                            </BlurView>

                            <Text style={styles.heroTitle}>Grow Smart.{"\n"}Live Green.</Text>
                            <Text style={styles.heroSubtitle}>Your premium AI companion for plants, crops, and natural remedies.</Text>

                            <TouchableOpacity style={styles.primaryAction} activeOpacity={0.9} onPress={() => navigation.navigate('ProductsTab')}>
                                <LinearGradient colors={['#10b981', '#059669']} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                    <Text style={styles.actionText}>Explore Shop</Text>
                                    <ArrowRight color="#FFF" size={20} style={{ marginLeft: 8 }} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                {/* --- NEW: Interactive Growing Plant Animation --- */}
                <Animated.View style={[styles.animationSection, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
                    <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Your Garden Growth</Text>
                    <Text style={styles.animationSubtitle}>Watch your virtual plant thrive as you identify more.</Text>
                    <GrowingPlantAnimation />
                </Animated.View>

                {/* Animated Staggered Feature Grid */}
                <View style={styles.popularSection}>
                    <Animated.Text style={[styles.sectionTitle, { opacity: fadeAnim }]}>AI & Services</Animated.Text>

                    <View style={styles.featuresGrid}>
                        {features.map((item, index) => {
                            const Icon = item.icon;
                            // Adding staggered delay effect for child cards conceptually matching the main card group
                            const cardDelay = Animated.multiply(cardsTranslate, new Animated.Value(1 + (index * 0.2)));

                            return (
                                <Animated.View
                                    key={index}
                                    style={[
                                        styles.featureCardWrapper,
                                        { opacity: cardsOpacity, transform: [{ translateY: cardDelay }] }
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.featureCard}
                                        onPress={() => navigation.navigate(item.route)}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient colors={item.colors} style={styles.iconGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                            <Icon color="#FFF" size={28} />
                                        </LinearGradient>
                                        <Text style={styles.featureTitle}>{item.title}</Text>
                                        <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>

                {/* Glassmorphism Impact Stats */}
                <Animated.View style={[styles.statsSection, { opacity: cardsOpacity, transform: [{ translateY: cardsTranslate }] }]}>
                    <LinearGradient colors={['#ecfdf5', '#d1fae5']} style={styles.statsGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={styles.statsMainTitle}>Our Global Impact</Text>
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{stats.plants}+</Text>
                                <Text style={styles.statLabel}>Scans</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{stats.users}+</Text>
                                <Text style={styles.statLabel}>Users</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statNumber}>{stats.accuracy}%</Text>
                                <Text style={styles.statLabel}>Accuracy</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // Very subtle cool gray background for premium contrast
    },
    scrollContent: {
        paddingBottom: 100, // Room for bottom tabs
    },
    heroContainer: {
        marginHorizontal: Theme.spacing.m,
        marginTop: Theme.spacing.s,
        borderRadius: 24,
        ...Theme.shadows.medium,
        shadowColor: '#10b981',
        shadowOpacity: 0.2,
        elevation: 10,
    },
    imageOverflowHider: {
        borderRadius: 24,
        overflow: 'hidden',
        height: 380,
        backgroundColor: Theme.colors.primaryDark,
        position: 'relative',
    },
    heroBgImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    heroContent: {
        flex: 1,
        padding: Theme.spacing.l,
        justifyContent: 'flex-end',
    },
    blurBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: Theme.spacing.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    badgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    heroTitle: {
        fontSize: 38,
        fontWeight: '900',
        color: '#FFFFFF',
        lineHeight: 44,
        letterSpacing: -0.5,
        marginBottom: Theme.spacing.xs,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    heroSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 22,
        marginBottom: Theme.spacing.l,
        maxWidth: '90%',
    },
    primaryAction: {
        alignSelf: 'flex-start',
        borderRadius: 100,
        overflow: 'hidden',
        ...Theme.shadows.small,
        shadowColor: '#10b981',
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    actionText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    animationSection: {
        paddingHorizontal: Theme.spacing.m,
        marginTop: Theme.spacing.xl,
        alignItems: 'center',
    },
    animationSubtitle: {
        fontSize: 14,
        color: Theme.colors.textLight,
        marginTop: 4,
        marginBottom: Theme.spacing.l,
    },
    popularSection: {
        padding: Theme.spacing.m,
        marginTop: Theme.spacing.m,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Theme.colors.text,
        marginBottom: Theme.spacing.l,
        letterSpacing: -0.3,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureCardWrapper: {
        width: (width - Theme.spacing.m * 3) / 2,
        marginBottom: Theme.spacing.m,
    },
    featureCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: Theme.spacing.l,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        ...Theme.shadows.medium,
        shadowColor: 'rgba(0,0,0,0.06)',
    },
    iconGradient: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.m,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Theme.colors.text,
        marginBottom: 4,
    },
    featureSubtitle: {
        fontSize: 13,
        color: Theme.colors.textLight,
        fontWeight: '500',
    },
    statsSection: {
        marginHorizontal: Theme.spacing.m,
        marginBottom: Theme.spacing.xl,
        borderRadius: 24,
        overflow: 'hidden',
        ...Theme.shadows.medium,
        shadowColor: '#10b981',
    },
    statsGradient: {
        padding: Theme.spacing.l,
        alignItems: 'center',
    },
    statsMainTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#059669',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Theme.spacing.l,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        height: '80%',
        alignSelf: 'center',
    },
    statNumber: {
        fontSize: 26,
        fontWeight: '900',
        color: '#047857',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#059669',
        fontWeight: '600',
    }
});
