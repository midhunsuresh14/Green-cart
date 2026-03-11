import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/theme';
import { Leaf } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
    // Animation Values
    const logoTranslateY = useRef(new Animated.Value(50)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    // Swipe effect (gradient overlay that wipes across)
    const wipeTranslateX = useRef(new Animated.Value(-width)).current;

    // Overall screen exit fade
    const screenOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // 1. Initial Logo Entrance (Spring up + fade in)
        Animated.parallel([
            Animated.spring(logoTranslateY, {
                toValue: 0,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 800,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            })
        ]).start(() => {

            // 2. Beautiful wiping light reflection effect
            Animated.timing(wipeTranslateX, {
                toValue: width,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start(() => {

                // 3. Pause for a second to admire, then fade out screen and navigate
                setTimeout(() => {
                    Animated.timing(screenOpacity, {
                        toValue: 0,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }).start(() => {
                        // Navigate to Main Application and clear history
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainTab' }], // Name defined in AppNavigator.js
                        });
                    });
                }, 800);

            });

        });
    }, [navigation]);

    return (
        <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
            <LinearGradient
                colors={['#065f46', '#047857', '#0f766e']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Main content container */}
            <Animated.View style={[styles.content, { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] }]}>

                {/* Logo Icon */}
                <View style={styles.iconContainer}>
                    <Leaf color="#fff" size={60} fill="#fff" />

                    {/* Light Sweep Reflection Effect */}
                    <View style={styles.wipeContainer}>
                        <Animated.View style={[styles.wipeGradient, { transform: [{ translateX: wipeTranslateX }] }]}>
                            <LinearGradient
                                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                    </View>
                </View>

                {/* Text Title */}
                <Text style={styles.title}>GreenCart</Text>
                <Text style={styles.subtitle}>Your Digital Oasis</Text>

            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.l,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        overflow: 'hidden', // Contains the wipe effect
        ...Theme.shadows.medium,
        shadowColor: '#000',
    },
    wipeContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    wipeGradient: {
        width: '150%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        transform: [{ skewX: '-20deg' }], // Dynamic reflection angle
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
        fontWeight: '500',
        letterSpacing: 0.5,
    }
});
