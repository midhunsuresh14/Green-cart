import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/main/ProfileScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import AboutScreen from '../screens/main/AboutScreen';
import ContactScreen from '../screens/main/ContactScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="OrdersHistory" component={OrdersScreen} />
            <Stack.Screen name="WishlistScreen" component={WishlistScreen} />
            <Stack.Screen name="AboutScreen" component={AboutScreen} />
            <Stack.Screen name="ContactScreen" component={ContactScreen} />
        </Stack.Navigator>
    );
}
