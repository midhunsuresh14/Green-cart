import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GrowingPlantAnimation() {
    const potTranslate = useRef(new Animated.Value(50)).current;
    const potOpacity = useRef(new Animated.Value(0)).current;
    const stemHeight = useRef(new Animated.Value(0)).current;

    // Leaves
    const leaf1Scale = useRef(new Animated.Value(0)).current;
    const leaf2Scale = useRef(new Animated.Value(0)).current;
    const leaf3Scale = useRef(new Animated.Value(0)).current;

    // Glowing aura
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const glowScale = useRef(new Animated.Value(0.5)).current;

    // Swaying
    const sway = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            // 1. Pot Appears (Slide + Fade)
            Animated.parallel([
                Animated.timing(potOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.spring(potTranslate, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true })
            ]),

            // 2. Stem Grows up
            Animated.timing(stemHeight, { toValue: 120, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: false }),

            // 3. Leaves pop with Spring physics, slightly staggered
            Animated.stagger(150, [
                Animated.spring(leaf1Scale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
                Animated.spring(leaf2Scale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
                Animated.spring(leaf3Scale, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true })
            ]),

            // 4. Glow aura appears behind
            Animated.parallel([
                Animated.timing(glowOpacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
                Animated.spring(glowScale, { toValue: 1, friction: 8, useNativeDriver: true })
            ])
        ]).start(() => {
            // Sway loop simulating gentler, but much more noticeable breeze
            Animated.loop(
                Animated.sequence([
                    Animated.timing(sway, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(sway, { toValue: -1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(sway, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ).start();
        });
    }, []);

    const swayRotate = sway.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-14deg', '14deg']
    });

    return (
        <View style={styles.container}>
            {/* Glowing Aura Background */}
            <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />

            {/* The Plant that sways together */}
            <Animated.View style={[styles.plantContainer, { transform: [{ rotate: swayRotate }] }]}>

                {/* Center Stem */}
                <Animated.View style={[styles.stem, { height: stemHeight }]} />

                {/* Left Leaf */}
                <Animated.View style={[styles.leafContainer, styles.leaf1, { transform: [{ scale: leaf1Scale }, { rotate: '-55deg' }] }]}>
                    <Leaf color="#059669" size={42} fill="#34d399" />
                </Animated.View>

                {/* Right Leaf */}
                <Animated.View style={[styles.leafContainer, styles.leaf2, { transform: [{ scale: leaf2Scale }, { rotate: '55deg' }] }]}>
                    <Leaf color="#047857" size={38} fill="#10b981" />
                </Animated.View>

                {/* Top Leaf */}
                <Animated.View style={[styles.leafContainer, styles.leaf3, { transform: [{ scale: leaf3Scale }, { rotate: '0deg' }] }]}>
                    <Leaf color="#064e3b" size={48} fill="#059669" />
                </Animated.View>

            </Animated.View>

            {/* The Pot stays stationary */}
            <Animated.View style={[styles.potContainer, { opacity: potOpacity, transform: [{ translateY: potTranslate }] }]}>
                <View style={styles.potLip} />
                <LinearGradient
                    colors={['#f59e0b', '#b45309']}
                    style={styles.potInner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 220,
        marginVertical: 20,
    },
    glow: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#a7f3d0',
        top: 20,
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 10,
    },
    plantContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 140,
        // Anchor the rotation to the bottom center (where the stem meets the pot)
        transformOrigin: 'bottom',
    },
    stem: {
        width: 8,
        backgroundColor: '#059669',
        borderRadius: 4,
        position: 'absolute',
        bottom: 0,
    },
    leafContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    leaf1: {
        bottom: 40,
        left: -25,
        transformOrigin: 'bottom right',
    },
    leaf2: {
        bottom: 60,
        right: -25,
        transformOrigin: 'bottom left',
    },
    leaf3: {
        bottom: 110,
        transformOrigin: 'bottom',
    },
    potContainer: {
        alignItems: 'center',
        marginTop: -5, // slight overlap with stem
        zIndex: 10,
    },
    potLip: {
        width: 70,
        height: 12,
        backgroundColor: '#d97706',
        borderRadius: 6,
        marginBottom: -4,
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    potInner: {
        width: 54,
        height: 50,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    }
});
