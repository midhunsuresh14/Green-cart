import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Theme } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { Package, Heart, LogOut, Shield, Settings, Mail } from 'lucide-react-native';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
        await logout();
        // After logout, the navigation state might automatically handle it 
        // depending on conditionals in AppNavigator, but since we are showing tabs anyway:
        navigation.navigate('HomeTab');
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.unauthContainer}>
                    <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.unauthImage} />
                    <Text style={styles.unauthTitle}>Join the Community</Text>
                    <Text style={styles.unauthSubtitle}>Sign in to track orders, save wishlist, and more.</Text>
                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                    >
                        <Text style={styles.primaryBtnText}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
                    >
                        <Text style={styles.secondaryBtnText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: user.photo_url || 'https://via.placeholder.com/100' }} style={styles.avatar} />
                    </View>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Account</Text>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('OrdersHistory')}
                    >
                        <View style={styles.menuIconOverlay}><Package color={Theme.colors.primary} size={22} /></View>
                        <Text style={styles.menuText}>My Orders</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('WishlistScreen')}
                    >
                        <View style={styles.menuIconOverlay}><Heart color={Theme.colors.primary} size={22} /></View>
                        <Text style={styles.menuText}>Wishlist</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support & Settings</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconOverlay}><Shield color={Theme.colors.textLight} size={22} /></View>
                        <Text style={styles.menuText}>Privacy & Security</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconOverlay}><Mail color={Theme.colors.textLight} size={22} /></View>
                        <Text style={styles.menuText}>Contact Us</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut color={Theme.colors.error} size={20} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    unauthContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Theme.spacing.xl,
    },
    unauthImage: {
        width: 150,
        height: 150,
        marginBottom: Theme.spacing.l,
        borderRadius: Theme.borderRadius.xl,
    },
    unauthTitle: {
        fontSize: Theme.typography.h1.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.primaryDark,
        marginBottom: Theme.spacing.s,
        textAlign: 'center',
    },
    unauthSubtitle: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        textAlign: 'center',
        marginBottom: Theme.spacing.xl,
    },
    primaryBtn: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: Theme.spacing.m,
        paddingHorizontal: Theme.spacing.xl,
        borderRadius: Theme.borderRadius.m,
        width: '100%',
        alignItems: 'center',
        marginBottom: Theme.spacing.m,
    },
    primaryBtnText: {
        color: '#FFF',
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        backgroundColor: 'transparent',
        paddingVertical: Theme.spacing.m,
        paddingHorizontal: Theme.spacing.xl,
        borderRadius: Theme.borderRadius.m,
        borderWidth: 1,
        borderColor: Theme.colors.primary,
        width: '100%',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: Theme.colors.primary,
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
    },
    header: {
        alignItems: 'center',
        padding: Theme.spacing.xl,
        backgroundColor: Theme.colors.surface,
        borderBottomLeftRadius: Theme.borderRadius.xl,
        borderBottomRightRadius: Theme.borderRadius.xl,
        marginBottom: Theme.spacing.m,
        ...Theme.shadows.small,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.primaryLight,
        marginBottom: Theme.spacing.m,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: Theme.typography.h2.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    email: {
        fontSize: Theme.typography.body.fontSize,
        color: Theme.colors.textLight,
        marginTop: Theme.spacing.xs,
    },
    phone: {
        fontSize: Theme.typography.small.fontSize,
        color: Theme.colors.textLight,
        marginTop: 4,
    },
    section: {
        backgroundColor: Theme.colors.surface,
        marginBottom: Theme.spacing.m,
        paddingVertical: Theme.spacing.s,
    },
    sectionTitle: {
        fontSize: Theme.typography.body.fontSize,
        fontWeight: 'bold',
        color: Theme.colors.textLight,
        paddingHorizontal: Theme.spacing.l,
        paddingVertical: Theme.spacing.s,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.m,
        paddingHorizontal: Theme.spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.background,
    },
    menuIconOverlay: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.m,
    },
    menuText: {
        flex: 1,
        fontSize: Theme.typography.body.fontSize,
        fontWeight: '500',
        color: Theme.colors.text,
    },
    menuArrow: {
        fontSize: 20,
        color: Theme.colors.textLight,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Theme.spacing.xl,
        padding: Theme.spacing.m,
    },
    logoutText: {
        color: Theme.colors.error,
        fontSize: Theme.typography.h3.fontSize,
        fontWeight: 'bold',
        marginLeft: Theme.spacing.s,
    }
});
