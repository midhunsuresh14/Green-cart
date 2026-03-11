import React, { useContext } from 'react';
import { createBottomTabNavigator as createTabNav } from '@react-navigation/bottom-tabs';
import { Home, Search, Leaf, ShoppingCart, User } from 'lucide-react-native';
import { Theme } from '../constants/theme';
import { CartContext } from '../context/CartContext';

import HomeStackNavigator from './HomeStackNavigator';
import ProductsScreen from '../screens/main/ProductsScreen';
import CartScreen from '../screens/main/CartScreen';
import ProfileStackNavigator from './ProfileStackNavigator';
import IdentifyScreen from '../screens/main/IdentifyScreen';

const Tab = createTabNav();

export default function MainTabNavigator() {
    const { cartCount } = useContext(CartContext);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Theme.colors.primary,
                tabBarInactiveTintColor: Theme.colors.textLight,
                tabBarStyle: {
                    backgroundColor: Theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: Theme.colors.border,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                }
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
                }}
            />

            <Tab.Screen
                name="ProductsTab"
                component={ProductsScreen}
                options={{
                    tabBarLabel: 'Products',
                    tabBarIcon: ({ color, size }) => <Search color={color} size={size} />
                }}
            />

            <Tab.Screen
                name="IdentifyTab"
                component={IdentifyScreen}
                options={{
                    tabBarLabel: 'Identify',
                    tabBarIcon: ({ color, size }) => <Leaf color={color} size={size} />
                }}
            />

            <Tab.Screen
                name="CartTab"
                component={CartScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
                    tabBarBadge: cartCount > 0 ? cartCount : null,
                    tabBarBadgeStyle: { backgroundColor: Theme.colors.primary }
                }}
            />

            <Tab.Screen
                name="ProfileTab"
                component={ProfileStackNavigator}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />
                }}
            />
        </Tab.Navigator>
    );
}
