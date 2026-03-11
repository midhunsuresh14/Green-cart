import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext } from '../context/AuthContext';
import { Theme } from '../constants/theme';

import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import SplashScreen from '../screens/main/SplashScreen';
import ARViewerScreen from '../screens/main/ARViewerScreen';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isLoading, token } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background }}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
                {/* Initial Animated Splash Screen */}
                <RootStack.Screen name="Splash" component={SplashScreen} />

                {/* We keep MainTab available to everyone. Unauthenticated users are prompted in specific tabs */}
                <RootStack.Screen name="MainTab" component={MainTabNavigator} />

                {/* Global screens that go over the tabs */}
                <RootStack.Screen name="Checkout" component={CheckoutScreen} />

                {/* 3D AR Viewer Screen */}
                <RootStack.Screen
                    name="ARViewer"
                    component={ARViewerScreen}
                    options={{ presentation: 'fullScreenModal' }}
                />

                {/* Auth flow pushed globally */}
                {!token && (
                    <RootStack.Group screenOptions={{ presentation: 'modal' }}>
                        <RootStack.Screen name="Auth" component={AuthNavigator} />
                    </RootStack.Group>
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
